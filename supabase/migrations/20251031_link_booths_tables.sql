-- ================================================
-- Link Festival Booths and Booths Tables
-- 목적: festival_booths와 booths 테이블을 연결하여
--       축제 데이터 관리에서 추가한 부스가 부스 목록에 표시되도록 함
-- 날짜: 2025-10-31
-- ================================================

-- 1. booths 테이블에 booth_number 컬럼 추가
ALTER TABLE booths
ADD COLUMN IF NOT EXISTS booth_number TEXT;

-- 2. booth_number에 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_booths_booth_number
  ON booths(booth_number);

-- 3. booth_number에 UNIQUE 제약 조건 추가 (선택사항, 중복 방지)
-- 이미 부스가 있을 수 있으므로 주석 처리
-- ALTER TABLE booths ADD CONSTRAINT unique_booth_number UNIQUE (booth_number);

-- 4. 코멘트 추가 (문서화)
COMMENT ON COLUMN booths.booth_number IS '축제 부스 번호 (festival_booths와 연결용, 예: A1, S11, V1, F1)';
