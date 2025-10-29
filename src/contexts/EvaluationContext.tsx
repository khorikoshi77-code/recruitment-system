'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface EvaluationField {
  id: string
  name: string
  description: string
  weight: number
  is_required: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface EvaluationContextType {
  fields: EvaluationField[]
  loading: boolean
  fetchFields: () => Promise<void>
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined)

export function EvaluationProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState<EvaluationField[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFields = async () => {
    try {
      setLoading(true)
      // Supabaseから実際のデータを取得
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

      const { data, error } = await supabase
        .from('evaluation_fields')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('評価項目の取得エラー:', error)
        throw error
      }

      setFields(data || [])
    } catch (error) {
      console.error('評価項目の取得エラー:', error)
      // エラー時は空配列を設定
      setFields([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFields()
  }, [])

  return (
    <EvaluationContext.Provider value={{ fields, loading, fetchFields }}>
      {children}
    </EvaluationContext.Provider>
  )
}

export function useEvaluation() {
  const context = useContext(EvaluationContext)
  if (context === undefined) {
    throw new Error('useEvaluation must be used within an EvaluationProvider')
  }
  return context
}
