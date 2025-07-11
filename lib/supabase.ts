import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      hva_assessments: {
        Row: {
          id: string
          user_id: string
          assessment_name: string
          assessment_data: any
          results_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_name: string
          assessment_data: any
          results_data: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_name?: string
          assessment_data?: any
          results_data?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
