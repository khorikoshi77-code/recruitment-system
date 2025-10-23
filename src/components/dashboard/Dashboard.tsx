'use client'

import { useEffect, useState } from 'react'
import { supabase, Applicant } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusChart } from './StatusChart'
import { RecentUpdates } from './RecentUpdates'
import { StatsCards } from './StatsCards'

export function Dashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setApplicants(data || [])
    } catch (error) {
      console.error('応募者データの取得に失敗しました:', error)
      // エラー時は空配列を設定
      setApplicants([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
      </div>

      {/* 統計カード */}
      <StatsCards applicants={applicants} />

      {/* グラフと最近の更新 */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatusChart applicants={applicants} />
        <RecentUpdates applicants={applicants} />
      </div>
    </div>
  )
}
