# 🗄️ Supabase 연동 가이드

Ansanmap 프로젝트에 Supabase 데이터베이스를 연동하는 방법입니다.

## 📋 준비 사항

1. Supabase 계정 (https://supabase.com)
2. 새 Supabase 프로젝트 생성 완료
3. 프로젝트 URL 및 Anon Key 확보

---

## 🚀 Step 1: 환경 변수 설정

### 1.1 `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Kakao Map API Key (기존)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key

# Supabase Configuration (새로 추가)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 1.2 Supabase 대시보드에서 값 찾기

1. Supabase 프로젝트 대시보드 접속
2. **Settings** → **API** 메뉴로 이동
3. **Project URL** 복사 → `NEXT_PUBLIC_SUPABASE_URL`에 붙여넣기
4. **Project API keys** 섹션에서 `anon public` 키 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 붙여넣기

---

## 🗃️ Step 2: 데이터베이스 스키마 생성

### 2.1 SQL Editor에서 스키마 실행

1. Supabase 대시보드에서 **SQL Editor** 메뉴 선택
2. **New Query** 버튼 클릭
3. `lib/supabase/schema.sql` 파일의 전체 내용을 복사
4. SQL Editor에 붙여넣기
5. **Run** 버튼 클릭하여 실행

### 2.2 생성되는 테이블

- ✅ `users` - 사용자 정보 (device_id 기반)
- ✅ `booths` - 부스 정보
- ✅ `favorites` - 즐겨찾기
- ✅ `check_ins` - 체크인 기록
- ✅ `announcements` - 공지사항

### 2.3 확인 방법

**Table Editor** 메뉴에서 5개 테이블이 생성되었는지 확인하세요.

---

## 📊 Step 3: 샘플 데이터 마이그레이션 (선택사항)

기존 LocalStorage 데이터를 Supabase로 마이그레이션하려면:

### 3.1 브라우저에서 샘플 데이터 초기화

1. 앱 실행: `npm run dev`
2. 브라우저에서 http://localhost:3000 접속
3. 오른쪽 상단 녹색 새로고침 버튼 클릭 (샘플 데이터 초기화)

### 3.2 데이터 확인

Supabase **Table Editor**에서:
- `booths` 테이블에 6개 샘플 부스 확인
- `announcements` 테이블에 3개 공지사항 확인

---

## 🔄 Step 4: Realtime 기능 활성화

### 4.1 Database → Replication 설정

1. Supabase 대시보드에서 **Database** → **Replication** 메뉴
2. 다음 테이블에 대해 **Enable Realtime** 토글 활성화:
   - ✅ `booths`
   - ✅ `announcements`
   - ✅ `check_ins`

### 4.2 Realtime 동작 확인

앱에서:
- 부스 정보 변경 시 자동으로 다른 사용자에게 반영
- 공지사항 추가 시 실시간으로 배너 업데이트
- 체크인 시 포인트 즉시 반영

---

## 🧪 Step 5: 연결 테스트

### 5.1 앱 재시작

```bash
npm run dev
```

### 5.2 테스트 시나리오

#### Test 1: 부스 데이터 로드
- ✅ 메인 페이지 접속 시 지도에 부스 폴리곤 표시
- ✅ 콘솔에 "Error fetching booths" 없음

#### Test 2: 관리자 페이지에서 부스 추가
1. 오른쪽 상단 톱니바퀴 아이콘 → 관리자 페이지
2. "새 부스 추가" 클릭
3. 정보 입력 후 지도에서 영역 설정
4. 저장 → Supabase Table Editor에서 새 부스 확인

#### Test 3: 즐겨찾기
1. 부스 클릭 → 상세 모달
2. 하트 아이콘 클릭
3. 즐겨찾기 탭에서 확인
4. Supabase `favorites` 테이블에 레코드 생성 확인

#### Test 4: QR 체크인
1. 부스 상세 모달에서 "QR 체크인" 클릭
2. 체크인 버튼 클릭
3. "+10 포인트" 메시지 표시
4. 정보 탭 → 내 활동에서 포인트 반영 확인
5. Supabase `check_ins` 테이블에 레코드 확인

---

## 📁 프로젝트 구조 변경 사항

### 새로 추가된 파일

```
lib/supabase/
├── client.ts              # Supabase 클라이언트 초기화
├── database.types.ts      # TypeScript 타입 정의
├── schema.sql             # 데이터베이스 스키마
├── booth-api.ts           # 부스 CRUD API
└── user-api.ts            # 사용자 데이터 API
```

### 기존 파일 (유지됨, 하위 호환성)

```
lib/
├── booth-storage.ts       # ⚠️ Deprecated (LocalStorage 방식)
└── utils/storage.ts       # ⚠️ Deprecated (LocalStorage 방식)
```

---

## 🔧 API 사용 방법

### Booth API

```typescript
import { getBooths, addBooth, updateBooth, deleteBooth } from '@/lib/supabase/booth-api';

// 모든 부스 가져오기
const booths = await getBooths();

// 새 부스 추가
const newBooth = await addBooth({
  name: '떡볶이 부스',
  category: 'food',
  description: '맛있는 떡볶이',
  coordinates: [/* ... */],
  operatingHours: '10:00 - 18:00',
});

// 부스 업데이트
await updateBooth('booth-id', { isActive: false });

// 부스 삭제
await deleteBooth('booth-id');
```

### User API

```typescript
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getCheckIns,
  addCheckIn,
  getTotalPoints,
} from '@/lib/supabase/user-api';

// 즐겨찾기 목록
const favorites = await getFavorites();

// 즐겨찾기 추가
await addFavorite('booth-id', true); // notificationEnabled = true

// 체크인
await addCheckIn('booth-id', 10); // 10 points

// 총 포인트 조회
const points = await getTotalPoints();
```

### Realtime Subscriptions

```typescript
import { subscribeToBooths } from '@/lib/supabase/booth-api';
import { subscribeToAnnouncements } from '@/lib/supabase/user-api';

// 부스 변경 감지
const unsubscribe = subscribeToBooths((booths) => {
  console.log('Booths updated:', booths);
  setBooths(booths);
});

// 컴포넌트 언마운트 시 구독 해제
return () => unsubscribe();
```

---

## 🔒 보안 설정 (Row Level Security)

스키마에 포함된 RLS 정책:

### 공개 읽기
- ✅ 모든 사용자가 `booths` 테이블 읽기 가능
- ✅ 만료되지 않은 `announcements` 읽기 가능

### 사용자별 데이터
- ✅ 자신의 `favorites`만 CRUD 가능
- ✅ 자신의 `check_ins`만 조회/추가 가능

### 관리자 권한 (현재는 모든 사용자)
- ⚠️ 현재는 모든 사용자가 부스 추가/수정/삭제 가능
- 🔜 향후 인증 시스템 추가 예정

---

## 🐛 문제 해결

### 문제 1: "Missing Supabase environment variables"

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 변수명이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
3. 개발 서버 재시작: `Ctrl+C` → `npm run dev`

### 문제 2: "Error fetching booths: 404"

**원인**: 테이블이 생성되지 않음

**해결**:
1. Supabase SQL Editor에서 `schema.sql` 재실행
2. Table Editor에서 테이블 존재 확인

### 문제 3: "Row Level Security policy violation"

**원인**: RLS 정책 누락

**해결**:
1. `schema.sql`의 RLS 정책 섹션 재실행
2. Supabase Authentication → Policies에서 정책 확인

### 문제 4: Realtime 업데이트가 안 됨

**원인**: Realtime이 활성화되지 않음

**해결**:
1. Database → Replication에서 테이블별 Realtime 토글 확인
2. 브라우저 콘솔에서 WebSocket 연결 확인

---

## 📊 데이터 구조 예시

### Booth 데이터

```json
{
  "id": "uuid",
  "name": "안산 떡볶이",
  "category": "food",
  "description": "매콤달콤한 떡볶이",
  "coordinates": [
    {"lat": 37.3219, "lng": 126.8308},
    {"lat": 37.3220, "lng": 126.8309},
    {"lat": 37.3221, "lng": 126.8307}
  ],
  "operating_hours": "10:00 - 18:00",
  "contact": "031-1234-5678",
  "menu_items": ["떡볶이", "순대", "튀김"],
  "price": "5,000원",
  "is_active": true,
  "congestion_level": "medium",
  "waiting_time": 15,
  "current_visitors": 12,
  "max_capacity": 20,
  "tags": ["먹거리", "인기", "매운맛"],
  "created_at": "2024-10-21T...",
  "updated_at": "2024-10-21T..."
}
```

---

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] `.env.local` 파일에 URL 및 Key 설정
- [ ] `schema.sql` 실행하여 테이블 생성
- [ ] Table Editor에서 5개 테이블 확인
- [ ] Realtime 활성화 (booths, announcements, check_ins)
- [ ] 개발 서버 재시작
- [ ] 부스 데이터 로드 테스트
- [ ] 즐겨찾기 추가 테스트
- [ ] QR 체크인 테스트
- [ ] Realtime 업데이트 테스트

---

## 🚀 다음 단계

1. **인증 시스템 추가**: Supabase Auth로 사용자 로그인 구현
2. **관리자 권한 분리**: 부스 관리 권한을 특정 사용자로 제한
3. **푸시 알림**: 즐겨찾기 부스의 혼잡도 변경 시 알림
4. **이미지 업로드**: Supabase Storage로 부스 사진 관리
5. **분석 대시보드**: 방문자 통계 및 인기 부스 분석

---

**문제가 발생하면 이슈를 등록해주세요!** 🙋‍♂️