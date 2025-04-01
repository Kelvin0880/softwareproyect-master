import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Si está en la raíz, redirige según el token
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si está en login y tiene token válido, redirige a dashboard
  if (pathname === '/login' && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      return NextResponse.next();
    }
  }

  // Protección de rutas del dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = await verifyToken(token);
      
      // Verificar acceso a rutas de administrador
      if (pathname.startsWith('/dashboard/admin')) {
        if (decoded.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};