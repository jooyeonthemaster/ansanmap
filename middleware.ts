import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지는 인증 체크 제외
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // admin 경로 접근 시 인증 체크
  if (pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('admin_auth')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || 'ks5179!!';

    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (authToken !== adminPassword) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};