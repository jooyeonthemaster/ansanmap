'use server';

import { createClient } from '@/lib/supabase/server';
import { Announcement, CreateAnnouncementDto } from '@/lib/types';

/**
 * 활성화된 공지사항 목록 조회
 */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }

  return data || [];
}

/**
 * 모든 공지사항 목록 조회 (관리자용)
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all announcements:', error);
    return [];
  }

  return data || [];
}

/**
 * 공지사항 생성
 */
export async function createAnnouncement(dto: CreateAnnouncementDto): Promise<Announcement | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title: dto.title,
      content: dto.content,
      priority: dto.priority || 'normal',
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    } as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating announcement:', error);
    return null;
  }

  return data;
}

/**
 * 공지사항 수정
 */
export async function updateAnnouncement(
  id: string,
  updates: Partial<CreateAnnouncementDto>
): Promise<Announcement | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('announcements')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating announcement:', error);
    return null;
  }

  return data;
}

/**
 * 공지사항 활성화/비활성화 토글
 */
export async function toggleAnnouncementActive(id: string): Promise<Announcement | null> {
  const supabase = await createClient();

  // 먼저 현재 상태 조회
  const { data: current, error: fetchError } = await supabase
    .from('announcements')
    .select('is_active')
    .eq('id', id)
    .single();

  if (fetchError || !current) {
    console.error('Error fetching announcement:', fetchError);
    return null;
  }

  // 상태 토글
  const isActive = (current as { is_active: boolean }).is_active;
  const { data, error } = await supabase
    .from('announcements')
    .update({ is_active: !isActive } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling announcement:', error);
    return null;
  }

  return data;
}

/**
 * 공지사항 삭제
 */
export async function deleteAnnouncement(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting announcement:', error);
    return false;
  }

  return true;
}
