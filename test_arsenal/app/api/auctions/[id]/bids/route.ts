import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateBid } from '@/lib/auction-logic';

const bidSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para ofertar' },
        { status: 401 }
      );
    }

    const { id: auctionId } = await params;
    const body = await request.json();
    const validatedData = bidSchema.parse(body);

    // Transacción atómica para serializar ofertas concurrentes
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            select: { amount: true, bidderId: true },
          },
        },
      });

      if (!auction) {
        throw new Error('AUCTION_NOT_FOUND');
      }

      const validation = validateBid({
        auction: {
          endsAt: auction.endsAt,
          cancelledAt: auction.cancelledAt,
          startingPrice: Number(auction.startingPrice),
          minIncrement: Number(auction.minIncrement),
          sellerId: auction.sellerId,
          bids: auction.bids.map((b) => ({
            amount: Number(b.amount),
            bidderId: b.bidderId,
          })),
        },
        bidAmount: validatedData.amount,
        userId: session.userId,
      });

      if (!validation.isValid) {
        const error = new Error(validation.error || 'Oferta inválida');
        error.name = validation.code || 'VALIDATION_ERROR';
        throw error;
      }

      // Registrar la nueva oferta
      const newBid = await tx.bid.create({
        data: {
          amount: validatedData.amount,
          auctionId: auction.id,
          bidderId: session.userId,
        },
      });

      // Lógica de Anti-Sniping: si falta <= 5 minutos, extender endsAt 5 minutos más
      const now = new Date();
      const fiveMinutesMs = 5 * 60 * 1000;
      const timeRemaining = new Date(auction.endsAt).getTime() - now.getTime();

      let updatedEndsAt = auction.endsAt;
      if (timeRemaining <= fiveMinutesMs && timeRemaining > 0) {
        updatedEndsAt = new Date(new Date(auction.endsAt).getTime() + fiveMinutesMs);
        await tx.auction.update({
          where: { id: auction.id },
          data: {
            endsAt: updatedEndsAt,
          },
        });
      }

      return { newBid, endsAt: updatedEndsAt };
    });

    return NextResponse.json(
      {
        message: 'Oferta realizada con éxito',
        bid: result.newBid,
        endsAt: result.endsAt,
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

    if (error instanceof Error) {
      if (error.message === 'AUCTION_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Subasta no encontrada' },
          { status: 404 }
        );
      }
      if (error.name === 'ALREADY_HIGHEST_BIDDER') {
        return NextResponse.json(
          { error: 'Ya tienes la oferta más alta de esta subasta', code: 'ALREADY_HIGHEST_BIDDER' },
          { status: 400 }
        );
      }
      if (error.name === 'VALIDATION_ERROR' || error.name === 'OWN_AUCTION' || error.name === 'INVALID_STATUS' || error.name === 'INSUFFICIENT_AMOUNT') {
        return NextResponse.json(
          { error: error.message, code: error.name },
          { status: 400 }
        );
      }
    }

    console.error('Error en POST /api/auctions/[id]/bids:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la oferta' },
      { status: 500 }
    );
  }
}
