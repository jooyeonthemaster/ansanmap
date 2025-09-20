# 🎪 안산 축제 지도 - 실시간 부스 정보 시스템

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" />
</div>

## 📱 주요 기능

### 🗺️ 실시간 지도
- **카카오맵 기반** 인터랙티브 축제장 지도
- **실시간 부스 위치** 표시 및 상세 정보
- **혼잡도 시각화** (색상으로 구분)
- **사용자 현재 위치** 추적 및 표시
- **지도 타입 변경** (일반/위성)

### 📊 실시간 정보
- **혼잡도 모니터링** - 4단계 실시간 표시
- **예상 대기 시간** 표시
- **현재 방문자 수** / 최대 수용 인원
- **인기도 점수** 및 순위

### 📹 라이브 기능
- **웹캠 실시간 스트리밍** - 부스별 라이브 영상
- **QR 코드 체크인** - 포인트 적립
- **실시간 공지사항** - 우선순위별 알림

### ⭐ 사용자 기능
- **즐겨찾기** - 관심 부스 저장 및 알림
- **스마트 검색** - 카테고리/태그별 필터링  
- **길찾기** - 카카오맵 연동 네비게이션
- **리워드 시스템** - 포인트 적립 및 교환

### 🎨 UI/UX
- **모바일 최적화** - 380px 고정 뷰포트
- **PWA 지원** - 오프라인 사용 가능
- **다크모드 대응** - 시스템 설정 연동
- **애니메이션** - Framer Motion 적용

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- Kakao Map API Key

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/your-repo/ansanmap.git
cd ansanmap

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 NEXT_PUBLIC_KAKAO_MAP_API_KEY 설정

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🏗️ 프로젝트 구조

```
ansanmap/
├── app/                    # Next.js 앱 라우터
│   ├── page.tsx           # 메인 페이지
│   ├── layout.tsx         # 레이아웃
│   └── admin/             # 관리자 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # UI 컴포넌트
│   │   ├── SearchAndFilter.tsx
│   │   ├── BoothDetail.tsx
│   │   ├── LiveWebcam.tsx
│   │   ├── QRCheckIn.tsx
│   │   └── ...
│   ├── EnhancedKakaoMap.tsx
│   ├── FavoritesPage.tsx
│   └── InfoPage.tsx
├── lib/                   # 유틸리티
│   ├── types.ts          # TypeScript 타입
│   ├── booth-config.ts   # 부스 설정
│   └── utils/            # 유틸리티 함수
├── hooks/                # Custom Hooks
└── public/               # 정적 파일
```

## 🛠️ 기술 스택

- **Frontend**: Next.js 15.5, React 19.1, TypeScript
- **Styling**: TailwindCSS 4, Framer Motion
- **Map**: Kakao Maps API
- **State**: React Hooks, Local Storage
- **Icons**: Lucide React
- **Utils**: React Hot Toast, QRCode.react

## 📋 주요 컴포넌트

### EnhancedKakaoMap
- 메인 지도 컴포넌트
- 부스 폴리곤 렌더링
- 실시간 업데이트 처리
- 사용자 위치 추적

### SearchAndFilter
- 실시간 검색
- 카테고리/혼잡도 필터
- 자동완성 기능

### BoothDetail
- 부스 상세 정보
- 액션 버튼 (즐겨찾기, 길찾기, 라이브)
- 실시간 상태 표시

### LiveWebcam
- 실시간 스트리밍 뷰어
- 전체화면 지원
- 음소거 컨트롤

### QRCheckIn
- QR 코드 생성/스캔
- 포인트 적립
- 방문 기록 저장

## 🔥 성능 최적화

- **Dynamic Import** - 컴포넌트 지연 로딩
- **Suspense** - 로딩 상태 처리
- **Skeleton Loader** - 스켈레톤 UI
- **Image Optimization** - Next.js Image 컴포넌트
- **PWA** - 오프라인 지원

## 📱 모바일 대응

- 380px 고정 뷰포트
- 터치 제스처 최적화
- 안전 영역 대응
- 하단 네비게이션

## 🎯 향후 개발 계획

- [ ] 실제 WebSocket 연동
- [ ] 푸시 알림 구현
- [ ] 다국어 지원
- [ ] AR 네비게이션
- [ ] 소셜 공유 기능
- [ ] 음성 안내
- [ ] 접근성 개선

## 📄 라이선스

MIT License

## 👥 기여하기

Pull Request와 Issue를 환영합니다!

---

<div align="center">
  Made with ❤️ for 안산 사이언스밸리 축제
</div>