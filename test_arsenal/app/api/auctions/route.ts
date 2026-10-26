import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const createAuctionSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  imageUrl: z.string().url('URL de imagen inválida').optional().nullable(),
  startingPrice: z.number().positive('El precio inicial debe ser positivo'),
  minIncrement: z.number().positive('El incremento mínimo debe ser positivo'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  endsAt: z.string().refine(
    (val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      return date.getTime() >= now + oneHour && date.getTime() <= now + sevenDays;
    },
    {
      message: 'La fecha de finalización (endsAt) debe estar entre 1 hora y 7 días a partir de ahora',
    }
  ),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para crear una subasta' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createAuctionSchema.parse(body);

    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'La categoría especificada no existe' },
        { status: 404 }
      );
    }

    const auction = await prisma.auction.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        startingPrice: validatedData.startingPrice,
        minIncrement: validatedData.minIncrement,
        endsAt: new Date(validatedData.endsAt),
        sellerId: session.userId,
        categoryId: validatedData.categoryId,
      },
    });

    return NextResponse.json(
      {
        message: 'Subasta creada exitosamente',
        auction,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('Error en POST /api/auctions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear la subasta' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const auctions = await prisma.auction.findMany({
      include: {
        category: true,
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ auctions });
  } catch (error: unknown) {
    console.error('Error en GET /api/auctions:', error);
    return NextResponse.json(
      { error: 'Error al obtener subastas' },
      { status: 500 }
    );
  }
}
