-- Realtime publication 재설정
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 publication에서 제거 (에러 무시)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE messages;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE chat_rooms;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. 다시 추가
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;

-- 3. 확인
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
