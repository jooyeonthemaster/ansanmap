import { supabase } from './client';

/**
 * Festival Booths Supabase API
 * 축제 부스 데이터를 Supabase에서 관리
 */

// 타입 정의
export interface FestivalBooth {
  id?: string;
  booth_number: string;
  program_name: string;
  organization: string;
  zone_key: string;
  zone_name: string;
  zone_theme: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFestivalBoothDto {
  booth_number: string;
  program_name: string;
  organization: string;
  zone_key: string;
  zone_name: string;
  zone_theme?: string | null;
}

export interface UpdateFestivalBoothDto {
  booth_number?: string;
  program_name?: string;
  organization?: string;
  zone_key?: string;
  zone_name?: string;
  zone_theme?: string | null;
}

// Zone별 부스 조회
export async function getBoothsByZone(zoneKey: string): Promise<FestivalBooth[]> {
  const { data, error } = await supabase
    .from('festival_booths')
    .select('*')
    .eq('zone_key', zoneKey)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching booths by zone:', error);
    return [];
  }

  return data || [];
}

// 모든 부스 조회
export async function getAllFestivalBooths(): Promise<FestivalBooth[]> {
  const { data, error } = await supabase
    .from('festival_booths')
    .select('*')
    .order('zone_key', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching all festival booths:', error);
    return [];
  }

  return data || [];
}

// 부스 번호로 조회
export async function getBoothByNumber(boothNumber: string): Promise<FestivalBooth | null> {
  const { data, error } = await supabase
    .from('festival_booths')
    .select('*')
    .eq('booth_number', boothNumber)
    .maybeSingle();

  if (error) {
    console.error('Error fetching booth by number:', error);
    return null;
  }

  return data;
}

// 부스 추가
export async function addFestivalBooth(
  boothData: CreateFestivalBoothDto
): Promise<{ success: boolean; message: string; data?: FestivalBooth }> {
  try {
    // 중복 부스 번호 확인
    const existingBooth = await getBoothByNumber(boothData.booth_number);
    if (existingBooth) {
      return {
        success: false,
        message: `부스 번호 ${boothData.booth_number}가 이미 존재합니다.`,
      };
    }

    // 정렬 순서 계산
    const sortOrder = extractSortOrder(boothData.booth_number);

    const { data, error } = await supabase
      .from('festival_booths')
      .insert({
        ...boothData,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding festival booth:', error);
      return {
        success: false,
        message: '부스 추가에 실패했습니다.',
      };
    }

    return {
      success: true,
      message: '부스가 추가되었습니다.',
      data,
    };
  } catch (error) {
    console.error('Error adding festival booth:', error);
    return {
      success: false,
      message: '부스 추가 중 오류가 발생했습니다.',
    };
  }
}

// 부스 수정
export async function updateFestivalBooth(
  oldBoothNumber: string,
  updates: UpdateFestivalBoothDto
): Promise<{ success: boolean; message: string }> {
  try {
    // 기존 부스 확인
    const existingBooth = await getBoothByNumber(oldBoothNumber);
    if (!existingBooth) {
      return {
        success: false,
        message: `부스 번호 ${oldBoothNumber}를 찾을 수 없습니다.`,
      };
    }

    // 부스 번호가 변경되었고, 새 번호가 이미 존재하는지 확인
    if (updates.booth_number && updates.booth_number !== oldBoothNumber) {
      const duplicateBooth = await getBoothByNumber(updates.booth_number);
      if (duplicateBooth) {
        return {
          success: false,
          message: `부스 번호 ${updates.booth_number}가 이미 존재합니다.`,
        };
      }
    }

    // 정렬 순서 재계산 (부스 번호가 변경된 경우)
    const sortOrder = updates.booth_number
      ? extractSortOrder(updates.booth_number)
      : undefined;

    const { error } = await supabase
      .from('festival_booths')
      .update({
        ...updates,
        ...(sortOrder !== undefined && { sort_order: sortOrder }),
      })
      .eq('booth_number', oldBoothNumber);

    if (error) {
      console.error('Error updating festival booth:', error);
      return {
        success: false,
        message: '부스 수정에 실패했습니다.',
      };
    }

    return {
      success: true,
      message: '부스가 수정되었습니다.',
    };
  } catch (error) {
    console.error('Error updating festival booth:', error);
    return {
      success: false,
      message: '부스 수정 중 오류가 발생했습니다.',
    };
  }
}

// 부스 삭제
export async function deleteFestivalBooth(
  boothNumber: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('festival_booths')
      .delete()
      .eq('booth_number', boothNumber);

    if (error) {
      console.error('Error deleting festival booth:', error);
      return {
        success: false,
        message: '부스 삭제에 실패했습니다.',
      };
    }

    return {
      success: true,
      message: '부스가 삭제되었습니다.',
    };
  } catch (error) {
    console.error('Error deleting festival booth:', error);
    return {
      success: false,
      message: '부스 삭제 중 오류가 발생했습니다.',
    };
  }
}

// 부스 검색 (부스번호, 프로그램명, 운영기관)
export async function searchFestivalBooths(keyword: string): Promise<FestivalBooth[]> {
  if (!keyword.trim()) {
    return getAllFestivalBooths();
  }

  const lowerKeyword = keyword.toLowerCase();

  const { data, error } = await supabase
    .from('festival_booths')
    .select('*')
    .or(
      `booth_number.ilike.%${lowerKeyword}%,program_name.ilike.%${lowerKeyword}%,organization.ilike.%${lowerKeyword}%`
    )
    .order('zone_key', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error searching festival booths:', error);
    return [];
  }

  return data || [];
}

// 유틸리티 함수: 부스 번호에서 정렬 순서 추출
function extractSortOrder(boothNumber: string): number {
  const match = boothNumber.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// 실시간 구독 (선택사항)
export function subscribeFestivalBooths(callback: (booths: FestivalBooth[]) => void) {
  const channel = supabase
    .channel('festival_booths-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'festival_booths',
      },
      async () => {
        const booths = await getAllFestivalBooths();
        callback(booths);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
