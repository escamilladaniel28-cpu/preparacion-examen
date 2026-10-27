import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyAccessToken } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

// ----------------------------------------------------
// Handler principal de cancelación
// ----------------------------------------------------
async function handleCancel(request: Request, context: RouteContext) {
  try {
    // 1. Autenticación (Cookies o Header Authorization)
    let session = await getSession();
    if (!session || !session.userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        session = await verifyAccessToken(authHeader.substring(7));
      } else {
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          const match = cookieHeader.match(/access_token=([^;]+)/);
          if (match) {
            session = await verifyAccessToken(match[1]);
          }
        }
      }
    }

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión' },
        { status: 401 }
      );
    }

    // 2. Extraer y resolver parámetros de ruta
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID de reserva inválido' },
        { status: 400 }
      );
    }

    // 3. Existencia: Buscar la reserva
    const reservation = await prisma.reservation.findUnique({
      where: { id },
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
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'La reserva no existe' },
        { status: 404 }
      );
    }

    // 4. Autorización (Regla 9): Dueño o Administrador
    const isOwner = reservation.userId === session.userId;
    const isAdmin = session.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para cancelar esta reserva' },
        { status: 403 }
      );
    }

    // 5. Estado: Si ya está cancelada
    if (reservation.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'La reserva ya fue cancelada previamente' },
        { status: 400 }
      );
    }

    // 6. Tiempo (Regla 10): Al menos 2 horas antes del startTime si es usuario regular
    if (!isAdmin) {
      const now = new Date();
      const twoHoursInMs = 2 * 60 * 60 * 1000;
      const timeUntilStart = reservation.startTime.getTime() - now.getTime();

      if (timeUntilStart < twoHoursInMs) {
        return NextResponse.json(
          { error: 'No puedes cancelar con menos de 2 horas de anticipación' },
          { status: 400 }
        );
      }
    }

    // 7. Actualización (Regla 11): Actualizar estado a CANCELLED (sin eliminar registro)
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'CANCELLED' },
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
    });

    // 8. Respuesta 200 OK con la reserva actualizada
    return NextResponse.json(
      {
        message: 'Reserva cancelada exitosamente',
        reservation: updatedReservation,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error en PATCH /api/reservations/[id]/cancel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al cancelar la reserva' },
      { status: 500 }
    );
  }
}

// Exportar tanto PATCH como POST para máxima compatibilidad
export async function PATCH(request: Request, context: RouteContext) {
  return handleCancel(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleCancel(request, context);
}
