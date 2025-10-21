export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      booths: {
        Row: {
          id: string
          name: string
          category: string
          description: string
          coordinates: Json
          operating_hours: string
          contact: string | null
          menu_items: string[] | null
          price: string | null
          is_active: boolean
          congestion_level: string | null
          waiting_time: number | null
          webcam_url: string | null
          popularity_score: number | null
          current_visitors: number | null
          max_capacity: number | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description: string
          coordinates: Json
          operating_hours: string
          contact?: string | null
          menu_items?: string[] | null
          price?: string | null
          is_active?: boolean
          congestion_level?: string | null
          waiting_time?: number | null
          webcam_url?: string | null
          popularity_score?: number | null
          current_visitors?: number | null
          max_capacity?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string
          coordinates?: Json
          operating_hours?: string
          contact?: string | null
          menu_items?: string[] | null
          price?: string | null
          is_active?: boolean
          congestion_level?: string | null
          waiting_time?: number | null
          webcam_url?: string | null
          popularity_score?: number | null
          current_visitors?: number | null
          max_capacity?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          booth_id: string
          notification_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          booth_id: string
          notification_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          booth_id?: string
          notification_enabled?: boolean
          created_at?: string
        }
      }
      check_ins: {
        Row: {
          id: string
          user_id: string
          booth_id: string
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          booth_id: string
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          booth_id?: string
          points?: number
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          priority: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          priority: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          priority?: string
          expires_at?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          device_id: string
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          device_id: string
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          total_points?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}