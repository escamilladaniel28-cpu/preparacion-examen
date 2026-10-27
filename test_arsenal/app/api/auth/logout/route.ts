import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, clearAuthCookies } from '@/lib/auth';

export async function POST(request: Request) {
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

    // Si la petición proviene de navegación HTML nativa en el navegador, redirigir
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('text/html')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl, 303);
    }

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

export async function GET(request: Request) {
  return POST(request);
}
