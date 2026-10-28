import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyAccessToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
// Handler principal de reactivación de espacio
// ----------------------------------------------------
async function handleActivate(request: Request, context: RouteContext) {
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

    if (space.isActive) {
      return NextResponse.json(
        { error: 'El espacio ya se encuentra activo' },
        { status: 400 }
      );
    }

    // 4. Reactivación Lógica
    const reactivatedSpace = await prisma.space.update({
      where: { id },
      data: { isActive: true },
    });

    return NextResponse.json(
      {
        message: 'Espacio reactivado exitosamente',
        space: reactivatedSpace,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error en PATCH /api/spaces/[id]/activate:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al reactivar el espacio' },
      { status: 500 }
    );
  }
}

// Exportar tanto PATCH como POST para máxima compatibilidad
export async function PATCH(request: Request, context: RouteContext) {
  return handleActivate(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleActivate(request, context);
}
