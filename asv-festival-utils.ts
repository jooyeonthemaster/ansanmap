import type { ASVFestival2025, Booth, BoothNumber, ZoneType } from './asv-festival-2025.types';
import festivalData from './asv-festival-2025.json';

const data = festivalData as ASVFestival2025;

/**
 * 부스 번호로 부스 정보를 검색
 */
export function findBoothByNumber(boothNumber: string): Booth | null {
  const zones: ZoneType[] = ['advanceZone', 'shineZone', 'viewZone', 'futureScienceZone'];
  
  for (const zoneName of zones) {
    const zone = data.zones[zoneName];
    if ('booths' in zone) {
      const booth = zone.booths.find(b => b.boothNumber === boothNumber);
      if (booth) return booth;
    }
  }
  
  return null;
}

/**
 * 프로그램명으로 부스 검색 (부분 일치)
 */
export function searchBoothsByProgramName(keyword: string): Booth[] {
  const results: Booth[] = [];
  const zones: ZoneType[] = ['advanceZone', 'shineZone', 'viewZone', 'futureScienceZone'];
  
  for (const zoneName of zones) {
    const zone = data.zones[zoneName];
    if ('booths' in zone) {
      const matches = zone.booths.filter(b => 
        b.programName.toLowerCase().includes(keyword.toLowerCase())
      );
      results.push(...matches);
    }
  }
  
  return results;
}

/**
 * 운영기관으로 부스 검색 (부분 일치)
 */
export function searchBoothsByOrganization(keyword: string): Booth[] {
  const results: Booth[] = [];
  const zones: ZoneType[] = ['advanceZone', 'shineZone', 'viewZone', 'futureScienceZone'];
  
  for (const zoneName of zones) {
    const zone = data.zones[zoneName];
    if ('booths' in zone) {
      const matches = zone.booths.filter(b => 
        b.organization.toLowerCase().includes(keyword.toLowerCase())
      );
      results.push(...matches);
    }
  }
  
  return results;
}

/**
 * 특정 존의 모든 부스 가져오기
 */
export function getBoothsByZone(zoneName: ZoneType): Booth[] {
  const zone = data.zones[zoneName];
  return 'booths' in zone ? zone.booths : [];
}

/**
 * 전체 부스 개수 가져오기
 */
export function getTotalBoothCount(): number {
  let count = 0;
  const zones: ZoneType[] = ['advanceZone', 'shineZone', 'viewZone', 'futureScienceZone'];
  
  for (const zoneName of zones) {
    const zone = data.zones[zoneName];
    if ('booths' in zone) {
      count += zone.booths.length;
    }
  }
  
  return count;
}

/**
 * 축제 정보 가져오기
 */
export function getFestivalInfo() {
  return data.festivalInfo;
}

/**
 * 모든 존 정보 가져오기
 */
export function getAllZones() {
  return data.zones;
}

// 사용 예제
console.log('=== 2025 ASV 과학축제 데이터 ===\n');

console.log('축제 정보:');
console.log(getFestivalInfo());
console.log('\n전체 부스 개수:', getTotalBoothCount());

console.log('\n=== A1 부스 정보 ===');
console.log(findBoothByNumber('A1'));

console.log('\n=== "로봇" 키워드로 프로그램 검색 ===');
const robotBooths = searchBoothsByProgramName('로봇');
console.log(`총 ${robotBooths.length}개의 부스 발견`);
robotBooths.slice(0, 3).forEach(booth => {
  console.log(`- [${booth.boothNumber}] ${booth.programName}`);
});

console.log('\n=== 한양대학교 운영 부스 검색 ===');
const hanyangBooths = searchBoothsByOrganization('한양대학교');
console.log(`총 ${hanyangBooths.length}개의 부스 발견`);

console.log('\n=== Advance Zone 부스 목록 ===');
const advanceBooths = getBoothsByZone('advanceZone');
console.log(`총 ${advanceBooths.length}개의 부스`);
advanceBooths.slice(0, 5).forEach(booth => {
  console.log(`- [${booth.boothNumber}] ${booth.programName}`);
});

console.log('\n=== 88로봇위크 프로그램 ===');
const robotWeek = data.zones.robotWeek88;
robotWeek.programs.forEach(program => {
  console.log(`- ${program.programName}: ${program.location}`);
});

export { data as festivalData };
export type { ASVFestival2025, Booth, BoothNumber, ZoneType };
