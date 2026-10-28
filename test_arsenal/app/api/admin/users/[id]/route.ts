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
// PATCH /api/admin/users/[id] (Modificar rol o estado de usuario)
// ----------------------------------------------------
export async function PATCH(request: Request, context: RouteContext) {
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

    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'El usuario no existe' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Protección de auto-bloqueo: el administrador no puede desactivarse ni quitarse el rol de admin a sí mismo
    if (
      session.userId === id &&
      (body.isActive === false || body.role === 'USER')
    ) {
      return NextResponse.json(
        {
          error:
            'Por seguridad, no puedes desactivar tu propia cuenta ni revocar tus propios privilegios de administrador.',
        },
        { status: 400 }
      );
    }

    const updateData: { role?: 'USER' | 'ADMIN'; isActive?: boolean } = {};

    if (body.role !== undefined) {
      if (body.role === 'ADMIN' || body.role === 'USER') {
        updateData.role = body.role;
      } else {
        return NextResponse.json(
          { error: 'Rol inválido. Debe ser USER o ADMIN' },
          { status: 400 }
        );
      }
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive === 'boolean') {
        updateData.isActive = body.isActive;
      } else {
        return NextResponse.json(
          { error: 'El campo isActive debe ser booleano' },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Debes proporcionar al menos un campo para actualizar (role o isActive)' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuario actualizado exitosamente',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error en PATCH /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar usuario' },
      { status: 500 }
    );
  }
}
