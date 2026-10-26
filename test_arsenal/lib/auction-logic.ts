export type AuctionStatus = 'ACTIVE' | 'CLOSED' | 'DESERTED' | 'CANCELLED';

export interface AuctionLike {
  endsAt: Date | string;
  cancelledAt?: Date | string | null;
  startingPrice: number;
  minIncrement: number;
  sellerId: string;
  bids?: { amount: number | { toNumber(): number }; bidderId?: string }[];
}

/**
 * Calcula el estado dinámico de una subasta en función de fechas, cancelaciones y ofertas.
 * El estado NUNCA se persiste en la BD.
 */
export function calculateAuctionStatus(
  auction: Pick<AuctionLike, 'endsAt' | 'cancelledAt' | 'bids'>,
  now: Date = new Date()
): AuctionStatus {
  if (auction.cancelledAt) {
    return 'CANCELLED';
  }

  const end = new Date(auction.endsAt).getTime();
  const current = now.getTime();

  if (current < end) {
    return 'ACTIVE';
  }

  const hasBids = auction.bids && auction.bids.length > 0;
  return hasBids ? 'CLOSED' : 'DESERTED';
}

export interface ValidateBidParams {
  auction: AuctionLike;
  bidAmount: number;
  userId: string;
}

export interface BidValidationResult {
  isValid: boolean;
  error?: string;
  code?: 'ALREADY_HIGHEST_BIDDER' | 'INVALID_STATUS' | 'OWN_AUCTION' | 'INSUFFICIENT_AMOUNT';
  minimumRequiredBid: number;
}

/**
 * Valida si un usuario y un monto son válidos para ofertar en una subasta.
 */
export function validateBid({
  auction,
  bidAmount,
  userId,
}: ValidateBidParams): BidValidationResult {
  const currentStatus = calculateAuctionStatus(auction);

  if (currentStatus !== 'ACTIVE') {
    return {
      isValid: false,
      error: `La subasta no está activa (Estado actual: ${currentStatus})`,
      code: 'INVALID_STATUS',
      minimumRequiredBid: 0,
    };
  }

  if (auction.sellerId === userId) {
    return {
      isValid: false,
      error: 'El creador de la subasta no puede pujar en su propia subasta',
      code: 'OWN_AUCTION',
      minimumRequiredBid: 0,
    };
  }

  const topBid = auction.bids && auction.bids.length > 0 ? auction.bids[0] : null;

  // Regla crítica: El usuario con la oferta más alta actual no puede volver a ofertar
  if (topBid && topBid.bidderId === userId) {
    return {
      isValid: false,
      error: 'Ya tienes la oferta más alta de esta subasta',
      code: 'ALREADY_HIGHEST_BIDDER',
      minimumRequiredBid: 0,
    };
  }

  const highestBid = topBid ? Number(topBid.amount) : null;
  const minIncrement = Number(auction.minIncrement) || 1.0;
  const startingPrice = Number(auction.startingPrice);

  const minimumRequiredBid = highestBid !== null
    ? highestBid + minIncrement
    : startingPrice;

  if (bidAmount < minimumRequiredBid) {
    return {
      isValid: false,
      error: `La oferta debe ser de al menos $${minimumRequiredBid.toFixed(2)}`,
      code: 'INSUFFICIENT_AMOUNT',
      minimumRequiredBid,
    };
  }

  return {
    isValid: true,
    minimumRequiredBid,
  };
}
