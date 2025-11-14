import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/patient/dashboard', '/doctor/dashboard'];
const AUTH_ROUTE = '/auth/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session');

  // If user is trying to access a protected route without a session, redirect to login
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTE;
    return NextResponse.redirect(url);
  }

  // If user is authenticated and tries to access login page, redirect them away
  if (pathname.startsWith(AUTH_ROUTE) && sessionCookie) {
     const url = request.nextUrl.clone();
     // In a real app, you'd likely redirect to a role-based dashboard
     url.pathname = '/patient/dashboard';
     return NextResponse.redirect(url);
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
