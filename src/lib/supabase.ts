import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ ログインセッションを自動で反映するブラウザ用クライアント
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// SQL実行用のRPC関数（開発用）
export const execSQL = async (sql: string) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('SQL実行エラー:', error)
    return { data: null, error }
  }
}

// データベースの型定義
export interface Applicant {
  id: string
  name: string
  email: string
  phone: string
  position: string
  status: '応募' | '書類通過' | '面接中' | '内定' | '辞退'
  evaluation: string
  comment: string
  interview_date: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  role: '採用担当' | '面接官'
  created_at: string
}

// システム設定の型定義
export interface SystemSetting {
  id: string
  key: string
  value: any
  description: string | null
  created_at: string
  updated_at: string
}

export interface ApplicantField {
  id: string
  field_key: string
  field_name: string
  field_type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'date'
  is_required: boolean
  is_displayed: boolean
  display_order: number
  options: any | null
  validation_rules: any | null
  created_at: string
  updated_at: string
}

export interface StatusSetting {
  id: string
  status_key: string
  status_name: string
  status_color: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface DisplaySetting {
  id: string
  page_name: string
  settings: any
  created_at: string
  updated_at: string
}

export interface PermissionSetting {
  id: string
  role: string
  permissions: any
  created_at: string
  updated_at: string
}

export interface DashboardCard {
  id: string
  card_key: string
  card_name: string
  card_type: 'number' | 'chart' | 'list' | 'progress'
  card_icon: string | null
  card_color: string
  data_source: string
  data_query: any
  display_order: number
  is_active: boolean
  is_custom: boolean
  created_at: string
  updated_at: string
}