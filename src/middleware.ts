import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece ana sayfa (/), /admin ve /player sayfalarını koru
  const isAdminPath = pathname === '/' || pathname.startsWith('/admin');
  const isPlayerPath = pathname.startsWith('/player');

  if (isAdminPath) {
    const sessionCookie = request.cookies.get('admin_session');
    
    // Çerez yoksa veya hatalıysa login sayfasına at
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isPlayerPath) {
    const playerSession = request.cookies.get('player_session');
    
    if (!playerSession || !playerSession.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Diğer tüm sayfalara (özellikle /vote) izin ver
  return NextResponse.next();
}

export const config = {
  // / , /admin ve /player yollarında middleware çalışsın
  matcher: ['/', '/admin/:path*', '/player/:path*'],
};
