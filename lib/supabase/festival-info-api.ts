import { createClient } from './client';
import { FestivalInfo, FestivalInfoUpdate } from '@/lib/types/festival-info';

/**
 * 축제 정보 조회
 */
export async function getFestivalInfo(): Promise<FestivalInfo | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('festival_info')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching festival info:', error);
    return null;
  }

  return data;
}

/**
 * 축제 정보 수정
 */
export async function updateFestivalInfo(
  id: string,
  updates: Partial<FestivalInfoUpdate>
): Promise<FestivalInfo | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('festival_info')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating festival info:', error);
    return null;
  }

  return data;
}
