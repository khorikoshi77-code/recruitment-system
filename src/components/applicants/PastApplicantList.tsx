'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Search, Archive } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface PastApplicant {
  id: string
  name: string
  email: string
  phone: string
  position: string
  status: string
  applied_at: string
  updated_at: string
  final_status: string
  notes?: string
}

const statusOptions = [
  { value: 'all', label: 'すべて' },
  { value: '選考終了', label: '選考終了' },
  { value: '不採用', label: '不採用' },
  { value: '辞退', label: '辞退' },
]

const statusColors = {
  '選考終了': 'bg-gray-100 text-gray-800',
  '不採用': 'bg-red-100 text-red-800',
  '辞退': 'bg-orange-100 text-orange-800',
}

export function PastApplicantList() {
  const [applicants, setApplicants] = useState<PastApplicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<PastApplicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')

  useEffect(() => {
    fetchPastApplicants()
  }, [])

  useEffect(() => {
    filterApplicants()
  }, [applicants, searchTerm, statusFilter, positionFilter])

  const fetchPastApplicants = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .in('status', ['選考終了', '不採用', '辞退'])
        .order('updated_at', { ascending: false })

      if (error) throw error
      setApplicants(data || [])
    } catch (error) {
      console.error('過去の応募者取得エラー:', error)
      setError('過去の応募者データの取得に失敗しました')
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

    // 職種フィルター
    if (positionFilter && positionFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.position === positionFilter)
    }

    setFilteredApplicants(filtered)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">データベース</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">データベース</h1>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
          <CardDescription>
            過去の応募者を検索・絞り込みできます
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
            <div className="w-full sm:w-48">
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="職種で絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての職種</SelectItem>
                  {Array.from(new Set(applicants.map(a => a.position))).map(position => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 応募者テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>
            過去の応募者一覧 ({filteredApplicants.length}件)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>職種</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>応募日</TableHead>
                  <TableHead>最終更新日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell className="font-medium">{applicant.name}</TableCell>
                    <TableCell>{applicant.email}</TableCell>
                    <TableCell>{applicant.position}</TableCell>
                    <TableCell>
                      <Badge 
                        className={statusColors[applicant.status as keyof typeof statusColors]}
                      >
                        {applicant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {applicant.applied_at ? format(new Date(applicant.applied_at), 'yyyy/MM/dd', { locale: ja }) : '-'}
                    </TableCell>
                    <TableCell>
                      {applicant.updated_at ? format(new Date(applicant.updated_at), 'yyyy/MM/dd', { locale: ja }) : '-'}
                    </TableCell>
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
              {searchTerm || (statusFilter && statusFilter !== 'all') || (positionFilter && positionFilter !== 'all') 
                ? '検索条件に一致する応募者がありません' 
                : '過去の応募者が登録されていません'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
