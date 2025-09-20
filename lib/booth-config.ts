// 부스 카테고리별 스타일 설정
export const boothCategoryConfig = {
  food: {
    name: '먹거리',
    fillColor: '#FF6B6B',
    strokeColor: '#C92A2A',
    fillOpacity: 0.5,
    icon: '🍔'
  },
  beverage: {
    name: '음료',
    fillColor: '#4DABF7',
    strokeColor: '#1C7ED6',
    fillOpacity: 0.5,
    icon: '🥤'
  },
  game: {
    name: '게임/체험',
    fillColor: '#69DB7C',
    strokeColor: '#2F9E44',
    fillOpacity: 0.5,
    icon: '🎮'
  },
  experience: {
    name: '체험',
    fillColor: '#60A5FA',
    strokeColor: '#2563EB',
    fillOpacity: 0.5,
    icon: '🧪'
  },
  shop: {
    name: '판매',
    fillColor: '#FFD43B',
    strokeColor: '#FAB005',
    fillOpacity: 0.5,
    icon: '🛍️'
  },
  goods: {
    name: '굿즈',
    fillColor: '#FBBF24',
    strokeColor: '#D97706',
    fillOpacity: 0.5,
    icon: '🎁'
  },
  info: {
    name: '안내',
    fillColor: '#ADB5BD',
    strokeColor: '#495057',
    fillOpacity: 0.5,
    icon: 'ℹ️'
  },
  stage: {
    name: '무대/공연',
    fillColor: '#DA77F2',
    strokeColor: '#9C36B5',
    fillOpacity: 0.5,
    icon: '🎤'
  },
  photo: {
    name: '포토존',
    fillColor: '#34D399',
    strokeColor: '#059669',
    fillOpacity: 0.5,
    icon: '📸'
  }
} as const;

export type BoothCategory = keyof typeof boothCategoryConfig;