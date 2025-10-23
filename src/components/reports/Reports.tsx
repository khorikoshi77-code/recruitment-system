'use client'

import { useEffect, useState } from 'react'
import { supabase, Applicant } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, TrendingUp, Users, UserCheck } from 'lucide-react'

export function Reports() {
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
        .order('created_at', { ascending: false })

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

  // 職種別集計
  const positionStats = applicants.reduce((acc, applicant) => {
    acc[applicant.position] = (acc[applicant.position] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const positionData = Object.entries(positionStats).map(([position, count]) => ({
    position,
    count,
  }))

  // 月別応募数
  const monthlyStats = applicants.reduce((acc, applicant) => {
    const month = new Date(applicant.created_at).toISOString().slice(0, 7) // YYYY-MM
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const monthlyData = Object.entries(monthlyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: month.replace('-', '年') + '月',
      count,
    }))

  // ステータス別集計
  const statusStats = applicants.reduce((acc, applicant) => {
    acc[applicant.status] = (acc[applicant.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusData = Object.entries(statusStats).map(([status, count]) => ({
    status,
    count,
    color: getStatusColor(status),
  }))

  function getStatusColor(status: string) {
    const colors = {
      '応募': '#3B82F6',
      '書類通過': '#10B981',
      '面接中': '#F59E0B',
      '内定': '#8B5CF6',
      '辞退': '#EF4444',
    }
    return colors[status as keyof typeof colors] || '#6B7280'
  }

  // 通過率計算
  const totalApplicants = applicants.length
  const passedApplicants = applicants.filter(a => a.status === '書類通過').length
  const offeredApplicants = applicants.filter(a => a.status === '内定').length
  const passRate = totalApplicants > 0 ? (passedApplicants / totalApplicants) * 100 : 0
  const offerRate = totalApplicants > 0 ? (offeredApplicants / totalApplicants) * 100 : 0

  const exportToCSV = () => {
    const headers = ['名前', 'メール', '職種', 'ステータス', '応募日', '面接日', '評価', 'コメント']
    const csvData = applicants.map(applicant => [
      applicant.name,
      applicant.email,
      applicant.position,
      applicant.status,
      new Date(applicant.created_at).toLocaleDateString('ja-JP'),
      applicant.interview_date ? new Date(applicant.interview_date).toLocaleDateString('ja-JP') : '',
      applicant.evaluation || '',
      applicant.comment || '',
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `応募者一覧_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">集計レポート</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['採用担当']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">集計レポート</h1>
          <Button onClick={exportToCSV} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>CSV出力</span>
          </Button>
        </div>

        {/* サマリーカード */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総応募者数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplicants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">書類通過率</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{passRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">内定率</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">内定者数</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offeredApplicants}</div>
            </CardContent>
          </Card>
        </div>

        {/* グラフ */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>職種別応募者数</CardTitle>
              <CardDescription>応募職種の分布</CardDescription>
            </CardHeader>
            <CardContent>
              {positionData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={positionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  データがありません
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ステータス別分布</CardTitle>
              <CardDescription>応募者の現在のステータス</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  データがありません
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 月別応募数推移 */}
        <Card>
          <CardHeader>
            <CardTitle>月別応募数推移</CardTitle>
            <CardDescription>応募数の時系列変化</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
