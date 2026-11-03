import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // List of protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/bookings',
    '/tracking',
    '/journey',
    '/seat-selection',
    '/food',
    '/food-order',
    '/analytics',
    '/window-view',
    '/emergency',
    '/profile',
    '/favorites',
    '/favourites',
  ];

  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check demo mode cookie fallback
  const isDemo = request.cookies.get('railgaadi-demo-mode')?.value === 'true';

  // If unauthenticated and trying to access protected route
  if (!user && !isDemo && isProtectedRoute && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated (or demo mode) and visiting login/signup, redirect to dashboard
  if ((user || isDemo) && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
