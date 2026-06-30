import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece ana sayfa (/) ve /admin sayfalarını koru
  const isProtectedPath = pathname === '/' || pathname.startsWith('/admin');

  if (isProtectedPath) {
    const sessionCookie = request.cookies.get('admin_session');
    
    // Çerez yoksa veya hatalıysa login sayfasına at
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Diğer tüm sayfalara (özellikle /vote) izin ver
  return NextResponse.next();
}

export const config = {
  // Sadece / ve /admin yollarında middleware çalışsın (performans optimizasyonu)
  matcher: ['/', '/admin/:path*'],
};
