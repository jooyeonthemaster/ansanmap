/**
 * 2025 안산사이언스밸리(ASV) 과학축제 데이터 타입 정의
 */

export interface FestivalInfo {
  name: string;
  dates: string;
  location: string;
  website: string;
}

export interface Booth {
  boothNumber: string;
  programName: string;
  organization: string;
}

export interface Zone {
  name: string;
  theme: string;
  booths: Booth[];
}

export interface RobotWeekProgram {
  programName: string;
  description: string;
  location: string;
}

export interface RobotWeek88 {
  name: string;
  location: string;
  programs: RobotWeekProgram[];
}

export interface Zones {
  advanceZone: Zone;
  shineZone: Zone;
  viewZone: Zone;
  futureScienceZone: Zone;
  robotWeek88: RobotWeek88;
}

export interface ASVFestival2025 {
  festivalInfo: FestivalInfo;
  zones: Zones;
}

/**
 * 부스 번호로 부스 정보를 검색하는 헬퍼 타입
 */
export type BoothNumber = 
  | `A${number}`
  | `S${number}`
  | `V${number}`
  | `F${number}`
  | 'G1'
  | '(공연)'
  | '데이터센터'
  | '민주광장';

/**
 * 존 타입
 */
export type ZoneType = 
  | 'advanceZone'
  | 'shineZone'
  | 'viewZone'
  | 'futureScienceZone'
  | 'robotWeek88';
