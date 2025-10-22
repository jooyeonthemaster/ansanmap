-- 채팅방 중요 표시 기능 추가
-- 2025-01-22: 관리자 채팅방 관리 개선

-- chat_rooms 테이블에 is_important 컬럼 추가
ALTER TABLE chat_rooms
ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE;

-- 인덱스 생성 (중요 채팅방 필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_chat_rooms_important
ON chat_rooms(is_important, updated_at DESC)
WHERE is_important = TRUE;

-- 코멘트 추가
COMMENT ON COLUMN chat_rooms.is_important IS '중요 채팅방 표시 (관리자 북마크)';
