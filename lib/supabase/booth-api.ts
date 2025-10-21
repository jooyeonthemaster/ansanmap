import { supabase } from './client';
import type { Booth, CreateBoothDto, Coordinate, BoothCategory, CongestionLevel } from '../types';

/**
 * Supabase Booth API
 * Replaces localStorage-based booth-storage.ts
 */

// Get all booths
export async function getBooths(): Promise<Booth[]> {
  const { data, error } = await supabase
    .from('booths')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching booths:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((booth: any) => ({
    id: booth.id,
    name: booth.name,
    category: booth.category as BoothCategory,
    description: booth.description,
    coordinates: booth.coordinates as Coordinate[],
    operatingHours: booth.operating_hours,
    contact: booth.contact || undefined,
    menuItems: booth.menu_items || undefined,
    price: booth.price || undefined,
    isActive: booth.is_active,
    congestionLevel: booth.congestion_level as CongestionLevel | undefined,
    waitingTime: booth.waiting_time || undefined,
    webcamUrl: booth.webcam_url || undefined,
    popularityScore: booth.popularity_score ? Number(booth.popularity_score) : undefined,
    currentVisitors: booth.current_visitors || undefined,
    maxCapacity: booth.max_capacity || undefined,
    tags: booth.tags || undefined,
    createdAt: booth.created_at,
    updatedAt: booth.updated_at,
  }));
}

// Get single booth by ID
export async function getBooth(id: string): Promise<Booth | null> {
  const { data, error } = await supabase
    .from('booths')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching booth:', error);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booth = data as any;
  return {
    id: booth.id,
    name: booth.name,
    category: booth.category as BoothCategory,
    description: booth.description,
    coordinates: booth.coordinates as Coordinate[],
    operatingHours: booth.operating_hours,
    contact: booth.contact || undefined,
    menuItems: booth.menu_items || undefined,
    price: booth.price || undefined,
    isActive: booth.is_active,
    congestionLevel: booth.congestion_level as CongestionLevel | undefined,
    waitingTime: booth.waiting_time || undefined,
    webcamUrl: booth.webcam_url || undefined,
    popularityScore: booth.popularity_score ? Number(booth.popularity_score) : undefined,
    currentVisitors: booth.current_visitors || undefined,
    maxCapacity: booth.max_capacity || undefined,
    tags: booth.tags || undefined,
    createdAt: booth.created_at,
    updatedAt: booth.updated_at,
  };
}

// Add new booth
export async function addBooth(boothData: CreateBoothDto): Promise<Booth | null> {
  const { data, error } = await supabase
    .from('booths')
    .insert({
      name: boothData.name,
      category: boothData.category,
      description: boothData.description,
      coordinates: boothData.coordinates as unknown as Coordinate[],
      operating_hours: boothData.operatingHours,
      contact: boothData.contact,
      menu_items: boothData.menuItems,
      price: boothData.price,
      webcam_url: boothData.webcamUrl,
      max_capacity: boothData.maxCapacity,
      tags: boothData.tags,
      is_active: true,
    } as never)
    .select()
    .single();

  if (error || !data) {
    console.error('Error adding booth:', error);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booth = data as any;
  return {
    id: booth.id,
    name: booth.name,
    category: booth.category as BoothCategory,
    description: booth.description,
    coordinates: booth.coordinates as Coordinate[],
    operatingHours: booth.operating_hours,
    contact: booth.contact || undefined,
    menuItems: booth.menu_items || undefined,
    price: booth.price || undefined,
    isActive: booth.is_active,
    congestionLevel: booth.congestion_level as CongestionLevel | undefined,
    waitingTime: booth.waiting_time || undefined,
    webcamUrl: booth.webcam_url || undefined,
    popularityScore: booth.popularity_score ? Number(booth.popularity_score) : undefined,
    currentVisitors: booth.current_visitors || undefined,
    maxCapacity: booth.max_capacity || undefined,
    tags: booth.tags || undefined,
    createdAt: booth.created_at,
    updatedAt: booth.updated_at,
  };
}

// Update booth
export async function updateBooth(id: string, updates: Partial<Booth>): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbUpdates: any = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.coordinates !== undefined) dbUpdates.coordinates = updates.coordinates;
  if (updates.operatingHours !== undefined) dbUpdates.operating_hours = updates.operatingHours;
  if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
  if (updates.menuItems !== undefined) dbUpdates.menu_items = updates.menuItems;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  if (updates.congestionLevel !== undefined) dbUpdates.congestion_level = updates.congestionLevel;
  if (updates.waitingTime !== undefined) dbUpdates.waiting_time = updates.waitingTime;
  if (updates.webcamUrl !== undefined) dbUpdates.webcam_url = updates.webcamUrl;
  if (updates.popularityScore !== undefined) dbUpdates.popularity_score = updates.popularityScore;
  if (updates.currentVisitors !== undefined) dbUpdates.current_visitors = updates.currentVisitors;
  if (updates.maxCapacity !== undefined) dbUpdates.max_capacity = updates.maxCapacity;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

  const { error } = await supabase
    .from('booths')
    .update(dbUpdates as never)
    .eq('id', id);

  if (error) {
    console.error('Error updating booth:', error);
    return false;
  }

  return true;
}

// Delete booth
export async function deleteBooth(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('booths')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting booth:', error);
    return false;
  }

  return true;
}

// Subscribe to realtime booth updates
export function subscribeToBooths(callback: (booths: Booth[]) => void) {
  const channel = supabase
    .channel('booths-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'booths',
      },
      async () => {
        const booths = await getBooths();
        callback(booths);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}