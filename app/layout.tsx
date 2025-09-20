import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "안산 축제 지도 | 실시간 부스 정보",
  description: "안산 사이언스밸리 축제 - 실시간 부스 위치, 혼잡도, 라이브 영상",
  keywords: "안산축제, 사이언스밸리, 축제지도, 부스위치, 실시간정보",
  openGraph: {
    title: "안산 축제 지도",
    description: "실시간 부스 정보와 혼잡도를 확인하세요",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 380,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f5f5f5]`}>
        {/* 380px 모바일 앱 쉘 */}
        <div className="relative mx-auto w-[380px] min-h-svh bg-white text-black shadow-[0_0_24px_rgba(0,0,0,0.06)]">
          {/* 상단 헤더 */}
          <div className="fixed left-1/2 top-0 z-50 w-[380px] -translate-x-1/2">
            <div className="h-12 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-black/5 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎪</span>
                <span className="font-medium">안산 사이언스밸리 축제</span>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 영역 */}
          <main className="pt-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}