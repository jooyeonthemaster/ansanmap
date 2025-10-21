// 부스 카테고리별 스타일 설정
export const boothCategoryConfig = {
  robot: {
    name: '로봇',
    fillColor: '#60A5FA',
    strokeColor: '#2563EB',
    fillOpacity: 0.5,
    icon: '🤖'
  },
  ai: {
    name: 'AI/코딩',
    fillColor: '#A78BFA',
    strokeColor: '#7C3AED',
    fillOpacity: 0.5,
    icon: '💻'
  },
  science: {
    name: '과학실험',
    fillColor: '#34D399',
    strokeColor: '#059669',
    fillOpacity: 0.5,
    icon: '🧪'
  },
  making: {
    name: '만들기',
    fillColor: '#FBBF24',
    strokeColor: '#D97706',
    fillOpacity: 0.5,
    icon: '🔨'
  },
  experience: {
    name: '체험',
    fillColor: '#FB923C',
    strokeColor: '#EA580C',
    fillOpacity: 0.5,
    icon: '🎮'
  },
  photo: {
    name: '포토존',
    fillColor: '#F472B6',
    strokeColor: '#DB2777',
    fillOpacity: 0.5,
    icon: '📸'
  },
  attraction: {
    name: '놀이시설',
    fillColor: '#FB7185',
    strokeColor: '#E11D48',
    fillOpacity: 0.5,
    icon: '🎡'
  },
  talk: {
    name: '토크/공연',
    fillColor: '#C084FC',
    strokeColor: '#9333EA',
    fillOpacity: 0.5,
    icon: '🎤'
  },
  info: {
    name: '안내/기타',
    fillColor: '#94A3B8',
    strokeColor: '#475569',
    fillOpacity: 0.5,
    icon: 'ℹ️'
  }
} as const;

export type BoothCategory = keyof typeof boothCategoryConfig;