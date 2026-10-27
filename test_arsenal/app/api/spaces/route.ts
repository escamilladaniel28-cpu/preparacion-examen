import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, verifyAccessToken } from '@/lib/auth';

// ----------------------------------------------------
// Schema de validación para creación de espacios
// ----------------------------------------------------
const createSpaceSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  imageUrl: z.string().url('URL de imagen inválida').optional().nullable(),
  pricePerHour: z.number().positive('El precio por hora debe ser mayor a 0'),
});

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
// POST /api/spaces (Crear espacio - Solo ADMIN)
// ----------------------------------------------------
export async function POST(request: Request) {
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

    const body = await request.json();
    const validationResult = createSpaceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos de entrada inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, description, imageUrl, pricePerHour } = validationResult.data;

    const space = await prisma.space.create({
      data: {
        name,
        description,
        imageUrl: imageUrl || null,
        pricePerHour,
        isActive: true, // Siempre creado como activo
      },
    });

    return NextResponse.json(
      {
        message: 'Espacio creado exitosamente',
        space,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error en POST /api/spaces:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear el espacio' },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------
// GET /api/spaces (Listar espacios)
// ----------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    // Si pide inactivos, comprobar si es admin
    let whereClause = { isActive: true };
    if (includeInactive) {
      const session = await getAdminSession(request);
      if (session && session.role === 'ADMIN') {
        whereClause = undefined as any; // Retornar todos
      }
    }

    const spaces = await prisma.space.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ spaces });
  } catch (error: unknown) {
    console.error('Error en GET /api/spaces:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar los espacios' },
      { status: 500 }
    );
  }
}
