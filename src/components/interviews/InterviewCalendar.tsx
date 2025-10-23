'use client'

import { useEffect, useState } from 'react'
import { supabase, Applicant } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, User, Phone, Star, Settings } from 'lucide-react'
import Link from 'next/link'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

// 表示項目の定義
const columnOptions = [
  { key: 'interview_date', label: '面接日', default: true },
  { key: 'name', label: '応募者名', default: true },
  { key: 'position', label: '職種', default: true },
  { key: 'status', label: 'ステータス', default: true },
  { key: 'contact', label: '連絡先', default: true },
]

export function InterviewCalendar() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columnOptions.reduce((acc, col) => ({ ...acc, [col.key]: col.default }), {})
  )
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    fetchApplicantsWithInterviews()
  }, [])

  const fetchApplicantsWithInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .not('interview_date', 'is', null)
        .order('interview_date', { ascending: true })

      if (error) throw error
      setApplicants(data || [])
    } catch (error) {
      console.error('面接日程データの取得に失敗しました:', error)
      // デモデータを表示
      const demoData: Applicant[] = [
        {
          id: '2',
          name: '佐藤 花子',
          email: 'sato@example.com',
          phone: '090-2345-6789',
          position: 'バックエンドエンジニア',
          status: '書類通過',
          created_at: '2024-01-14T14:30:00Z',
          updated_at: '2024-01-16T09:15:00Z',
          applied_at: '2024-01-14T14:30:00Z',
          interview_date: '2024-01-20T14:00:00Z',
          evaluation: null
        },
        {
          id: '3',
          name: '鈴木 一郎',
          email: 'suzuki@example.com',
          phone: '090-3456-7890',
          position: 'フルスタックエンジニア',
          status: '面接中',
          created_at: '2024-01-13T16:45:00Z',
          updated_at: '2024-01-18T11:20:00Z',
          applied_at: '2024-01-13T16:45:00Z',
          interview_date: '2024-01-19T10:30:00Z',
          evaluation: null
        },
        {
          id: '4',
          name: '高橋 美咲',
          email: 'takahashi@example.com',
          phone: '090-4567-8901',
          position: 'UI/UXデザイナー',
          status: '内定',
          created_at: '2024-01-12T09:20:00Z',
          updated_at: '2024-01-17T15:45:00Z',
          applied_at: '2024-01-12T09:20:00Z',
          interview_date: '2024-01-18T13:00:00Z',
          evaluation: '技術力とデザインセンスが優秀。即戦力として期待できる。'
        },
        {
          id: '5',
          name: '山田 健太',
          email: 'yamada@example.com',
          phone: '090-5678-9012',
          position: 'データサイエンティスト',
          status: '辞退',
          created_at: '2024-01-11T13:10:00Z',
          updated_at: '2024-01-16T16:30:00Z',
          applied_at: '2024-01-11T13:10:00Z',
          interview_date: '2024-01-17T15:00:00Z',
          evaluation: '他社の内定を選択'
        },
        {
          id: '6',
          name: '伊藤 さくら',
          email: 'ito@example.com',
          phone: '090-6789-0123',
          position: 'プロダクトマネージャー',
          status: '面接中',
          created_at: '2024-01-10T11:00:00Z',
          updated_at: '2024-01-19T14:30:00Z',
          applied_at: '2024-01-10T11:00:00Z',
          interview_date: '2024-01-21T16:00:00Z',
          evaluation: null
        }
      ]
      setApplicants(demoData)
    } finally {
      setLoading(false)
    }
  }

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString)
    
    if (isToday(date)) {
      return '今日'
    } else if (isTomorrow(date)) {
      return '明日'
    } else if (isYesterday(date)) {
      return '昨日'
    } else {
      return format(date, 'MM月dd日(E)', { locale: ja })
    }
  }

  const getDateColor = (dateString: string) => {
    const date = parseISO(dateString)
    
    if (isToday(date)) {
      return 'bg-blue-100 text-blue-800'
    } else if (isTomorrow(date)) {
      return 'bg-green-100 text-green-800'
    } else if (isYesterday(date)) {
      return 'bg-gray-100 text-gray-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newColumns = {
        ...prev,
        [columnKey]: !prev[columnKey]
      }
      
      // 最低でも1つの項目は表示する必要がある
      const visibleCount = Object.values(newColumns).filter(Boolean).length
      if (visibleCount === 0) {
        return prev // 変更を適用しない
      }
      
      return newColumns
    })
  }

  const resetColumns = () => {
    setVisibleColumns(
      columnOptions.reduce((acc, col) => ({ ...acc, [col.key]: col.default }), {})
    )
  }

  const upcomingInterviews = applicants.filter(applicant => {
    const interviewDate = parseISO(applicant.interview_date!)
    return interviewDate >= new Date()
  })

  const pastInterviews = applicants.filter(applicant => {
    const interviewDate = parseISO(applicant.interview_date!)
    return interviewDate < new Date()
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">面接日程</h1>
          <Button 
            variant="outline" 
            onClick={() => setShowColumnSettings(!showColumnSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            表示項目設定
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">面接日程</h1>
        <Button 
          variant="outline" 
          onClick={() => setShowColumnSettings(!showColumnSettings)}
        >
          <Settings className="h-4 w-4 mr-2" />
          表示項目設定
        </Button>
      </div>

      {/* 表示項目設定 */}
      {showColumnSettings && (
        <Card>
          <CardHeader>
            <CardTitle>表示項目設定</CardTitle>
            <CardDescription>
              テーブルに表示する項目を選択できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {columnOptions.map((column) => {
                const isLastVisible = Object.values(visibleColumns).filter(Boolean).length === 1 && visibleColumns[column.key]
                return (
                  <div key={column.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={column.key}
                      checked={visibleColumns[column.key]}
                      onChange={() => toggleColumn(column.key)}
                      disabled={isLastVisible}
                      className={`rounded border-gray-300 ${isLastVisible ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <label 
                      htmlFor={column.key} 
                      className={`text-sm font-medium ${isLastVisible ? 'text-gray-500' : ''}`}
                    >
                      {column.label}
                      {isLastVisible && <span className="text-xs text-gray-400 ml-1">(必須)</span>}
                    </label>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={resetColumns}>
                デフォルトに戻す
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 今後の面接 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span>今後の面接予定</span>
          </CardTitle>
          <CardDescription>
            予定されている面接一覧
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingInterviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {columnOptions.map((column) => 
                    visibleColumns[column.key] && (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    )
                  )}
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingInterviews.map((applicant) => (
                  <TableRow key={applicant.id}>
                    {columnOptions.map((column) => 
                      visibleColumns[column.key] && (
                        <TableCell key={column.key} className={column.key === 'name' ? 'font-medium' : ''}>
                          {column.key === 'interview_date' ? (
                            <div className="flex items-center space-x-2">
                              <Badge className={getDateColor(applicant.interview_date!)}>
                                {getDateLabel(applicant.interview_date!)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {format(parseISO(applicant.interview_date!), 'HH:mm', { locale: ja })}
                              </span>
                            </div>
                          ) : column.key === 'status' ? (
                            <Badge 
                              className={
                                applicant.status === '面接中' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {applicant.status}
                            </Badge>
                          ) : column.key === 'contact' ? (
                            <div className="text-sm">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{applicant.email}</span>
                              </div>
                              {applicant.phone && (
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  <span>{applicant.phone}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            applicant[column.key as keyof Applicant] as string
                          )}
                        </TableCell>
                      )
                    )}
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/interviews/${applicant.id}/evaluate`}>
                          <Star className="h-4 w-4 mr-1" />
                          評価
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              今後の面接予定はありません
            </div>
          )}
        </CardContent>
      </Card>

      {/* 過去の面接 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <span>過去の面接</span>
          </CardTitle>
          <CardDescription>
            実施済みの面接一覧
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastInterviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {columnOptions.map((column) => 
                    visibleColumns[column.key] && (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    )
                  )}
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastInterviews.map((applicant) => (
                  <TableRow key={applicant.id}>
                    {columnOptions.map((column) => 
                      visibleColumns[column.key] && (
                        <TableCell key={column.key} className={column.key === 'name' ? 'font-medium' : ''}>
                          {column.key === 'interview_date' ? (
                            <div className="flex items-center space-x-2">
                              <Badge className={getDateColor(applicant.interview_date!)}>
                                {getDateLabel(applicant.interview_date!)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {format(parseISO(applicant.interview_date!), 'HH:mm', { locale: ja })}
                              </span>
                            </div>
                          ) : column.key === 'status' ? (
                            <Badge 
                              className={
                                applicant.status === '内定' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : applicant.status === '辞退'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {applicant.status}
                            </Badge>
                          ) : column.key === 'contact' ? (
                            <div className="text-sm">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{applicant.email}</span>
                              </div>
                              {applicant.phone && (
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  <span>{applicant.phone}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            applicant[column.key as keyof Applicant] as string
                          )}
                        </TableCell>
                      )
                    )}
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/interviews/${applicant.id}/evaluate`}>
                          <Star className="h-4 w-4 mr-1" />
                          評価
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              過去の面接履歴はありません
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
