-- 메시지 시스템 마이그레이션
-- 2025-01-22: 실시간 채팅 및 민원 접수 기능

-- ============================================
-- 1. chat_rooms 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_device_id TEXT NOT NULL,
  user_name TEXT DEFAULT '방문자',
  room_type TEXT NOT NULL CHECK (room_type IN ('general', 'complaint')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_chat_rooms_device ON chat_rooms(user_device_id);
CREATE INDEX idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX idx_chat_rooms_type ON chat_rooms(room_type);
CREATE INDEX idx_chat_rooms_updated ON chat_rooms(updated_at DESC);

-- 복합 인덱스: 빠른 채팅방 조회
CREATE INDEX idx_chat_rooms_active_updated ON chat_rooms(status, updated_at DESC) WHERE status = 'active';

-- ============================================
-- 2. messages 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(room_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- 3. RLS (Row Level Security) 정책
-- ============================================

-- chat_rooms RLS 활성화
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 채팅방 조회 가능
CREATE POLICY "Anyone can view chat rooms"
  ON chat_rooms FOR SELECT
  USING (true);

-- 모든 사용자가 채팅방 생성 가능
CREATE POLICY "Anyone can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 채팅방 업데이트 가능
CREATE POLICY "Anyone can update chat rooms"
  ON chat_rooms FOR UPDATE
  USING (true);

-- messages RLS 활성화
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 메시지 조회 가능
CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

-- 모든 사용자가 메시지 생성 가능
CREATE POLICY "Anyone can create messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 메시지 업데이트 가능 (읽음 처리)
CREATE POLICY "Anyone can update messages"
  ON messages FOR UPDATE
  USING (true);

-- ============================================
-- 4. 트리거: updated_at 자동 업데이트
-- ============================================

-- updated_at 자동 업데이트 함수 (재사용 가능)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- chat_rooms 트리거
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. 유틸리티 함수들
-- ============================================

-- 채팅방의 미읽음 메시지 수 계산
CREATE OR REPLACE FUNCTION get_unread_count(room_id_param UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM messages
  WHERE room_id = room_id_param
    AND sender_type = 'user'
    AND is_read = FALSE;
$$ LANGUAGE sql STABLE;

-- 채팅방의 마지막 메시지 가져오기
CREATE OR REPLACE FUNCTION get_last_message(room_id_param UUID)
RETURNS TABLE (
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
  SELECT content, created_at
  FROM messages
  WHERE room_id = room_id_param
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================
-- 6. 실시간 구독을 위한 Realtime 활성화
-- ============================================

-- Realtime 활성화 (Supabase 대시보드에서도 설정 필요)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;

-- ============================================
-- 7. 샘플 데이터 (개발 환경용)
-- ============================================

-- 개발 환경 여부 확인 후 샘플 데이터 삽입
-- DO $$
-- BEGIN
--   IF current_database() LIKE '%dev%' OR current_database() LIKE '%local%' THEN
--     -- 샘플 채팅방 1: 일반 문의
--     INSERT INTO chat_rooms (user_device_id, user_name, room_type, status)
--     VALUES ('device_test_001', '김철수', 'general', 'active');
--
--     -- 샘플 채팅방 2: 민원 접수
--     INSERT INTO chat_rooms (user_device_id, user_name, room_type, status)
--     VALUES ('device_test_002', '이영희', 'complaint', 'active');
--   END IF;
-- END $$;

-- ============================================
-- 8. 권한 설정
-- ============================================

-- anon (익명 사용자) 및 authenticated (인증된 사용자) 권한 부여
GRANT SELECT, INSERT, UPDATE ON chat_rooms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO anon, authenticated;

-- ============================================
-- 완료
-- ============================================

COMMENT ON TABLE chat_rooms IS '채팅방 테이블 - 사용자별 대화방 관리';
COMMENT ON TABLE messages IS '메시지 테이블 - 채팅방 내 메시지 저장';

COMMENT ON COLUMN chat_rooms.room_type IS '채팅방 타입: general(일반 문의), complaint(민원 접수)';
COMMENT ON COLUMN chat_rooms.status IS '채팅방 상태: active(활성), closed(종료)';
COMMENT ON COLUMN messages.sender_type IS '발신자 타입: user(사용자), admin(관리자)';
