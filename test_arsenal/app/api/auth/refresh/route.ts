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
