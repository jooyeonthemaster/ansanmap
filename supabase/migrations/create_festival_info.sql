-- Create festival_info table for managing festival basic information
CREATE TABLE IF NOT EXISTS festival_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 축제 기본 정보
  festival_name TEXT NOT NULL DEFAULT '한양대 ERICA 축제',
  festival_dates TEXT NOT NULL DEFAULT '2025.11.01 - 11.02',

  -- 일정
  day1_date TEXT NOT NULL DEFAULT '11월 1일 (토)',
  day1_hours TEXT NOT NULL DEFAULT '10:00 - 17:00',
  day2_date TEXT NOT NULL DEFAULT '11월 2일 (일)',
  day2_hours TEXT NOT NULL DEFAULT '10:00 - 17:00',

  -- 오시는 길
  address TEXT NOT NULL DEFAULT '경기도 안산시 상록구 한양대학로 55',
  campus_name TEXT NOT NULL DEFAULT '한양대학교 ERICA 캠퍼스',
  subway_info TEXT NOT NULL DEFAULT '4호선 한대앞역 셔틀버스 이용',
  bus_info TEXT NOT NULL DEFAULT '110, 110-1, 32, 3100번',

  -- 문의
  main_contact_label TEXT NOT NULL DEFAULT '축제 운영본부',
  main_contact TEXT NOT NULL DEFAULT '031-400-5114',
  support_contact_label TEXT NOT NULL DEFAULT '학생지원팀',
  support_contact TEXT NOT NULL DEFAULT '031-400-5115',
  lost_found_contact_label TEXT NOT NULL DEFAULT '분실물센터',
  lost_found_contact TEXT NOT NULL DEFAULT '031-400-5116',

  -- 메타 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default data
INSERT INTO festival_info (
  festival_name,
  festival_dates,
  day1_date,
  day1_hours,
  day2_date,
  day2_hours,
  address,
  campus_name,
  subway_info,
  bus_info,
  main_contact_label,
  main_contact,
  support_contact_label,
  support_contact,
  lost_found_contact_label,
  lost_found_contact
) VALUES (
  '한양대 ERICA 축제',
  '2025.11.01 - 11.02',
  '11월 1일 (토)',
  '10:00 - 17:00',
  '11월 2일 (일)',
  '10:00 - 17:00',
  '경기도 안산시 상록구 한양대학로 55',
  '한양대학교 ERICA 캠퍼스',
  '4호선 한대앞역 셔틀버스 이용',
  '110, 110-1, 32, 3100번',
  '축제 운영본부',
  '031-400-5114',
  '학생지원팀',
  '031-400-5115',
  '분실물센터',
  '031-400-5116'
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE festival_info ENABLE ROW LEVEL SECURITY;

-- Create policy: Everyone can read
CREATE POLICY "Anyone can read festival info"
  ON festival_info
  FOR SELECT
  USING (true);

-- Create policy: Only authenticated users can update (for admin)
CREATE POLICY "Authenticated users can update festival info"
  ON festival_info
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_festival_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER festival_info_updated_at
  BEFORE UPDATE ON festival_info
  FOR EACH ROW
  EXECUTE FUNCTION update_festival_info_updated_at();
