import { BoothCategory } from './booth-config';

// Re-export BoothCategory
export type { BoothCategory };

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
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 공지사항 생성 DTO
export interface CreateAnnouncementDto {
  title: string;
  content: string;
  priority?: AnnouncementPriority;
  is_active?: boolean;
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

// ============================================
// 메시지 시스템 타입
// ============================================

// 채팅방 타입
export type RoomType = 'general' | 'complaint';
export type RoomStatus = 'active' | 'closed';

// 발신자 타입
export type SenderType = 'user' | 'admin';

// 채팅방 인터페이스
export interface ChatRoom {
  id: string;
  user_device_id: string;
  user_name: string;
  room_type: RoomType;
  status: RoomStatus;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  is_important: boolean; // 중요 채팅방 표시
  created_at: string;
  updated_at: string;
}

// 메시지 인터페이스
export interface Message {
  id: string;
  room_id: string;
  sender_type: SenderType;
  content: string;
  is_read: boolean;
  created_at: string;
}

// 채팅방 생성 DTO
export interface CreateChatRoomDto {
  user_device_id: string;
  user_name?: string;
  room_type: RoomType;
}

// 메시지 생성 DTO
export interface CreateMessageDto {
  room_id: string;
  sender_type: SenderType;
  content: string;
}
