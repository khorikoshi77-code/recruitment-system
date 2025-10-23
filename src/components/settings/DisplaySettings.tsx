'use client'

import { useEffect, useState } from 'react'
import { supabase, DisplaySetting } from '@/lib/supabase'
import { ApplicantField } from '@/types/applicant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft, 
  Eye,
  Save,
  Settings,
  CheckSquare,
  Square
} from 'lucide-react'

interface DisplaySettingsProps {
  onBack: () => void
}

const pageOptions = [
  { value: 'applicant_list', label: '応募者一覧' },
  { value: 'applicant_detail', label: '応募者詳細' },
  { value: 'dashboard', label: 'ダッシュボード' },
  { value: 'interview_calendar', label: '面接日程' },
  { value: 'reports', label: '集計レポート' }
]

const dashboardCardOptions = [
  { value: 'total_applicants', label: '総応募者数' },
  { value: 'passed_rate', label: '書類通過率' },
  { value: 'interviewing_count', label: '面接中' },
  { value: 'offered_count', label: '内定者数' },
  { value: 'declined_count', label: '辞退者数' },
  { value: 'recent_applicants', label: '最近の応募者' }
]

export function DisplaySettings({ onBack }: DisplaySettingsProps) {
  const [displaySettings, setDisplaySettings] = useState<DisplaySetting[]>([])
  const [applicantFields, setApplicantFields] = useState<ApplicantField[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // フォーム状態
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // ブラウザの戻るボタンに対応
    const handlePopState = () => {
      onBack()
    }

    // 現在の状態を履歴に追加
    window.history.pushState({ section: 'display' }, '', window.location.href)
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack])

  const fetchData = async () => {
    try {
      const [displayResult, fieldsResult] = await Promise.all([
        supabase.from('display_settings').select('*').order('page_name'),
        supabase.from('applicant_fields').select('*').order('display_order')
      ])

      if (displayResult.error || fieldsResult.error) {
        console.error('データの取得エラー:', displayResult.error || fieldsResult.error)
        // モックデータを表示
        setDisplaySettings([
          {
            id: '1',
            page_name: 'applicant_list',
            settings: { 表示列: ['name', 'email', 'position', 'status', 'created_at'], ページ件数: 20 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            page_name: 'dashboard',
            settings: { 表示項目: ['total_applicants', 'passed_rate', 'interviewing_count', 'offered_count'] },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        setApplicantFields([
          {
            id: '1',
            field_key: 'name',
            field_name: '名前',
            field_type: 'text',
            is_required: true,
            is_displayed: true,
            display_order: 1,
            options: [],
          },
          {
            id: '2',
            field_key: 'email',
            field_name: 'メールアドレス',
            field_type: 'email',
            is_required: true,
            is_displayed: true,
            display_order: 2,
            options: [],
          },
        ])
        setError('データベースに接続できません。デモデータを表示しています。')
        return
      }

      setDisplaySettings(displayResult.data || [])
      setApplicantFields(fieldsResult.data || [])
    } catch (error: any) {
      console.error('データの取得に失敗しました:', error)
      // エラー時もモックデータを表示
      setDisplaySettings([
        {
          id: '1',
          page_name: 'applicant_list',
          settings: { 表示列: ['name', 'email', 'position', 'status'], ページ件数: 20 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      setApplicantFields([
        {
          id: '1',
          field_key: 'name',
          field_name: '名前',
          field_type: 'text',
          is_required: false,
          is_displayed: true,
          display_order: 1,
          options: null,
          validation_rules: null,
          created_at: '',
          updated_at: ''
        }
      ])
      setError('データベースに接続できません。デモデータを表示しています。')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pageName: string) => {
    const setting = displaySettings.find(s => s.page_name === pageName)
    setEditingPage(pageName)
    setFormData(setting?.settings || {})
  }

  const handleSave = async () => {
    if (!editingPage) return

    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('display_settings')
        .upsert({
          page_name: editingPage,
          settings: formData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      setSuccess('表示設定の保存が完了しました')
      await fetchData()
      setEditingPage(null)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleCancel = () => {
    setEditingPage(null)
    setFormData({})
  }

  const handleToggleColumn = (column: string) => {
    const currentColumns = formData.columns || []
    const newColumns = currentColumns.includes(column)
      ? currentColumns.filter((c: string) => c !== column)
      : [...currentColumns, column]
    
    setFormData({ ...formData, columns: newColumns })
  }

  const handleToggleCard = (card: string) => {
    const currentCards = formData.cards || []
    const newCards = currentCards.includes(card)
      ? currentCards.filter((c: string) => c !== card)
      : [...currentCards, card]
    
    setFormData({ ...formData, cards: newCards })
  }

  const getPageLabel = (pageName: string) => {
    const page = pageOptions.find(p => p.value === pageName)
    return page ? page.label : pageName
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div className="flex items-center space-x-2">
          <Eye className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">表示設定</h1>
        </div>
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

      <div className="flex justify-between items-center">
        <p className="text-gray-600">各画面に何を表示するか設定できます</p>
      </div>

      {/* ページ一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>ページ一覧</CardTitle>
          <CardDescription>
            設定可能なページ（{pageOptions.length}件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ページ名</TableHead>
                <TableHead>設定状況</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageOptions.map((page) => {
                const setting = displaySettings.find(s => s.page_name === page.value)
                return (
                  <TableRow key={page.value}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{page.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={setting ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {setting ? '設定済み' : '未設定'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(page.value)}>
                        <Eye className="h-4 w-4 mr-1" />
                        設定
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 編集フォーム */}
      {editingPage && (
        <Card>
          <CardHeader>
            <CardTitle>{getPageLabel(editingPage)}の表示設定</CardTitle>
            <CardDescription>
              表示する項目を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 応募者一覧の設定 */}
              {editingPage === 'applicant_list' && (
                <div className="space-y-4">
                  <h4 className="font-medium">表示する列</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {applicantFields.filter(field => field.is_displayed).map((field) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleColumn(field.field_key)}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                        >
                          {formData.columns?.includes(field.field_key) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm">{field.field_name}</span>
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleColumn('created_at')}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                      >
                        {formData.columns?.includes('created_at') ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">応募日</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="items_per_page">1ページあたりの表示件数</Label>
                    <Input
                      id="items_per_page"
                      type="number"
                      value={formData.items_per_page || 20}
                      onChange={(e) => setFormData({ ...formData, items_per_page: parseInt(e.target.value) || 20 })}
                      placeholder="20"
                    />
                  </div>
                </div>
              )}

              {/* ダッシュボードの設定 */}
              {editingPage === 'dashboard' && (
                <div className="space-y-4">
                  <h4 className="font-medium">表示するカード</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {dashboardCardOptions.map((card) => (
                      <div key={card.value} className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCard(card.value)}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                        >
                          {formData.cards?.includes(card.value) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm">{card.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* その他のページの設定 */}
              {!['applicant_list', 'dashboard'].includes(editingPage) && (
                <div className="text-center py-8 text-gray-500">
                  このページの設定は準備中です
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  キャンセル
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
