'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Applicant } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ApplicantDetailProps {
  applicantId: string
}

const statusOptions = [
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

export function ApplicantDetail({ applicantId }: ApplicantDetailProps) {
  const router = useRouter()
  const { role } = useAuth()
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // フォーム状態
  const [status, setStatus] = useState('')
  const [interviewDate, setInterviewDate] = useState('')

  useEffect(() => {
    fetchApplicant()
  }, [applicantId])

  const fetchApplicant = async () => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('id', applicantId)
        .single()

      if (error) throw error
      if (!data) throw new Error('応募者が見つかりません')

      setApplicant(data)
      setStatus(data.status)
      setInterviewDate(data.interview_date || '')
    } catch (error: any) {
      console.error('応募者データの取得エラー:', error)
      // デモデータから該当する応募者を検索
      const demoData: Applicant[] = [
        {
          id: '1',
          name: '田中 太郎',
          email: 'tanaka@example.com',
          phone: '090-1234-5678',
          position: 'フロントエンドエンジニア',
          status: '応募',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          interview_date: null,
          evaluation: '',
          comment: ''
        },
        {
          id: '2',
          name: '佐藤 花子',
          email: 'sato@example.com',
          phone: '090-2345-6789',
          position: 'バックエンドエンジニア',
          status: '書類通過',
          created_at: '2024-01-14T14:30:00Z',
          updated_at: '2024-01-16T09:15:00Z',
          interview_date: '2024-01-20T14:00:00Z',
          evaluation: ''
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
          interview_date: '2024-01-19T10:30:00Z',
          evaluation: ''
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
          interview_date: '2024-01-21T16:00:00Z',
          evaluation: ''
        }
      ]
      
      const foundApplicant = demoData.find(app => app.id === applicantId)
      if (foundApplicant) {
        setApplicant(foundApplicant)
        setStatus(foundApplicant.status)
        setInterviewDate(foundApplicant.interview_date || '')
      } else {
        setError('応募者データが見つかりませんでした')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!applicant) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updateData: Partial<Applicant> = {
        status,
        interview_date: interviewDate || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('applicants')
        .update(updateData)
        .eq('id', applicantId)

      if (error) throw error

      setSuccess('更新が完了しました')
      setApplicant({ ...applicant, ...updateData })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">応募者詳細</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>応募者が見つかりません</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">応募者詳細</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">名前</Label>
              <p className="text-lg font-semibold">{applicant.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">メールアドレス</Label>
              <p className="text-sm">{applicant.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">電話番号</Label>
              <p className="text-sm">{applicant.phone || '未入力'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">応募職種</Label>
              <p className="text-sm">{applicant.position}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">応募日</Label>
              <p className="text-sm">
                {format(new Date(applicant.created_at), 'yyyy年MM月dd日', { locale: ja })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ステータス */}
        <Card>
          <CardHeader>
            <CardTitle>ステータス</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">ステータス</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
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

            <div>
              <Label htmlFor="interviewDate">面接予定日</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  id="interviewDate"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 現在のステータス表示 */}
      <Card>
        <CardHeader>
          <CardTitle>現在のステータス</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge 
              className={`${statusColors[applicant.status as keyof typeof statusColors]} text-lg px-4 py-2`}
            >
              {applicant.status}
            </Badge>
            {applicant.interview_date && (
              <div className="text-sm text-gray-600">
                面接予定: {format(new Date(applicant.interview_date), 'yyyy年MM月dd日', { locale: ja })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
