import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin sayfaları kontrolü
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    const sessionCookie = request.cookies.get('admin_session');
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Oyuncu sayfaları ve oylama (giriş gerektirir)
  if (pathname.startsWith('/player') || pathname.startsWith('/vote')) {
    const playerSession = request.cookies.get('player_session');
    if (!playerSession || !playerSession.value) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Diğer sayfalara (özellikle / ana sayfa login ekranı) izin ver
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
