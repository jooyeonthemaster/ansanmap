'use server';

import fs from 'fs/promises';
import path from 'path';
import { ASVFestival2025, FestivalBooth } from '@/asv-festival-2025.types';

const FESTIVAL_DATA_PATH = path.join(process.cwd(), 'asv-festival-2025.json');

/**
 * 축제 데이터 전체 조회
 */
export async function getFestivalData(): Promise<ASVFestival2025> {
  try {
    const fileContent = await fs.readFile(FESTIVAL_DATA_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading festival data:', error);
    throw new Error('축제 데이터를 불러올 수 없습니다.');
  }
}

/**
 * 특정 존의 부스 목록 조회
 */
export async function getZoneBooths(
  zone: 'advanceZone' | 'shineZone' | 'viewZone' | 'futureScienceZone'
): Promise<FestivalBooth[]> {
  const data = await getFestivalData();
  return data.zones[zone].booths;
}

/**
 * 부스 추가
 */
export async function addBooth(
  zone: 'advanceZone' | 'shineZone' | 'viewZone' | 'futureScienceZone',
  booth: FestivalBooth
): Promise<{ success: boolean; message: string }> {
  try {
    const data = await getFestivalData();

    // 중복 부스 번호 확인
    const existingBooth = data.zones[zone].booths.find(
      (b) => b.boothNumber === booth.boothNumber
    );

    if (existingBooth) {
      return {
        success: false,
        message: `부스 번호 ${booth.boothNumber}가 이미 존재합니다.`,
      };
    }

    // 부스 추가
    data.zones[zone].booths.push(booth);

    // 부스 번호 순으로 정렬
    data.zones[zone].booths.sort((a, b) => {
      const aNum = a.boothNumber.match(/\d+/)?.[0] || '0';
      const bNum = b.boothNumber.match(/\d+/)?.[0] || '0';
      return parseInt(aNum) - parseInt(bNum);
    });

    // 파일 저장
    await fs.writeFile(FESTIVAL_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return {
      success: true,
      message: '부스가 추가되었습니다.',
    };
  } catch (error) {
    console.error('Error adding booth:', error);
    return {
      success: false,
      message: '부스 추가에 실패했습니다.',
    };
  }
}

/**
 * 부스 수정
 */
export async function updateBooth(
  zone: 'advanceZone' | 'shineZone' | 'viewZone' | 'futureScienceZone',
  oldBoothNumber: string,
  updatedBooth: FestivalBooth
): Promise<{ success: boolean; message: string }> {
  try {
    const data = await getFestivalData();

    const boothIndex = data.zones[zone].booths.findIndex(
      (b) => b.boothNumber === oldBoothNumber
    );

    if (boothIndex === -1) {
      return {
        success: false,
        message: `부스 번호 ${oldBoothNumber}를 찾을 수 없습니다.`,
      };
    }

    // 부스 번호가 변경되었고, 새 번호가 이미 존재하는지 확인
    if (oldBoothNumber !== updatedBooth.boothNumber) {
      const existingBooth = data.zones[zone].booths.find(
        (b) => b.boothNumber === updatedBooth.boothNumber
      );

      if (existingBooth) {
        return {
          success: false,
          message: `부스 번호 ${updatedBooth.boothNumber}가 이미 존재합니다.`,
        };
      }
    }

    // 부스 업데이트
    data.zones[zone].booths[boothIndex] = updatedBooth;

    // 부스 번호 순으로 정렬
    data.zones[zone].booths.sort((a, b) => {
      const aNum = a.boothNumber.match(/\d+/)?.[0] || '0';
      const bNum = b.boothNumber.match(/\d+/)?.[0] || '0';
      return parseInt(aNum) - parseInt(bNum);
    });

    // 파일 저장
    await fs.writeFile(FESTIVAL_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return {
      success: true,
      message: '부스가 수정되었습니다.',
    };
  } catch (error) {
    console.error('Error updating booth:', error);
    return {
      success: false,
      message: '부스 수정에 실패했습니다.',
    };
  }
}

/**
 * 부스 삭제
 */
export async function deleteBooth(
  zone: 'advanceZone' | 'shineZone' | 'viewZone' | 'futureScienceZone',
  boothNumber: string
): Promise<{ success: boolean; message: string }> {
  try {
    const data = await getFestivalData();

    const boothIndex = data.zones[zone].booths.findIndex(
      (b) => b.boothNumber === boothNumber
    );

    if (boothIndex === -1) {
      return {
        success: false,
        message: `부스 번호 ${boothNumber}를 찾을 수 없습니다.`,
      };
    }

    // 부스 삭제
    data.zones[zone].booths.splice(boothIndex, 1);

    // 파일 저장
    await fs.writeFile(FESTIVAL_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return {
      success: true,
      message: '부스가 삭제되었습니다.',
    };
  } catch (error) {
    console.error('Error deleting booth:', error);
    return {
      success: false,
      message: '부스 삭제에 실패했습니다.',
    };
  }
}

/**
 * 전체 부스 검색
 */
export async function searchBooths(keyword: string): Promise<FestivalBooth[]> {
  const data = await getFestivalData();
  const allBooths: FestivalBooth[] = [
    ...data.zones.advanceZone.booths,
    ...data.zones.shineZone.booths,
    ...data.zones.viewZone.booths,
    ...data.zones.futureScienceZone.booths,
  ];

  if (!keyword) return allBooths;

  const lowerKeyword = keyword.toLowerCase();
  return allBooths.filter(
    (booth) =>
      booth.boothNumber.toLowerCase().includes(lowerKeyword) ||
      booth.programName.toLowerCase().includes(lowerKeyword) ||
      booth.organization.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * JSON 파일 데이터를 Supabase 부스와 동기화
 * 부스 번호로 매칭하여 name과 description 업데이트
 */
export async function syncFestivalDataToSupabase(): Promise<{
  success: boolean;
  message: string;
  details?: {
    total: number;
    updated: number;
    notFound: number;
  }
}> {
  try {
    // Supabase client를 동적으로 import (server-side)
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // JSON 파일에서 모든 부스 가져오기
    const festivalData = await getFestivalData();
    const allFestivalBooths: FestivalBooth[] = [
      ...festivalData.zones.advanceZone.booths,
      ...festivalData.zones.shineZone.booths,
      ...festivalData.zones.viewZone.booths,
      ...festivalData.zones.futureScienceZone.booths,
    ];

    // Supabase에서 모든 부스 가져오기
    const { data: supabaseBooths, error: fetchError } = await supabase
      .from('booths')
      .select('*');

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return {
        success: false,
        message: 'Supabase 부스 데이터를 불러오는데 실패했습니다.',
      };
    }

    let updatedCount = 0;
    let notFoundCount = 0;

    // 각 Supabase 부스에 대해 JSON 데이터와 매칭
    for (const supabaseBooth of supabaseBooths || []) {
      // 부스 번호 추출 (예: "A1 - AI바둑로봇 체험" → "A1")
      const boothNumberMatch = supabaseBooth.name.match(/^([A-Z]\d+)/);
      if (!boothNumberMatch) {
        continue; // 부스 번호 형식이 아니면 스킵
      }

      const boothNumber = boothNumberMatch[1];

      // JSON 데이터에서 매칭되는 부스 찾기
      const festivalBooth = allFestivalBooths.find(
        (fb) => fb.boothNumber === boothNumber
      );

      if (festivalBooth) {
        // 새로운 name과 description 생성
        const newName = `${festivalBooth.boothNumber} - ${festivalBooth.programName}`;
        const newDescription = festivalBooth.organization;

        // Supabase 업데이트 (변경사항이 있을 때만)
        if (
          supabaseBooth.name !== newName ||
          supabaseBooth.description !== newDescription
        ) {
          const { error: updateError } = await supabase
            .from('booths')
            .update({
              name: newName,
              description: newDescription,
            })
            .eq('id', supabaseBooth.id);

          if (updateError) {
            console.error(`Update error for booth ${boothNumber}:`, updateError);
          } else {
            updatedCount++;
          }
        }
      } else {
        notFoundCount++;
      }
    }

    return {
      success: true,
      message: `동기화 완료: ${updatedCount}개 부스 업데이트됨`,
      details: {
        total: supabaseBooths?.length || 0,
        updated: updatedCount,
        notFound: notFoundCount,
      },
    };
  } catch (error) {
    console.error('Sync error:', error);
    return {
      success: false,
      message: '동기화 중 오류가 발생했습니다.',
    };
  }
}