// Festival Info Types
export interface FestivalInfo {
  id: string;

  // 축제 기본 정보
  festival_name: string;
  festival_dates: string;

  // 일정
  day1_date: string;
  day1_hours: string;
  day2_date: string;
  day2_hours: string;

  // 오시는 길
  address: string;
  campus_name: string;
  subway_info: string;
  bus_info: string;

  // 문의
  main_contact_label: string;
  main_contact: string;
  support_contact_label: string;
  support_contact: string;
  lost_found_contact_label: string;
  lost_found_contact: string;

  // 메타 정보
  created_at: string;
  updated_at: string;
}

export type FestivalInfoUpdate = Omit<FestivalInfo, 'id' | 'created_at' | 'updated_at'>;
