-- ================================================
-- Festival Booths Table Migration
-- 목적: JSON 파일 기반 축제 부스 데이터를 Supabase로 이관
-- 날짜: 2025-10-31
-- ================================================

-- 1. festival_booths 테이블 생성
CREATE TABLE IF NOT EXISTS festival_booths (
  -- 기본 키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 부스 정보
  booth_number TEXT NOT NULL UNIQUE,  -- 부스 번호 (예: A1, S11, V1, F1, k11)
  program_name TEXT NOT NULL,         -- 프로그램명
  organization TEXT NOT NULL,         -- 운영기관

  -- Zone 정보
  zone_key TEXT NOT NULL,             -- Zone 키 (advanceZone, shineZone, viewZone, futureScienceZone)
  zone_name TEXT NOT NULL,            -- Zone 이름 (Advance Zone, Shine Zone, etc.)
  zone_theme TEXT,                    -- Zone 테마 (발전하는 과학, 빛나는 과학, etc.)

  -- 정렬 순서 (부스 번호 기준)
  sort_order INTEGER,                 -- 정렬용 숫자 (A1=1, A2=2, etc.)

  -- 메타 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_festival_booths_booth_number
  ON festival_booths(booth_number);

CREATE INDEX IF NOT EXISTS idx_festival_booths_zone_key
  ON festival_booths(zone_key);

CREATE INDEX IF NOT EXISTS idx_festival_booths_sort_order
  ON festival_booths(sort_order);

-- 텍스트 검색용 인덱스 (부스 번호, 프로그램명, 운영기관)
CREATE INDEX IF NOT EXISTS idx_festival_booths_search
  ON festival_booths
  USING gin(to_tsvector('simple', booth_number || ' ' || program_name || ' ' || organization));

-- 3. RLS (Row Level Security) 설정
ALTER TABLE festival_booths ENABLE ROW LEVEL SECURITY;

-- 읽기 정책: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can read festival booths"
  ON festival_booths
  FOR SELECT
  USING (true);

-- 쓰기 정책: 인증된 사용자만 수정 가능 (관리자용)
CREATE POLICY "Authenticated users can insert festival booths"
  ON festival_booths
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update festival booths"
  ON festival_booths
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete festival booths"
  ON festival_booths
  FOR DELETE
  USING (true);

-- 4. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_festival_booths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER festival_booths_updated_at
  BEFORE UPDATE ON festival_booths
  FOR EACH ROW
  EXECUTE FUNCTION update_festival_booths_updated_at();

-- 5. 부스 번호에서 숫자 추출 함수 (정렬용)
CREATE OR REPLACE FUNCTION extract_booth_sort_order(booth_number TEXT)
RETURNS INTEGER AS $$
DECLARE
  num_part TEXT;
BEGIN
  -- 부스 번호에서 숫자 부분만 추출 (예: A1 → 1, S11 → 11, k11 → 11)
  num_part := regexp_replace(booth_number, '[^0-9]', '', 'g');

  IF num_part = '' THEN
    RETURN 0;
  ELSE
    RETURN num_part::INTEGER;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. 코멘트 추가 (문서화)
COMMENT ON TABLE festival_booths IS '축제 프로그램 부스 정보 (Zone별)';
COMMENT ON COLUMN festival_booths.booth_number IS '부스 번호 (고유값)';
COMMENT ON COLUMN festival_booths.program_name IS '프로그램명';
COMMENT ON COLUMN festival_booths.organization IS '운영기관';
COMMENT ON COLUMN festival_booths.zone_key IS 'Zone 키 (advanceZone, shineZone, viewZone, futureScienceZone)';
COMMENT ON COLUMN festival_booths.sort_order IS '정렬 순서 (부스 번호의 숫자 부분)';