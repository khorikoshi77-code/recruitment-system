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
      // デモデータを返す
      const demoFields: EvaluationField[] = [
        {
          id: '1',
          name: '技術スキル',
          description: 'プログラミング技術、フレームワークの理解度、技術的な問題解決能力',
          weight: 25,
          is_required: true,
          is_active: true,
          display_order: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'コミュニケーション能力',
          description: '説明力、質問への回答能力、チームワーク、プレゼンテーション能力',
          weight: 20,
          is_required: true,
          is_active: true,
          display_order: 2,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: '問題解決能力',
          description: '論理的思考力、課題分析力、解決策の提案力、学習意欲',
          weight: 20,
          is_required: true,
          is_active: true,
          display_order: 3,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          name: '企業文化との適合性',
          description: '価値観の一致、働き方への理解、会社への興味・関心',
          weight: 15,
          is_required: true,
          is_active: true,
          display_order: 4,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '5',
          name: 'リーダーシップ',
          description: 'チームを引っ張る力、意思決定能力、責任感',
          weight: 10,
          is_required: false,
          is_active: true,
          display_order: 5,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '6',
          name: '創造性',
          description: '新しいアイデアの提案力、イノベーション思考',
          weight: 10,
          is_required: false,
          is_active: true,
          display_order: 6,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]
      setFields(demoFields)
    } catch (error) {
      console.error('評価項目の取得エラー:', error)
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
