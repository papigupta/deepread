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
      users: {
        Row: {
          id: string
          pen_name: string | null
          email: string
          streak_count: number
          last_practice_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pen_name?: string | null
          email: string
          streak_count?: number
          last_practice_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pen_name?: string | null
          email?: string
          streak_count?: number
          last_practice_date?: string | null
          created_at?: string
        }
      }
      books: {
        Row: {
          id: string
          user_id: string
          title: string
          author: string
          cover_url: string | null
          open_library_id: string | null
          added_at: string
          understanding_score: number | null
          application_score: number | null
          clarity_score: number | null
          overall_score: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          author: string
          cover_url?: string | null
          open_library_id?: string | null
          added_at?: string
          understanding_score?: number | null
          application_score?: number | null
          clarity_score?: number | null
          overall_score?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          author?: string
          cover_url?: string | null
          open_library_id?: string | null
          added_at?: string
          understanding_score?: number | null
          application_score?: number | null
          clarity_score?: number | null
          overall_score?: number | null
        }
      }
      insights: {
        Row: {
          id: string
          book_id: string
          concept_title: string
          concept_text: string
          chapter_name: string | null
          source_reference: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          type: string
          tags: string[]
        }
        Insert: {
          id?: string
          book_id: string
          concept_title: string
          concept_text: string
          chapter_name?: string | null
          source_reference?: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          type: string
          tags?: string[]
        }
        Update: {
          id?: string
          book_id?: string
          concept_title?: string
          concept_text?: string
          chapter_name?: string | null
          source_reference?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          type?: string
          tags?: string[]
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          book_id: string
          insight_id: string
          submitted_at: string
          response_text: string
          llm_feedback: Json | null
          eval_score: number
          user_feedback_score: number | null
          auto_difficulty_next: 'easier' | 'same' | 'harder' | null
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          insight_id: string
          submitted_at?: string
          response_text: string
          llm_feedback?: Json | null
          eval_score: number
          user_feedback_score?: number | null
          auto_difficulty_next?: 'easier' | 'same' | 'harder' | null
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          insight_id?: string
          submitted_at?: string
          response_text?: string
          llm_feedback?: Json | null
          eval_score?: number
          user_feedback_score?: number | null
          auto_difficulty_next?: 'easier' | 'same' | 'harder' | null
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