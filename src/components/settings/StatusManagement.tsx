'use client'

import { useEffect, useState } from 'react'
import { supabase, StatusSetting } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  GripVertical,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

interface StatusManagementProps {
  onBack: () => void
}

const colorOptions = [
  { value: 'blue', label: '青', color: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: '緑', color: 'bg-green-100 text-green-800' },
  { value: 'yellow', label: '黄', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'purple', label: '紫', color: 'bg-purple-100 text-purple-800' },
  { value: 'red', label: '赤', color: 'bg-red-100 text-red-800' },
  { value: 'gray', label: 'グレー', color: 'bg-gray-100 text-gray-800' },
  { value: 'indigo', label: 'インディゴ', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'pink', label: 'ピンク', color: 'bg-pink-100 text-pink-800' },
]

export function StatusManagement({ onBack }: StatusManagementProps) {
  const [statuses, setStatuses] = useState<StatusSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStatus, setEditingStatus] = useState<StatusSetting | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // フォーム状態
  const [formData, setFormData] = useState({
    status_name: '',
    status_color: 'blue',
    is_active: true,
    display_order: 0
  })

  useEffect(() => {
    fetchStatuses()
  }, [])

  useEffect(() => {
    // ブラウザの戻るボタンに対応
    const handlePopState = () => {
      onBack()
    }

    // 現在の状態を履歴に追加
    window.history.pushState({ section: 'status' }, '', window.location.href)
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack])

  // ステータス名からキーを自動生成
  const generateStatusKey = (statusName: string) => {
    return statusName
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // 特殊文字を削除
      .replace(/\s+/g, '_') // スペースをアンダースコアに
      .replace(/^_+|_+$/g, '') // 前後のアンダースコアを削除
  }

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('status_settings')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('ステータスデータの取得エラー:', error)
        setError('ステータスデータの取得に失敗しました。データベースの設定を確認してください。')
        return
      }
      setStatuses(data || [])
    } catch (error: any) {
      console.error('ステータスデータの取得に失敗しました:', error)
      setError('ステータスデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const statusData = {
        ...formData,
        status_key: generateStatusKey(formData.status_name), // キーを自動生成
      }

      if (editingStatus) {
        // 編集
        const { error } = await supabase
          .from('status_settings')
          .update(statusData)
          .eq('id', editingStatus.id)
          .select()

        if (error) throw error
        setSuccess('ステータスの更新が完了しました')
      } else {
        // 新規作成
        const { error } = await supabase
          .from('status_settings')
          .insert(statusData)
          .select()

        if (error) throw error
        setSuccess('ステータスの追加が完了しました')
      }

      await fetchStatuses()
      resetForm()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleEdit = (status: StatusSetting) => {
    setEditingStatus(status)
    setFormData({
      status_name: status.status_name,
      status_color: status.status_color,
      is_active: status.is_active,
      display_order: status.display_order
    })
    setShowForm(true)
  }

  const handleDelete = async (statusId: string) => {
    if (!confirm('このステータスを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('status_settings')
        .delete()
        .eq('id', statusId)
        .select()

      if (error) throw error
      setSuccess('ステータスの削除が完了しました')
      await fetchStatuses()
    } catch (error: any) {
      setError('ステータスの削除に失敗しました')
    }
  }

  const resetForm = () => {
    setEditingStatus(null)
    setShowForm(false)
    setFormData({
      status_name: '',
      status_color: 'blue',
      is_active: true,
      display_order: 0
    })
  }

  const getColorClasses = (color: string) => {
    const colorOption = colorOptions.find(option => option.value === color)
    return colorOption ? colorOption.color : 'bg-gray-100 text-gray-800'
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
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">採用ステータス</h1>
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
        <p className="text-gray-600">採用の進捗状況を管理できます</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ステータスを追加
        </Button>
      </div>

      {/* ステータス一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>ステータス一覧</CardTitle>
          <CardDescription>
            現在設定されているステータス（{statuses.length}件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表示順</TableHead>
                <TableHead>ステータス名</TableHead>
                <TableHead>色</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {error ? (
                      <div>
                        <p className="text-red-600 mb-2">{error}</p>
                        <p className="text-sm">データベースの設定を確認してください。</p>
                      </div>
                    ) : (
                      <p>ステータスが登録されていません</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                statuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span>{status.display_order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{status.status_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getColorClasses(status.status_color)}>
                      {colorOptions.find(option => option.value === status.status_color)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {status.is_active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={status.is_active ? 'text-green-600' : 'text-gray-400'}>
                        {status.is_active ? '有効' : '無効'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(status)}>
                        <Edit className="h-4 w-4 mr-1" />
                        編集
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(status.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 編集フォーム */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingStatus ? 'ステータスの編集' : 'ステータスの追加'}
            </CardTitle>
            <CardDescription>
              採用ステータスを設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status_name">ステータス名</Label>
                  <Input
                    id="status_name"
                    value={formData.status_name}
                    onChange={(e) => setFormData({ ...formData, status_name: e.target.value })}
                    placeholder="応募"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status_color">色</Label>
                  <Select value={formData.status_color} onValueChange={(value) => setFormData({ ...formData, status_color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${option.color.split(' ')[0]}`}></div>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">表示順序</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="is_active">有効にする</Label>
              </div>

              {/* プレビュー */}
              <div className="space-y-2">
                <Label>プレビュー</Label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Badge className={getColorClasses(formData.status_color)}>
                    {formData.status_name || 'ステータス名'}
                  </Badge>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingStatus ? '更新' : '追加'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
