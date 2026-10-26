# ARSENAL BACKEND - BidHub

Este archivo contiene la lógica crítica pre-escrita para el examen / proyecto de subastas (BidHub).

## Dependencias a instalar
```bash
npm install bcryptjs jose zod
npm install -D @types/bcryptjs
```

## Variables de Entorno
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bidhub?schema=public"
JWT_ACCESS_SECRET="cualquier_cosa_larga_y_segura_1_debe_tener_al_menos_32_caracteres"
JWT_REFRESH_SECRET="cualquier_cosa_larga_y_segura_2_debe_tener_al_menos_32_caracteres"
```

---

## 0. lib/prisma.ts (Instancia de Prisma Client)
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 1. lib/auth.ts
Lógica completa de encriptación, creación y verificación de JWTs con `jose`, gestión de cookies en Next.js App Router y recuperación de sesión actual.

```typescript
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'default_access_secret_key_change_in_production'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key_change_in_production'
);

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  tokenId?: string;
  [key: string]: unknown;
}

// ----------------------------------------------------
// Password Hashing (bcryptjs)
// ----------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ----------------------------------------------------
// JWT Sign & Verify (jose)
// ----------------------------------------------------
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: TokenPayload, tokenId: string): Promise<string> {
  return new SignJWT({ ...payload, tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// Cookies Management (Next.js App Router)
// ----------------------------------------------------
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutos
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 días
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

// ----------------------------------------------------
// Session Retrieval Helper
// ----------------------------------------------------
export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return null;
  }

  return verifyAccessToken(token);
}
```

---

## 2. app/api/auth/login/route.ts
Handler para autenticación de usuarios existentes, validación de credenciales (`passwordHash`), persistencia de `RefreshToken` hasheado (`bcrypt.hash`) en BD y establecimiento de cookies.

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const tokenId = crypto.randomUUID();
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload, tokenId);

    // Guardar token hasheado en DB (NUNCA en texto plano)
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('Error en POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

---

## 3. app/api/auth/refresh/route.ts
Renovación de tokens mediante el `refresh_token` almacenado en la cookie HTTP-only. Valida que el token no haya sido revocado en la BD, compara contra el hash (`bcrypt.compare`), rota el token atómicamente con `prisma.$transaction` y marca el anterior con `revokedAt: new Date()`.

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No se encontró el token de actualización' },
        { status: 401 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);

    if (!payload || !payload.userId || !payload.tokenId) {
      return NextResponse.json(
        { error: 'Token de actualización inválido o expirado' },
        { status: 401 }
      );
    }

    // Buscar el token en base de datos
    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId as string },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token revocado o expirado' },
        { status: 401 }
      );
    }

    // Comparar contra el hash en base de datos
    const isTokenMatch = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isTokenMatch) {
      return NextResponse.json(
        { error: 'Token inválido o manipulado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newTokenId = crypto.randomUUID();
    const newAccessToken = await signAccessToken(tokenPayload);
    const newRefreshToken = await signRefreshToken(tokenPayload, newTokenId);
    const newTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Rotación atómica de tokens: revocar el anterior y registrar el nuevo
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      await tx.refreshToken.create({
        data: {
          id: newTokenId,
          tokenHash: newTokenHash,
          userId: user.id,
          expiresAt: newExpiresAt,
        },
      });
    });

    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json(
      { message: 'Token renovado exitosamente' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error en POST /api/auth/refresh:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al renovar sesión' },
      { status: 500 }
    );
  }
}
```

---

## 4. app/api/auth/logout/route.ts
Handler para cerrar sesión: invalida el token en la base de datos marcando `revokedAt: new Date()` y elimina las cookies del navegador.

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, clearAuthCookies } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload && payload.tokenId) {
        // Revocar el token en la base de datos para prevenir reutilización
        await prisma.refreshToken.updateMany({
          where: {
            id: payload.tokenId as string,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      }
    }

    await clearAuthCookies();
    return NextResponse.json(
      { message: 'Sesión cerrada exitosamente' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error en POST /api/auth/logout:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al cerrar sesión' },
      { status: 500 }
    );
  }
}
```

---

## 5. app/api/auth/register/route.ts
Registro de nuevos usuarios, hasheo seguro de contraseña (`passwordHash`), creación de cuenta y emisión de `RefreshToken` hasheado en BD.

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        name: validatedData.name,
      },
    });

    const tokenId = crypto.randomUUID();
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload, tokenId);

    // Guardar token hasheado en DB (NUNCA en texto plano)
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        tokenHash,
        userId: newUser.id,
        expiresAt,
      },
    });

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
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

    console.error('Error en POST /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Error interno al registrar usuario' },
      { status: 500 }
    );
  }
}
```

---

## 6. app/api/auctions/route.ts
Creación y listado de subastas. Incluye validación de fecha de finalización con Zod: **`endsAt` debe estar entre `now + 1 hora` y `now + 7 días`**.

```typescript
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
```

---

## 7. lib/auction-logic.ts
Lógica de cálculo de estado dinámico de subastas (`ACTIVE`, `CLOSED`, `DESERTED`, `CANCELLED`) y reglas de validación de ofertas conforme a `SPEC.md`.

```typescript
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
```

---

## 8. app/api/auctions/[id]/bids/route.ts
Handler atómico para registro de ofertas con transacción de base de datos (`prisma.$transaction`), donde **todas las consultas usan estrictamente el objeto `tx`**, con verificación de concurrencia, prevención de auto-puja líder (`ALREADY_HIGHEST_BIDDER`) y **anti-sniping (extensión automática de 5 minutos)**.

```typescript
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

    // Transacción atómica estricta: ÚNICAMENTE se utiliza el cliente `tx` dentro del callback
    const result = await prisma.$transaction(async (tx) => {
      // 1. Usar tx para buscar la subasta
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

      // 2. Usar tx para registrar la nueva oferta
      const newBid = await tx.bid.create({
        data: {
          amount: validatedData.amount,
          auctionId: auction.id,
          bidderId: session.userId,
        },
      });

      // 3. Lógica de Anti-Sniping: si falta <= 5 minutos, extender endsAt 5 minutos más usando tx
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
      if (
        error.name === 'VALIDATION_ERROR' ||
        error.name === 'OWN_AUCTION' ||
        error.name === 'INVALID_STATUS' ||
        error.name === 'INSUFFICIENT_AMOUNT'
      ) {
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
```

---

## 9. proxy.ts (Next.js 16 Proxy / Middleware para Protección de Rutas)
En Next.js 16+, el archivo se nombra `proxy.ts` (en la raíz) y la función exportada debe llamarse obligatoriamente `proxy` (o export default). Protege rutas privadas y verifica el token JWT.

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'default_access_secret_key_change_in_production'
);

// Prefijos o rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard', '/perfil', '/subastas/crear', '/api/auctions'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Permitir GET público a la lista o detalle de subastas si se desea
  const isPublicAuctionGet =
    pathname.startsWith('/api/auctions') &&
    request.method === 'GET' &&
    !pathname.includes('/bids');

  if (isProtected && !isPublicAuctionGet) {
    const token =
      request.cookies.get('access_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Acceso no autorizado: Token no proporcionado' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, ACCESS_SECRET);
      return NextResponse.next();
    } catch {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Acceso no autorizado: Token inválido o expirado' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/perfil/:path*',
    '/subastas/crear/:path*',
    '/api/auctions/:path*',
  ],
};
```
