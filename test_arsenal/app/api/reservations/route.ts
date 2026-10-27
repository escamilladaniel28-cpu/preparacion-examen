import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, verifyAccessToken } from '@/lib/auth';

class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ----------------------------------------------------
// Schema de Validación con Zod
// ----------------------------------------------------
const createReservationSchema = z
  .object({
    spaceId: z.string().uuid({ message: 'spaceId debe ser un UUID válido' }),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'startTime debe ser una fecha ISO válida',
    }),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'endTime debe ser una fecha ISO válida',
    }),
  })
  .strict(); // Asegura que no se reciban campos inesperados como totalPrice

// ----------------------------------------------------
// POST /api/reservations (Soporte de Idempotencia estricto)
// ----------------------------------------------------
export async function POST(request: Request) {
  let idempotencyKey: string | null = null;
  try {
    // 1. Autenticación (Cookies o Header Authorization)
    let session = await getSession();
    if (!session || !session.userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        session = await verifyAccessToken(authHeader.substring(7));
      }
    }

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para realizar una reserva' },
        { status: 401 }
      );
    }

    // 2. Detección de Idempotencia (Header x-idempotency-key)
    idempotencyKey = request.headers.get('x-idempotency-key')?.trim() || null;

    if (idempotencyKey) {
      const existingKey = await prisma.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existingKey) {
        let existingReservation = null;
        if (existingKey.action.startsWith('CREATE_RESERVATION:')) {
          const reservationId = existingKey.action.replace('CREATE_RESERVATION:', '');
          existingReservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
              space: {
                select: {
                  id: true,
                  name: true,
                  pricePerHour: true,
                  imageUrl: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });
        }

        return NextResponse.json(
          {
            message: 'Operación ya procesada (Respuesta idempotente)',
            reservation: existingReservation,
            idempotent: true,
          },
          { status: 200 }
        );
      }
    }

    // 3. Parseo y Validación de Entrada
    const body = await request.json();
    const validationResult = createReservationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos de entrada inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { spaceId, startTime: rawStart, endTime: rawEnd } = validationResult.data;
    const start = new Date(rawStart);
    const end = new Date(rawEnd);
    const now = new Date();

    // 4. Reglas de Negocio de Fechas y Horas (pre-transacción)
    // 4.1. startTime no puede ser en el pasado
    if (start < now) {
      return NextResponse.json(
        { error: 'La fecha de inicio (startTime) no puede ser en el pasado' },
        { status: 400 }
      );
    }

    // 4.2. startTime no puede ser mayor a 30 días desde hoy
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (start > thirtyDaysFromNow) {
      return NextResponse.json(
        { error: 'No se permiten reservas con más de 30 días de anticipación' },
        { status: 400 }
      );
    }

    // 4.3. endTime debe ser estrictamente posterior a startTime
    if (end <= start) {
      return NextResponse.json(
        { error: 'La fecha de fin (endTime) debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // 4.4. Horas exactas (minutos, segundos y milisegundos en 0)
    if (
      start.getUTCMinutes() !== 0 ||
      start.getUTCSeconds() !== 0 ||
      start.getUTCMilliseconds() !== 0 ||
      end.getUTCMinutes() !== 0 ||
      end.getUTCSeconds() !== 0 ||
      end.getUTCMilliseconds() !== 0
    ) {
      return NextResponse.json(
        { error: 'La reserva debe ser en horas exactas (minutos y segundos en 00)' },
        { status: 400 }
      );
    }

    // 4.5. Duración de 1 a 4 horas exactas
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 4) {
      return NextResponse.json(
        { error: 'La duración de la reserva debe ser de 1 a 4 horas exactas' },
        { status: 400 }
      );
    }

    // 4.6. Horario permitido entre las 07:00 y las 21:00 (mismo día calendario)
    const startHour = start.getUTCHours();
    const endHour = end.getUTCHours();
    const isSameDay =
      start.getUTCFullYear() === end.getUTCFullYear() &&
      start.getUTCMonth() === end.getUTCMonth() &&
      start.getUTCDate() === end.getUTCDate();

    if (!isSameDay || startHour < 7 || endHour > 21 || (endHour === 21 && end.getUTCMinutes() > 0)) {
      return NextResponse.json(
        { error: 'Las reservas deben operar el mismo día entre las 07:00 y las 21:00' },
        { status: 400 }
      );
    }

    // 5. Transacción y Concurrencia (Garantiza atomicidad, aislamiento e idempotencia)
    const txResult = await prisma.$transaction(async (tx) => {
      // 5.0. Verificación de Idempotencia concurrente dentro de la transacción
      if (idempotencyKey) {
        const keyInTx = await tx.idempotencyKey.findUnique({
          where: { key: idempotencyKey },
        });

        if (keyInTx) {
          let existingRes = null;
          if (keyInTx.action.startsWith('CREATE_RESERVATION:')) {
            const resId = keyInTx.action.replace('CREATE_RESERVATION:', '');
            existingRes = await tx.reservation.findUnique({
              where: { id: resId },
              include: {
                space: {
                  select: { id: true, name: true, pricePerHour: true, imageUrl: true },
                },
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            });
          }
          return { reservation: existingRes, isIdempotent: true };
        }
      }

      // 5.1. Verificar existencia y estado activo del Espacio
      const space = await tx.space.findUnique({
        where: { id: spaceId },
      });

      if (!space) {
        throw new HttpError('El espacio solicitado no existe', 404);
      }

      if (!space.isActive) {
        throw new HttpError('No se puede reservar un espacio desactivado', 400);
      }

      // 5.2. Límite de Reservas del Usuario: máximo 3 futuras CONFIRMED
      const futureReservationsCount = await tx.reservation.count({
        where: {
          userId: session.userId,
          status: 'CONFIRMED',
          startTime: { gte: now },
        },
      });

      if (futureReservationsCount >= 3) {
        throw new HttpError(
          'Has alcanzado el límite máximo permitido de 3 reservas futuras confirmadas',
          400
        );
      }

      // 5.3. Solapamiento del Espacio: (newStart < existingEnd) AND (newEnd > existingStart)
      const overlappingSpace = await tx.reservation.findFirst({
        where: {
          spaceId: spaceId,
          status: 'CONFIRMED',
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } },
          ],
        },
      });

      if (overlappingSpace) {
        throw new HttpError(
          'El espacio ya se encuentra reservado en el horario seleccionado',
          409
        );
      }

      // 5.4. Solapamiento del Usuario: el usuario no puede tener otra reserva CONFIRMED en ese horario
      const overlappingUser = await tx.reservation.findFirst({
        where: {
          userId: session.userId,
          status: 'CONFIRMED',
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } },
          ],
        },
      });

      if (overlappingUser) {
        throw new HttpError(
          'Ya tienes otra reserva confirmada que se cruza con este horario',
          409
        );
      }

      // 5.5. Cálculo del Precio en el servidor
      const pricePerHour = Number(space.pricePerHour);
      const totalPrice = Number((pricePerHour * durationHours).toFixed(2));

      // 5.6. Crear la reserva
      const createdReservation = await tx.reservation.create({
        data: {
          spaceId: space.id,
          userId: session.userId,
          startTime: start,
          endTime: end,
          totalPrice,
          status: 'CONFIRMED',
        },
        include: {
          space: {
            select: {
              id: true,
              name: true,
              pricePerHour: true,
              imageUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // 5.7. Registrar clave de idempotencia en la misma transacción atómica
      if (idempotencyKey) {
        await tx.idempotencyKey.create({
          data: {
            key: idempotencyKey,
            userId: session.userId,
            action: `CREATE_RESERVATION:${createdReservation.id}`,
          },
        });
      }

      return { reservation: createdReservation, isIdempotent: false };
    });

    if (txResult.isIdempotent) {
      return NextResponse.json(
        {
          message: 'Operación ya procesada (Respuesta idempotente)',
          reservation: txResult.reservation,
          idempotent: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: 'Reserva creada exitosamente',
        reservation: txResult.reservation,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    // Detección de colisión concurrente de clave de idempotencia (Prisma P2002)
    if ((error as { code?: string })?.code === 'P2002' && idempotencyKey) {
      try {
        const existingKey = await prisma.idempotencyKey.findUnique({
          where: { key: idempotencyKey },
        });
        if (existingKey && existingKey.action.startsWith('CREATE_RESERVATION:')) {
          const reservationId = existingKey.action.replace('CREATE_RESERVATION:', '');
          const existingReservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
              space: { select: { id: true, name: true, pricePerHour: true, imageUrl: true } },
              user: { select: { id: true, name: true, email: true } },
            },
          });
          return NextResponse.json(
            {
              message: 'Operación ya procesada (Respuesta idempotente)',
              reservation: existingReservation,
              idempotent: true,
            },
            { status: 200 }
          );
        }
      } catch {
        // Fallback al error general
      }
    }

    console.error('Error en POST /api/reservations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la reserva' },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------
// GET /api/reservations (Consulta de reservas)
// ----------------------------------------------------
export async function GET(request: Request) {
  try {
    let session = await getSession();
    if (!session || !session.userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        session = await verifyAccessToken(authHeader.substring(7));
      }
    }

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');

    // Los administradores pueden ver todas las reservas; los usuarios normales solo las suyas
    const whereClause: {
      userId?: string;
      spaceId?: string;
    } = session.role === 'ADMIN' ? {} : { userId: session.userId };

    if (spaceId) {
      whereClause.spaceId = spaceId;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        space: {
          select: {
            id: true,
            name: true,
            pricePerHour: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ reservations });
  } catch (error: unknown) {
    console.error('Error en GET /api/reservations:', error);
    return NextResponse.json(
      { error: 'Error al consultar las reservas' },
      { status: 500 }
    );
  }
}
