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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_children: {
        Row: {
          id: string
          user_id: string
          name: string
          stage: string
          level: number
          total_xp: number
          traits: string[] | null
          completed_lessons: string[] | null
          stats: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          stage?: string
          level?: number
          total_xp?: number
          traits?: string[] | null
          completed_lessons?: string[] | null
          stats?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          stage?: string
          level?: number
          total_xp?: number
          traits?: string[] | null
          completed_lessons?: string[] | null
          stats?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          id: string
          user_id: string
          child_id: string | null
          type: string
          content: string
          notes: string | null
          embedding: string | null
          timestamp: number
          pinned: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_id?: string | null
          type?: string
          content: string
          notes?: string | null
          embedding?: string | null
          timestamp?: number
          pinned?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          child_id?: string | null
          type?: string
          content?: string
          notes?: string | null
          embedding?: string | null
          timestamp?: number
          pinned?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_memories: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          p_user_id: string
        }
        Returns: {
          id: string
          content: string
          type: string
          notes: string | null
          timestamp: number
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
