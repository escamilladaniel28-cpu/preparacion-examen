import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';

// ----------------------------------------------------
// Sistema de Rate Limiting en memoria para Login
// Máximo 5 intentos fallidos por IP en una ventana de 15 minutos
// ----------------------------------------------------
interface RateLimitRecord {
  count: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
}

const loginRateLimitMap = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos en milisegundos

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp?.trim()) {
    return realIp.trim();
  }

  return '127.0.0.1';
}

function checkRateLimit(clientIp: string): { isBlocked: boolean; remainingMs: number } {
  const now = Date.now();
  const record = loginRateLimitMap.get(clientIp);

  if (!record) {
    return { isBlocked: false, remainingMs: 0 };
  }

  // Si la ventana de 15 minutos expiró desde el primer intento fallido, limpiar registro
  if (now - record.firstAttemptAt > WINDOW_MS) {
    loginRateLimitMap.delete(clientIp);
    return { isBlocked: false, remainingMs: 0 };
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const remainingMs = record.firstAttemptAt + WINDOW_MS - now;
    return { isBlocked: true, remainingMs: Math.max(remainingMs, 0) };
  }

  return { isBlocked: false, remainingMs: 0 };
}

function recordFailedAttempt(clientIp: string): void {
  const now = Date.now();
  const record = loginRateLimitMap.get(clientIp);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    loginRateLimitMap.set(clientIp, {
      count: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
    });
  } else {
    record.count += 1;
    record.lastAttemptAt = now;
    loginRateLimitMap.set(clientIp, record);
  }
}

function resetFailedAttempts(clientIp: string): void {
  loginRateLimitMap.delete(clientIp);
}

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  // 1. Verificar Rate Limiting antes de procesar credenciales
  const rateLimit = checkRateLimit(clientIp);
  if (rateLimit.isBlocked) {
    const minutesRemaining = Math.ceil(rateLimit.remainingMs / 60000);
    return NextResponse.json(
      {
        error: `Demasiados intentos fallidos. Inténtalo de nuevo en ${minutesRemaining > 0 ? minutesRemaining : 15} minutos.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimit.remainingMs / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'Esta cuenta ha sido desactivada por un administrador.' },
        { status: 403 }
      );
    }

    // Login exitoso: Limpiar contador de intentos fallidos para esta IP
    resetFailedAttempts(clientIp);

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
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error en POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
