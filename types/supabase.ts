export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
      }
      keywords: {
        Row: {
          id: string
          user_id: string
          keyword: string
          domain: string
          position: number | null
          previous_position: number | null
          search_volume: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          keyword: string
          domain: string
          position?: number | null
          previous_position?: number | null
          search_volume?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          keyword?: string
          domain?: string
          position?: number | null
          previous_position?: number | null
          search_volume?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      content_generations: {
        Row: {
          id: string
          user_id: string
          type: string
          prompt: string
          result: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          prompt: string
          result: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          prompt?: string
          result?: string
          created_at?: string
        }
      }
      audits: {
        Row: {
          id: string
          user_id: string
          url: string
          status: string
          task_id: string | null
          results: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          status: string
          task_id?: string | null
          results?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          status?: string
          task_id?: string | null
          results?: Json | null
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

