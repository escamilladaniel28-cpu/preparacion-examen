import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyAccessToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ----------------------------------------------------
// Helper para verificar sesión y rol ADMIN
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
// GET /api/admin/users (Listar usuarios - Solo ADMIN)
// ----------------------------------------------------
export async function GET(request: Request) {
  try {
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            reservations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error('Error en GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar usuarios' },
      { status: 500 }
    );
  }
}
