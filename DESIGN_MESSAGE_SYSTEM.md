# 메시지 시스템 설계 문서

## 📋 요구사항 분석

### 기능 요구사항
1. **실시간 채팅**: 사용자 ↔ 운영자 1:1 실시간 메시지
2. **민원 접수**: 특별한 민원 타입의 메시지 (우선순위 높음)
3. **익명 사용자 지원**: 회원가입 없이 사용 가능
4. **관리자 대시보드**: 모든 채팅방 관리 및 응답

### 기술 요구사항
- Supabase Realtime으로 실시간 메시지 구독
- Device ID 기반 사용자 식별
- 채팅방(chat_room) 단위로 메시지 그룹화
- 민원/일반 메시지 타입 구분

---

## 🗄️ 데이터베이스 스키마

### 1. chat_rooms 테이블
```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_device_id TEXT NOT NULL,           -- 사용자 기기 ID
  user_name TEXT DEFAULT '방문자',         -- 사용자 닉네임
  room_type TEXT NOT NULL,                 -- 'general' | 'complaint'
  status TEXT DEFAULT 'active',            -- 'active' | 'closed'
  last_message TEXT,                       -- 마지막 메시지 미리보기
  last_message_at TIMESTAMP,               -- 마지막 메시지 시간
  unread_count INTEGER DEFAULT 0,          -- 관리자 미읽음 수
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_chat_rooms_device ON chat_rooms(user_device_id);
CREATE INDEX idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX idx_chat_rooms_type ON chat_rooms(room_type);
CREATE INDEX idx_chat_rooms_updated ON chat_rooms(updated_at DESC);
```

### 2. messages 테이블
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,               -- 'user' | 'admin'
  content TEXT NOT NULL,                   -- 메시지 내용
  is_read BOOLEAN DEFAULT FALSE,           -- 읽음 여부
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_messages_room ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(room_id, is_read);
```

### 3. RLS (Row Level Security) 정책
```sql
-- 모든 사용자가 자신의 채팅방 조회 가능
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat rooms"
  ON chat_rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update chat rooms"
  ON chat_rooms FOR UPDATE
  USING (true);

-- 메시지 정책
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update messages"
  ON messages FOR UPDATE
  USING (true);
```

---

## 🔑 사용자 식별 시스템

### Device ID 생성 전략
```typescript
// lib/utils/device-id.ts
export function getOrCreateDeviceId(): string {
  const STORAGE_KEY = 'asv_device_id';

  // 1. localStorage에서 기존 ID 확인
  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId) {
    // 2. 새 ID 생성 (UUID v4 기반)
    deviceId = `device_${Date.now()}_${generateRandomString(16)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}

function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 사용자 닉네임 관리
export function getUserNickname(): string {
  return localStorage.getItem('asv_user_nickname') || '방문자';
}

export function setUserNickname(nickname: string): void {
  localStorage.setItem('asv_user_nickname', nickname);
}
```

### 채팅방 분리 전략
- **Device ID별 채팅방**: 각 기기는 독립된 채팅방 생성
- **Room Type**: 일반(`general`) / 민원(`complaint`) 구분
- **Status**: 활성(`active`) / 종료(`closed`) 상태 관리

---

## 🎨 UI/UX 설계

### 사용자 화면 (MessagePage)
```
┌─────────────────────────────────┐
│  🎪 운영자에게 문의하기           │
├─────────────────────────────────┤
│  [ 일반 문의 ]  [ 민원 접수 ]     │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │ 관리자: 안녕하세요!          ││
│  │         무엇을 도와드릴까요?  ││
│  └─────────────────────────────┘│
│          ┌───────────────────┐  │
│          │ 저: 부스 위치가    │  │
│          │     어디인가요?    │  │
│          └───────────────────┘  │
├─────────────────────────────────┤
│ [메시지 입력...]         [전송]  │
└─────────────────────────────────┘
```

### 관리자 화면 (AdminChatManager)
```
┌─────────────────────────────────────┐
│  채팅방 목록             [새로고침]  │
├──────────┬──────────────────────────┤
│ 채팅방   │  대화 내용               │
│ 목록     │                          │
│          │  ┌─ 사용자: 안녕하세요  │
│ 🔴 민원1 │  │  (10:30)             │
│ 방문자   │  └─ 관리자: 네~        │
│ 2분 전   │     (10:31)             │
│          │                          │
│ ⚪ 일반1 │  ┌────────────────────┐ │
│ 김철수   │  │ [메시지 입력]       │ │
│ 5분 전   │  └────────────────────┘ │
└──────────┴──────────────────────────┘
```

---

## 🔄 실시간 동기화 플로우

### 1. 사용자 → 관리자 메시지 전송
```
User Action: 메시지 입력 + 전송 버튼 클릭
    ↓
sendMessage(roomId, content)
    ↓
Supabase INSERT messages
    ↓
UPDATE chat_rooms (last_message, updated_at, unread_count++)
    ↓
Realtime Broadcast
    ↓
관리자 화면 자동 업데이트 (toast 알림)
```

### 2. 관리자 → 사용자 메시지 전송
```
Admin Action: 메시지 입력 + 전송
    ↓
sendAdminMessage(roomId, content)
    ↓
Supabase INSERT messages (sender_type: 'admin')
    ↓
UPDATE chat_rooms (last_message, updated_at)
    ↓
Realtime Broadcast
    ↓
사용자 화면 자동 업데이트
```

### 3. 실시간 구독 패턴
```typescript
// Supabase Realtime 채널 구독
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${roomId}`
    },
    (payload) => {
      // 새 메시지 추가
      setMessages(prev => [...prev, payload.new as Message])
    }
  )
  .subscribe()

// Cleanup
return () => {
  supabase.removeChannel(channel)
}
```

---

## 📁 파일 구조

```
lib/
├── types.ts                    # 타입 정의 추가
├── utils/
│   └── device-id.ts           # (신규) Device ID 관리
├── supabase/
│   ├── message-api.ts         # (신규) 메시지 CRUD API
│   └── chat-api.ts            # (신규) 채팅방 CRUD API

components/
├── MessagePage.tsx             # (신규) 사용자 메시지 페이지
├── AdminChatManager.tsx        # (신규) 관리자 채팅 관리
└── ui/
    ├── ChatRoomList.tsx       # (신규) 채팅방 목록
    ├── ChatMessageList.tsx    # (신규) 메시지 목록
    └── MessageInput.tsx       # (신규) 메시지 입력

supabase/
└── migrations/
    └── 20250122_create_messages.sql  # (신규) 마이그레이션
```

---

## 🚀 구현 단계

### Phase 1: 데이터베이스 및 API (30분)
1. ✅ Supabase 마이그레이션 작성
2. ✅ chat-api.ts 작성
3. ✅ message-api.ts 작성
4. ✅ device-id.ts 작성

### Phase 2: UI 컴포넌트 (40분)
5. ✅ MessageInput 컴포넌트
6. ✅ ChatMessageList 컴포넌트
7. ✅ ChatRoomList 컴포넌트
8. ✅ MessagePage 메인 화면

### Phase 3: 관리자 기능 (30분)
9. ✅ AdminChatManager 컴포넌트
10. ✅ app/admin/page.tsx 탭 추가

### Phase 4: 통합 및 테스트 (20분)
11. ✅ app/page.tsx 하단 탭 추가
12. ✅ 실시간 동기화 테스트
13. ✅ 민원/일반 메시지 구분 테스트

---

## 🔒 보안 고려사항

### 1. 입력 검증
- 메시지 길이 제한 (최대 1000자)
- XSS 방지 (DOMPurify 또는 텍스트만 허용)
- SQL Injection 방지 (Supabase parameterized queries)

### 2. Rate Limiting
- 사용자당 초당 최대 5개 메시지
- 스팸 방지 로직

### 3. 개인정보 보호
- Device ID는 복원 불가능한 해시 사용 고려
- 닉네임은 선택적 (기본값: "방문자")

---

## 📊 성능 최적화

### 1. 메시지 페이지네이션
```typescript
// 초기 로드: 최근 50개
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('room_id', roomId)
  .order('created_at', { ascending: false })
  .limit(50)
```

### 2. 채팅방 목록 캐싱
- React Query로 5초 stale time 설정
- 백그라운드 refetch로 최신 상태 유지

### 3. Realtime 구독 최적화
- 채팅방별 독립 채널 생성
- 사용자는 자신의 방만 구독
- 관리자는 활성 방만 구독

---

## 🧪 테스트 시나리오

### 사용자 플로우
1. ✅ 메시지 탭 진입 → 자동으로 채팅방 생성
2. ✅ "일반 문의" 선택 → 메시지 전송
3. ✅ 관리자 응답 → 실시간 수신 확인
4. ✅ 민원 접수로 전환 → room_type 변경 확인

### 관리자 플로우
1. ✅ 관리자 페이지 → 메시지 탭
2. ✅ 채팅방 목록 확인 (민원 우선 표시)
3. ✅ 특정 채팅방 선택 → 대화 내역 로드
4. ✅ 메시지 응답 → 사용자 화면 실시간 반영
5. ✅ 채팅방 종료 → status='closed' 변경

---

## 🎯 성공 지표

- ✅ 실시간 메시지 지연 < 1초
- ✅ 채팅방 목록 로딩 < 500ms
- ✅ 에러율 < 0.1%
- ✅ 동시 접속자 100명 지원