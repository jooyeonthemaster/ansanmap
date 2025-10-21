import { supabase } from './client';
import type { Favorite, CheckInRecord, Announcement, AnnouncementPriority } from '../types';

/**
 * Supabase User Data API
 * Replaces localStorage-based utils/storage.ts
 */

// Get or create device-based user ID
let cachedUserId: string | null = null;

async function getUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  // Use device fingerprint as identifier
  const deviceId = getDeviceId();

  const { data, error } = await supabase.rpc('get_or_create_user', {
    device_id_param: deviceId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  if (error || !data) {
    console.error('Error getting user ID:', error);
    throw new Error('Failed to get user ID');
  }

  cachedUserId = data;
  return data;
}

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  // Try to get existing device ID from localStorage
  let deviceId = localStorage.getItem('device_id');

  if (!deviceId) {
    // Generate new device ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }

  return deviceId;
}

// ===== FAVORITES =====

export async function getFavorites(): Promise<Favorite[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((fav: any) => ({
    boothId: fav.booth_id,
    addedAt: fav.created_at,
    notificationEnabled: fav.notification_enabled,
  }));
}

export async function addFavorite(
  boothId: string,
  notificationEnabled: boolean = false
): Promise<boolean> {
  const userId = await getUserId();

  const { error } = await supabase.from('favorites').insert({
    user_id: userId,
    booth_id: boothId,
    notification_enabled: notificationEnabled,
  } as never);

  if (error) {
    console.error('Error adding favorite:', error);
    return false;
  }

  return true;
}

export async function removeFavorite(boothId: string): Promise<boolean> {
  const userId = await getUserId();

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('booth_id', boothId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }

  return true;
}

export async function isFavorite(boothId: string): Promise<boolean> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('booth_id', boothId)
    .single();

  return !error && !!data;
}

export async function toggleFavoriteNotification(
  boothId: string,
  enabled: boolean
): Promise<boolean> {
  const userId = await getUserId();

  const { error } = await supabase
    .from('favorites')
    .update({ notification_enabled: enabled } as never)
    .eq('user_id', userId)
    .eq('booth_id', boothId);

  if (error) {
    console.error('Error toggling notification:', error);
    return false;
  }

  return true;
}

// ===== CHECK-INS =====

export async function getCheckIns(): Promise<CheckInRecord[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((checkIn: any) => ({
    boothId: checkIn.booth_id,
    timestamp: checkIn.created_at,
    points: checkIn.points,
  }));
}

export async function addCheckIn(
  boothId: string,
  points: number = 10
): Promise<boolean> {
  const userId = await getUserId();

  const { error } = await supabase.from('check_ins').insert({
    user_id: userId,
    booth_id: boothId,
    points,
  } as never);

  if (error) {
    console.error('Error adding check-in:', error);
    return false;
  }

  // Update total points
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await supabase.rpc('calculate_user_points', { user_uuid: userId } as any);

  return true;
}

export async function getVisitedBooths(): Promise<string[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('check_ins')
    .select('booth_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching visited booths:', error);
    return [];
  }

  // Get unique booth IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueBoothIds = [...new Set(data.map((item: any) => item.booth_id))];
  return uniqueBoothIds;
}

export async function getTotalPoints(): Promise<number> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('users')
    .select('total_points')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching total points:', error);
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any).total_points;
}

// ===== ANNOUNCEMENTS =====

export async function getAnnouncements(): Promise<Announcement[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((ann: any) => ({
    id: ann.id,
    title: ann.title,
    content: ann.content,
    priority: ann.priority as AnnouncementPriority,
    is_active: ann.is_active,
    created_at: ann.created_at,
    updated_at: ann.updated_at,
  }));
}

export async function addAnnouncement(announcement: {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
}): Promise<boolean> {
  const { error } = await supabase.from('announcements').insert({
    title: announcement.title,
    content: announcement.content,
    priority: announcement.priority,
    expires_at: announcement.expiresAt,
  } as never);

  if (error) {
    console.error('Error adding announcement:', error);
    return false;
  }

  return true;
}

// ===== REALTIME SUBSCRIPTIONS =====

export function subscribeToAnnouncements(callback: (announcements: Announcement[]) => void) {
  const channel = supabase
    .channel('announcements-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'announcements',
      },
      async () => {
        const announcements = await getAnnouncements();
        callback(announcements);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToCheckIns(callback: (checkIns: CheckInRecord[]) => void) {
  const channel = supabase
    .channel('checkins-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'check_ins',
      },
      async () => {
        const checkIns = await getCheckIns();
        callback(checkIns);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ===== HELPER FUNCTIONS =====

export function calculateCongestionLevel(
  currentVisitors: number,
  maxCapacity: number
): 'low' | 'medium' | 'high' | 'very-high' {
  const ratio = currentVisitors / maxCapacity;

  if (ratio < 0.3) return 'low';
  if (ratio < 0.6) return 'medium';
  if (ratio < 0.85) return 'high';
  return 'very-high';
}

export function estimateWaitingTime(
  congestionLevel: 'low' | 'medium' | 'high' | 'very-high'
): number {
  const waitTimes = {
    low: 5,
    medium: 15,
    high: 25,
    'very-high': 40,
  };

  return waitTimes[congestionLevel];
}