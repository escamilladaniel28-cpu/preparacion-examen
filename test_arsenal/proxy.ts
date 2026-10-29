import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error('FATAL: JWT_ACCESS_SECRET is not defined');
}

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  const token =
    request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // 1. Redirección si el usuario ya está autenticado e intenta acceder a /login o /register
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, ACCESS_SECRET);
      const dashboardUrl = new URL('/dashboard', request.url);
      const redirectResponse = NextResponse.redirect(dashboardUrl);
      redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return redirectResponse;
    } catch {
      // Token inválido o expirado, permitir acceso a login
    }
  }

  // 2. Protección de rutas privadas (/dashboard y /admin)
  if (isDashboard || isAdmin) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return redirectResponse;
    }

    try {
      const { payload } = await jwtVerify(token, ACCESS_SECRET);

      // Si es ruta de administración, verificar rol ADMIN
      if (isAdmin && payload.role !== 'ADMIN') {
        const dashboardUrl = new URL('/dashboard', request.url);
        const redirectResponse = NextResponse.redirect(dashboardUrl);
        redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        return redirectResponse;
      }

      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return response;
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return redirectResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};

export default proxy;
