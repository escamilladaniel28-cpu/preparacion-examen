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
