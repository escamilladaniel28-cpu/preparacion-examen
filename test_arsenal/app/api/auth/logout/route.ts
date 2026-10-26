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
