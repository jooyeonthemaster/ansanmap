import { BoothCategory } from './booth-config';

// 좌표 타입
export interface Coordinate {
  lat: number;
  lng: number;
}

// 혼잡도 레벨
export type CongestionLevel = 'low' | 'medium' | 'high' | 'very-high';

// 부스 타입
export interface Booth {
  id: string;
  name: string;
  category: BoothCategory;
  description: string;
  coordinates: Coordinate[]; // 폴리곤 좌표들
  operatingHours: string;
  contact?: string;
  menuItems?: string[]; // 먹거리/음료 부스용
  price?: string; // 가격 정보
  isActive: boolean; // 운영 중 여부
  congestionLevel?: CongestionLevel; // 혼잡도
  waitingTime?: number; // 예상 대기 시간 (분)
  webcamUrl?: string; // 웹캠 스트리밍 URL
  popularityScore?: number; // 인기도 점수
  currentVisitors?: number; // 현재 방문자 수
  maxCapacity?: number; // 최대 수용 인원
  tags?: string[]; // 검색용 태그
  createdAt: string;
  updatedAt: string;
}

// 부스 생성 DTO
export interface CreateBoothDto {
  name: string;
  category: BoothCategory;
  description: string;
  coordinates: Coordinate[];
  operatingHours: string;
  contact?: string;
  menuItems?: string[];
  price?: string;
  webcamUrl?: string;
  maxCapacity?: number;
  tags?: string[];
}

// 공지사항 타입
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expiresAt?: string;
}

// 사용자 체크인 기록
export interface CheckInRecord {
  boothId: string;
  timestamp: string;
  points?: number;
}

// 즐겨찾기 타입
export interface Favorite {
  boothId: string;
  addedAt: string;
  notificationEnabled: boolean;
}
