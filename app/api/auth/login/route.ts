import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'ks5179!!';

    if (password === adminPassword) {
      // 쿠키에 인증 토큰 설정 (24시간 유효)
      const cookieStore = await cookies();
      cookieStore.set('admin_auth', adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24시간
        path: '/',
        sameSite: 'lax',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: '비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}