import { Booth } from './types';
import { saveBooths } from './booth-storage';
import { addAnnouncement } from './utils/storage';

// 안산 문화광장 중심점
const CENTER_LAT = 37.3219;
const CENTER_LNG = 126.8308;

// 샘플 부스 데이터 생성 (향상된 버전)
export function generateSampleBooths(): Booth[] {
  const sampleBooths: Booth[] = [
    {
      id: 'booth_sample_1',
      name: '안산 떡볶이',
      category: 'food',
      description: '매콤달콤한 안산 특제 떡볶이! 순한맛, 중간맛, 매운맛 선택 가능',
      coordinates: [
        { lat: CENTER_LAT + 0.0002, lng: CENTER_LNG - 0.0003 },
        { lat: CENTER_LAT + 0.0002, lng: CENTER_LNG - 0.0001 },
        { lat: CENTER_LAT + 0.0001, lng: CENTER_LNG - 0.0001 },
        { lat: CENTER_LAT + 0.0001, lng: CENTER_LNG - 0.0003 }
      ],
      operatingHours: '10:00 - 22:00',
      contact: '010-1234-5678',
      menuItems: ['떡볶이', '순대', '어묵', '김밥'],
      price: '떡볶이 5,000원 / 순대 4,000원',
      isActive: true,
      congestionLevel: 'high',
      waitingTime: 15,
      currentVisitors: 42,
      maxCapacity: 50,
      popularityScore: 4.5,
      tags: ['매운맛', '인기메뉴', '안산명물'],
      webcamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },    {
      id: 'booth_sample_2',
      name: '수제 레모네이드',
      category: 'beverage',
      description: '상큼한 수제 레모네이드와 과일 에이드',
      coordinates: [
        { lat: CENTER_LAT - 0.0001, lng: CENTER_LNG + 0.0002 },
        { lat: CENTER_LAT - 0.0001, lng: CENTER_LNG + 0.0004 },
        { lat: CENTER_LAT - 0.0002, lng: CENTER_LNG + 0.0004 },
        { lat: CENTER_LAT - 0.0002, lng: CENTER_LNG + 0.0002 }
      ],
      operatingHours: '10:00 - 21:00',
      menuItems: ['레모네이드', '청포도에이드', '자몽에이드', '아이스티'],
      price: '4,000원 ~ 5,000원',
      isActive: true,
      congestionLevel: 'low',
      waitingTime: 0,
      currentVisitors: 8,
      maxCapacity: 30,
      popularityScore: 4.2,
      tags: ['음료', '시원한', '수제'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'booth_sample_3',
      name: 'VR 체험존',
      category: 'game',
      description: '최신 VR 게임 체험! 다양한 장르의 게임을 즐겨보세요',
      coordinates: [
        { lat: CENTER_LAT + 0.0003, lng: CENTER_LNG + 0.0001 },
        { lat: CENTER_LAT + 0.0003, lng: CENTER_LNG + 0.0003 },
        { lat: CENTER_LAT + 0.0002, lng: CENTER_LNG + 0.0003 },
        { lat: CENTER_LAT + 0.0002, lng: CENTER_LNG + 0.0001 }
      ],
      operatingHours: '10:00 - 20:00',
      contact: '010-9876-5432',
      price: '10분 5,000원',
      isActive: true,
      congestionLevel: 'very-high',
      waitingTime: 30,
      currentVisitors: 25,
      maxCapacity: 25,
      popularityScore: 4.8,
      tags: ['VR', '게임', '체험', '인기'],
      webcamUrl: 'https://www.youtube.com/watch?v=live_stream_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },    {
      id: 'booth_sample_4',
      name: '전통 공예 체험',
      category: 'experience',
      description: '한국 전통 공예품 만들기 체험 (부채, 매듭, 한지공예)',
      coordinates: [
        { lat: CENTER_LAT - 0.0003, lng: CENTER_LNG - 0.0002 },
        { lat: CENTER_LAT - 0.0003, lng: CENTER_LNG },
        { lat: CENTER_LAT - 0.0004, lng: CENTER_LNG },
        { lat: CENTER_LAT - 0.0004, lng: CENTER_LNG - 0.0002 }
      ],
      operatingHours: '11:00 - 19:00',
      price: '체험별 10,000원 ~ 15,000원',
      isActive: true,
      congestionLevel: 'medium',
      waitingTime: 10,
      currentVisitors: 15,
      maxCapacity: 40,
      popularityScore: 4.3,
      tags: ['체험', '전통', '공예', '가족'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'booth_sample_5',
      name: '포토존',
      category: 'photo',
      description: '인생샷 포토존! 다양한 배경과 소품으로 추억을 남기세요',
      coordinates: [
        { lat: CENTER_LAT, lng: CENTER_LNG - 0.0004 },
        { lat: CENTER_LAT, lng: CENTER_LNG - 0.0002 },
        { lat: CENTER_LAT - 0.0001, lng: CENTER_LNG - 0.0002 },
        { lat: CENTER_LAT - 0.0001, lng: CENTER_LNG - 0.0004 }
      ],
      operatingHours: '10:00 - 21:00',
      isActive: true,
      congestionLevel: 'medium',
      waitingTime: 5,
      currentVisitors: 20,
      maxCapacity: 50,
      popularityScore: 4.6,
      tags: ['포토존', '인스타', 'SNS', '추억'],
      webcamUrl: 'https://www.youtube.com/watch?v=live_stream_2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'booth_sample_6',
      name: '굿즈 판매',
      category: 'goods',
      description: '축제 공식 굿즈 및 기념품 판매',
      coordinates: [
        { lat: CENTER_LAT + 0.0001, lng: CENTER_LNG + 0.0004 },
        { lat: CENTER_LAT + 0.0001, lng: CENTER_LNG + 0.0006 },
        { lat: CENTER_LAT, lng: CENTER_LNG + 0.0006 },
        { lat: CENTER_LAT, lng: CENTER_LNG + 0.0004 }
      ],
      operatingHours: '10:00 - 20:00',
      contact: '031-123-4567',
      menuItems: ['티셔츠', '에코백', '스티커', '키링', '엽서'],
      price: '5,000원 ~ 25,000원',
      isActive: true,
      congestionLevel: 'low',
      waitingTime: 0,
      currentVisitors: 10,
      maxCapacity: 40,
      popularityScore: 4.0,
      tags: ['굿즈', '기념품', '선물'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return sampleBooths;
}

// 샘플 데이터 초기화
export function initializeSampleData() {
  const sampleBooths = generateSampleBooths();
  saveBooths(sampleBooths);
  
  // 샘플 공지사항 추가
  addAnnouncement({
    title: '🎉 오후 3시 특별 이벤트',
    content: '메인 무대에서 K-POP 공연이 시작됩니다!',
    priority: 'high',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  });
  
  addAnnouncement({
    title: '⚠️ VR 체험존 대기 시간 증가',
    content: '현재 30분 이상 대기가 예상됩니다',
    priority: 'medium'
  });
  
  addAnnouncement({
    title: '📍 분실물 안내',
    content: '운영본부에서 보관중입니다',
    priority: 'low'
  });
  
  console.log('샘플 데이터가 초기화되었습니다.');
}