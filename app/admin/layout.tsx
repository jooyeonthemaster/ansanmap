'use client';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* 관리자 페이지는 380px 제약 해제 - 전체 너비 사용 */}
      <style jsx global>{`
        /* 루트 레이아웃의 380px 제약 오버라이드 */
        body > div {
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
        }

        /* 상단 헤더도 전체 너비로 */
        body > div > div:first-child {
          width: 100% !important;
          left: 0 !important;
          transform: none !important;
        }
      `}</style>

      {children}
    </>
  );
}