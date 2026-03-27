import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_CONFIG } from '@/constants';

export function middleware(request: NextRequest) {
  // Middleware runs on the Edge runtime (server), so it cannot access localStorage.
  // The token is synced to cookies during login to allow server-side route protection.
  const token = request.cookies.get(APP_CONFIG.ACCESS_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/checkout');

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Lưu lại trang user định vào để login xong trả về cho mượt
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // NOTE: Do NOT redirect authenticated users away from /login
  // Let the LoginForm component handle post-login redirect to the desired page.
  // This prevents interfering with the redirect query parameter flow.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/cart/:path*',
    '/login',
    '/register',
  ],
};
