import { Favorite, CheckInRecord, Announcement } from '../types';
import { getBooths as getBoothsFromStorage } from '../booth-storage';

export { getBoothsFromStorage as getBooths };

const FAVORITES_KEY = 'festival_favorites';
const CHECKINS_KEY = 'festival_checkins';
const ANNOUNCEMENTS_KEY = 'festival_announcements';
const VISITED_BOOTHS_KEY = 'visited_booths';

// 즐겨찾기 관리
export const getFavorites = (): Favorite[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

export const addFavorite = (boothId: string, notificationEnabled: boolean = false): void => {
  const favorites = getFavorites();
  if (!favorites.find(f => f.boothId === boothId)) {
    favorites.push({
      boothId,
      addedAt: new Date().toISOString(),
      notificationEnabled
    });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = (boothId: string): void => {
  const favorites = getFavorites().filter(f => f.boothId !== boothId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const isFavorite = (boothId: string): boolean => {
  return getFavorites().some(f => f.boothId === boothId);
};

// 체크인 기록 관리
export const getCheckIns = (): CheckInRecord[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CHECKINS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addCheckIn = (boothId: string, points: number = 10): void => {
  const checkIns = getCheckIns();
  checkIns.push({
    boothId,
    timestamp: new Date().toISOString(),
    points
  });
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
  
  // 방문한 부스 기록
  const visitedBooths = getVisitedBooths();
  if (!visitedBooths.includes(boothId)) {
    visitedBooths.push(boothId);
    localStorage.setItem(VISITED_BOOTHS_KEY, JSON.stringify(visitedBooths));
  }
};

export const getVisitedBooths = (): string[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(VISITED_BOOTHS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getTotalPoints = (): number => {
  return getCheckIns().reduce((sum, checkIn) => sum + (checkIn.points || 0), 0);
};

// 공지사항 관리
export const getAnnouncements = (): Announcement[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
  const announcements = data ? JSON.parse(data) : [];
  
  // 만료되지 않은 공지사항만 필터링 (legacy support)
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return announcements.filter((a: any) => {
    if (!a.expiresAt) return true;
    return new Date(a.expiresAt) > now;
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addAnnouncement = (announcement: any): void => {
  const announcements = getAnnouncements();
  announcements.push({
    ...announcement,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  });
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
};

// 혼잡도 계산 유틸리티
export const calculateCongestionLevel = (currentVisitors: number, maxCapacity: number) => {
  const ratio = currentVisitors / maxCapacity;
  
  if (ratio < 0.3) return 'low';
  if (ratio < 0.6) return 'medium';
  if (ratio < 0.85) return 'high';
  return 'very-high';
};

// 대기 시간 계산 (혼잡도 기반 예측)
export const estimateWaitingTime = (congestionLevel: string): number => {
  switch (congestionLevel) {
    case 'low': return 0;
    case 'medium': return 5;
    case 'high': return 15;
    case 'very-high': return 30;
    default: return 0;
  }
};
