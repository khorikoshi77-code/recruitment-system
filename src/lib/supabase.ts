'use client'

import { createBrowserClient } from '@supabase/ssr'

// ✅ 環境変数の定義（Vercel環境・ローカル両対応）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ ブラウザ用 Supabase クライアント（セッション自動復元対応）
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// ✅ SQL 実行用 RPC（開発・デバッグ用途）
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

// =============== 型定義セクション（アプリで使用） ===============

// 応募者
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

// ユーザー
export interface User {
  id: string
  email: string
  role: '採用担当' | '面接官'
  created_at: string
}

// システム設定
export interface SystemSetting {
  id: string
  key: string
  value: any
  description: string | null
  created_at: string
  updated_at: string
}

// 応募者フィールド設定
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

// ステータス設定
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

// 画面表示設定
export interface DisplaySetting {
  id: string
  page_name: string
  settings: any
  created_at: string
  updated_at: string
}

// 権限設定
export interface PermissionSetting {
  id: string
  role: string
  permissions: any
  created_at: string
  updated_at: string
}

// ダッシュボードカード設定
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
