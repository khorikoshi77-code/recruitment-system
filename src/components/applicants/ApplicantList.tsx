'use client'

import { useEffect, useState } from 'react'
import { supabase, Applicant } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Eye, Settings } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const statusOptions = [
  { value: 'all', label: 'すべて' },
  { value: '応募', label: '応募' },
  { value: '書類通過', label: '書類通過' },
  { value: '面接中', label: '面接中' },
  { value: '内定', label: '内定' },
  { value: '辞退', label: '辞退' },
]

const statusColors = {
  '応募': 'bg-blue-100 text-blue-800',
  '書類通過': 'bg-green-100 text-green-800',
  '面接中': 'bg-yellow-100 text-yellow-800',
  '内定': 'bg-purple-100 text-purple-800',
  '辞退': 'bg-red-100 text-red-800',
}

// 表示項目の定義
const columnOptions = [
  { key: 'name', label: '名前', default: true },
  { key: 'email', label: 'メール', default: true },
  { key: 'phone', label: '電話番号', default: false },
  { key: 'position', label: '職種', default: true },
  { key: 'status', label: 'ステータス', default: true },
  { key: 'created_at', label: '応募日', default: true },
  { key: 'interview_date', label: '面接日', default: false },
  { key: 'evaluation', label: '評価', default: false },
]

export function ApplicantList() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columnOptions.reduce((acc, col) => ({ ...acc, [col.key]: col.default }), {})
  )
  const [showColumnSettings, setShowColumnSettings] = useState(false)

  useEffect(() => {
    fetchApplicants()
  }, [])

  useEffect(() => {
    filterApplicants()
  }, [applicants, searchTerm, statusFilter])

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
      setError('応募者データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const filterApplicants = () => {
    let filtered = applicants

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(applicant =>
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.position.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // ステータスフィルター
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === statusFilter)
    }

    setFilteredApplicants(filtered)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">応募者一覧</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">応募者一覧</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowColumnSettings(!showColumnSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            表示項目設定
          </Button>
          <Button asChild>
            <Link href="/applicants/new">
              <Plus className="h-4 w-4 mr-2" />
              応募者登録
            </Link>
          </Button>
        </div>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
          <CardDescription>
            応募者を検索・絞り込みできます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="名前、メール、職種で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスで絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* 応募者テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>
            応募者一覧 ({filteredApplicants.length}件)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length > 0 ? (
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
                {filteredApplicants.map((applicant) => (
                  <TableRow key={applicant.id}>
                    {columnOptions.map((column) => 
                      visibleColumns[column.key] && (
                        <TableCell key={column.key} className={column.key === 'name' ? 'font-medium' : ''}>
                          {column.key === 'status' ? (
                            <Badge 
                              className={statusColors[applicant.status as keyof typeof statusColors]}
                            >
                              {applicant.status}
                            </Badge>
                          ) : column.key === 'created_at' ? (
                            applicant.created_at ? format(new Date(applicant.created_at), 'yyyy/MM/dd', { locale: ja }) : '-'
                          ) : column.key === 'interview_date' ? (
                            applicant.interview_date 
                              ? format(new Date(applicant.interview_date), 'yyyy/MM/dd', { locale: ja })
                              : '-'
                          ) : column.key === 'evaluation' ? (
                            applicant.evaluation || '-'
                          ) : (
                            applicant[column.key as keyof Applicant] as string
                          )}
                        </TableCell>
                      )
                    )}
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/applicants/${applicant.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          詳細
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || (statusFilter && statusFilter !== 'all') ? '検索条件に一致する応募者がありません' : '応募者が登録されていません'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
