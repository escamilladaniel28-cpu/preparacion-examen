import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyAccessToken } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

// ----------------------------------------------------
// Helper para verificar sesión ADMIN
// ----------------------------------------------------
async function getAdminSession(request: Request) {
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
  return session;
}

// ----------------------------------------------------
// Handler principal de desactivación de espacio
// ----------------------------------------------------
async function handleDeactivate(request: Request, context: RouteContext) {
  try {
    // 1. Autenticación y Autorización: Solo ADMIN
    const session = await getAdminSession(request);

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      );
    }

    // 2. Extraer y validar el ID del espacio
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID de espacio inválido' },
        { status: 400 }
      );
    }

    // 3. Buscar el espacio
    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return NextResponse.json(
        { error: 'El espacio no existe' },
        { status: 404 }
      );
    }

    if (!space.isActive) {
      return NextResponse.json(
        { error: 'El espacio ya se encuentra desactivado' },
        { status: 400 }
      );
    }

    // 4. Regla 13 (CRÍTICA): Verificar si existen reservas futuras CONFIRMED
    const now = new Date();
    const futureConfirmedReservation = await prisma.reservation.findFirst({
      where: {
        spaceId: id,
        status: 'CONFIRMED',
        startTime: { gt: now },
      },
    });

    if (futureConfirmedReservation) {
      return NextResponse.json(
        { error: 'No se puede desactivar un espacio con reservas futuras' },
        { status: 409 }
      );
    }

    // 5. Desactivación Lógica: NUNCA se borra el registro de la base de datos
    const deactivatedSpace = await prisma.space.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      {
        message: 'Espacio desactivado exitosamente',
        space: deactivatedSpace,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error en PATCH /api/spaces/[id]/deactivate:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al desactivar el espacio' },
      { status: 500 }
    );
  }
}

// Exportar tanto PATCH como POST para máxima compatibilidad
export async function PATCH(request: Request, context: RouteContext) {
  return handleDeactivate(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleDeactivate(request, context);
}
