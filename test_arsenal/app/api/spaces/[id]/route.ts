import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, verifyAccessToken } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

// ----------------------------------------------------
// Schema para edición de espacios
// ----------------------------------------------------
const updateSpaceSchema = z
  .object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').optional(),
    imageUrl: z.string().url('URL de imagen inválida').nullable().optional(),
    pricePerHour: z.number().positive('El precio por hora debe ser mayor a 0').optional(),
  })
  .strict(); // Prohíbe id, isActive u otros campos no permitidos

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
// PATCH /api/spaces/[id] (Editar espacio - Solo ADMIN)
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
        { error: 'ID de espacio inválido' },
        { status: 400 }
      );
    }

    // Verificar existencia del espacio
    const existingSpace = await prisma.space.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      return NextResponse.json(
        { error: 'El espacio no existe' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = updateSpaceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos de edición inválidos o campos no permitidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Debes proporcionar al menos un campo para actualizar' },
        { status: 400 }
      );
    }

    // Actualizar únicamente los campos permitidos
    const updatedSpace = await prisma.space.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: 'Espacio actualizado exitosamente',
        space: updatedSpace,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error en PATCH /api/spaces/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar el espacio' },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------
// GET /api/spaces/[id] (Detalle de espacio)
// ----------------------------------------------------
export async function GET(request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return NextResponse.json({ error: 'Espacio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ space });
  } catch (error: unknown) {
    console.error('Error en GET /api/spaces/[id]:', error);
    return NextResponse.json({ error: 'Error al consultar espacio' }, { status: 500 });
  }
}
