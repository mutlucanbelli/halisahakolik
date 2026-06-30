import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halka açık (şifresiz girilebilecek) yolları belirle
  const isPublicPath = pathname.startsWith('/login') || 
                       pathname.startsWith('/vote') || 
                       pathname.startsWith('/_next') || 
                       request.headers.get("next-action") !== null || // Server Actions (form gönderimleri) için istisna
                       pathname.includes('.'); // statik dosyalar (favicon vb)

  if (!isPublicPath) {
    const sessionCookie = request.cookies.get('admin_session');
    
    // Çerez yoksa veya hatalıysa login sayfasına at
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
