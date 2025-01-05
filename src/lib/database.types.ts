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
      manufacturers: {
        Row: {
          id: number
          name: string
          country: string
          country_code: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          country: string
          country_code: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          country?: string
          country_code?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          emoji: string
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          emoji: string
          color: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          emoji?: string
          color?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          emoji?: string
          created_at?: string
        }
      }
      puzzles: {
        Row: {
          id: number
          name: string
          manufacturer_id: number
          pieces: number
          difficulty: string
          categories: string[]
          image_url: string | null
          acquisition_date: string
          removal_date: string | null
          price: number
          is_gift: boolean
          is_collaboration: boolean
          is_own_purchase: boolean
          in_collection: boolean
          notes: string | null
          tags: string[]
          created_at: string
          manufacturer: {
            name: string
          } | null
        }
        Insert: {
          id?: number
          name: string
          manufacturer_id: number
          pieces: number
          difficulty: string
          categories: string[]
          image_url?: string | null
          acquisition_date: string
          removal_date?: string | null
          price: number
          is_gift: boolean
          is_collaboration: boolean
          is_own_purchase: boolean
          in_collection: boolean
          notes?: string | null
          tags: string[]
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          manufacturer_id?: number
          pieces?: number
          difficulty?: string
          categories?: string[]
          image_url?: string | null
          acquisition_date?: string
          removal_date?: string | null
          price?: number
          is_gift?: boolean
          is_collaboration?: boolean
          is_own_purchase?: boolean
          in_collection?: boolean
          notes?: string | null
          tags?: string[]
          created_at?: string
        }
      }
    }
  }
}