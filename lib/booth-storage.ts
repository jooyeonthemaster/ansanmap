import { Booth, CreateBoothDto } from './types';

const STORAGE_KEY = 'festival_booths';

// 로컬스토리지에서 부스 목록 가져오기
export function getBooths(): Booth[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// 부스 저장하기
export function saveBooths(booths: Booth[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(booths));
}

// 새 부스 추가
export function addBooth(boothData: CreateBoothDto): Booth {
  const newBooth: Booth = {
    ...boothData,
    id: generateId(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const booths = getBooths();
  booths.push(newBooth);
  saveBooths(booths);
  
  return newBooth;
}
// 부스 업데이트
export function updateBooth(id: string, updates: Partial<Booth>): void {
  const booths = getBooths();
  const index = booths.findIndex(b => b.id === id);
  
  if (index !== -1) {
    booths[index] = {
      ...booths[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveBooths(booths);
  }
}

// 부스 삭제
export function deleteBooth(id: string): void {
  const booths = getBooths();
  const filtered = booths.filter(b => b.id !== id);
  saveBooths(filtered);
}

// ID 생성 헬퍼
function generateId(): string {
  return `booth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}