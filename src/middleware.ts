import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicPaths = ['/login'];

// Rutas protegidas que requieren autenticación
const protectedPaths = [
  '/',
  '/admin',
  '/vouchers',
  '/my-vouchers',
  '/misc',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta pública
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Verificar si es una ruta protegida
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // Intentar obtener auth-storage de cookies (Zustand persist lo guarda en localStorage)
  // En el cliente, verificamos con useEffect en el layout
  // En el servidor (middleware), solo podemos redirigir basado en rutas

  // Si es ruta pública, permitir acceso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Si es ruta protegida y no tiene auth, redirigir a login
  // Nota: Este middleware es básico porque Zustand usa localStorage (client-side)
  // La verificación real de auth se hace en el dashboard layout (client component)
  if (isProtectedPath) {
    // Permitir que pase y el layout del dashboard maneje la redirección
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configurar qué rutas ejecutarán el middleware
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
