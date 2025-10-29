'use client'

import { useEffect, useState } from 'react'
import { supabase, ApplicantField } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Database,
  GripVertical,
  Save
} from 'lucide-react'

interface FieldManagementProps {
  onBack: () => void
}

export function FieldManagement({ onBack }: FieldManagementProps) {
  const [fields, setFields] = useState<ApplicantField[]>([])
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<ApplicantField | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // フォーム状態
  const [formData, setFormData] = useState({
    field_name: '',
    field_type: 'text' as 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'date',
    is_required: false,
    is_displayed: true,
    display_order: 0,
    options: '',
    validation_rules: ''
  })

  useEffect(() => {
    fetchFields()
  }, [])

  useEffect(() => {
    // ブラウザの戻るボタンに対応
    const handlePopState = () => {
      onBack()
    }

    // 現在の状態を履歴に追加
    window.history.pushState({ section: 'fields' }, '', window.location.href)
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack])

  // 項目名からキーを自動生成
  const generateFieldKey = (fieldName: string) => {
    return fieldName
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // 特殊文字を削除
      .replace(/\s+/g, '_') // スペースをアンダースコアに
      .replace(/^_+|_+$/g, '') // 前後のアンダースコアを削除
  }

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('applicant_fields')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('項目データの取得エラー:', error)
        setError('項目データの取得に失敗しました。データベースの設定を確認してください。')
        return
      }
      setFields(data || [])
    } catch (error: any) {
      console.error('項目データの取得に失敗しました:', error)
      setError('項目データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const fieldData = {
        ...formData,
        field_key: generateFieldKey(formData.field_name), // キーを自動生成
        options: formData.options ? JSON.parse(formData.options) : null,
        validation_rules: formData.validation_rules ? JSON.parse(formData.validation_rules) : null,
      }

      if (editingField) {
        // 編集
        const { error } = await supabase
          .from('applicant_fields')
          .update(fieldData)
          .eq('id', editingField.id)
          .select()

        if (error) throw error
        setSuccess('項目の更新が完了しました')
      } else {
        // 新規作成
        const { error } = await supabase
          .from('applicant_fields')
          .insert(fieldData)
          .select()

        if (error) throw error
        setSuccess('項目の追加が完了しました')
      }

      await fetchFields()
      resetForm()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleEdit = (field: ApplicantField) => {
    setEditingField(field)
    setFormData({
      field_name: field.field_name,
      field_type: field.field_type,
      is_required: field.is_required,
      is_displayed: field.is_displayed,
      display_order: field.display_order,
      options: field.options ? JSON.stringify(field.options, null, 2) : '',
      validation_rules: field.validation_rules ? JSON.stringify(field.validation_rules, null, 2) : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (fieldId: string) => {
    if (!confirm('この項目を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('applicant_fields')
        .delete()
        .eq('id', fieldId)
        .select()

      if (error) throw error
      setSuccess('項目の削除が完了しました')
      await fetchFields()
    } catch (error: any) {
      setError('項目の削除に失敗しました')
    }
  }

  const resetForm = () => {
    setEditingField(null)
    setShowForm(false)
    setFormData({
      field_name: '',
      field_type: 'text',
      is_required: false,
      is_displayed: true,
      display_order: 0,
      options: '',
      validation_rules: ''
    })
  }

  const getFieldTypeLabel = (type: string) => {
    const types = {
      text: 'テキスト',
      email: 'メール',
      tel: '電話番号',
      select: '選択肢',
      textarea: 'テキストエリア',
      date: '日付'
    }
    return types[type as keyof typeof types] || type
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
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">応募者登録</h1>
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
        <p className="text-gray-600">応募者登録フォームの項目を自由に設定できます</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          項目を追加
        </Button>
      </div>

      {/* 項目一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>項目一覧</CardTitle>
          <CardDescription>
            現在設定されている項目（{fields.length}件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表示順</TableHead>
                <TableHead>項目名</TableHead>
                <TableHead>タイプ</TableHead>
                <TableHead>必須</TableHead>
                <TableHead>表示</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {error ? (
                      <div>
                        <p className="text-red-600 mb-2">{error}</p>
                        <p className="text-sm">データベースの設定を確認してください。</p>
                      </div>
                    ) : (
                      <p>項目が登録されていません</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span>{field.display_order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{field.field_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getFieldTypeLabel(field.field_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={field.is_required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                      {field.is_required ? '必須' : '任意'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={field.is_displayed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {field.is_displayed ? '表示' : '非表示'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(field)}>
                        <Edit className="h-4 w-4 mr-1" />
                        編集
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(field.id)}
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
              {editingField ? '項目の編集' : '項目の追加'}
            </CardTitle>
            <CardDescription>
              応募者情報の項目を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="field_name">項目名</Label>
                  <Input
                    id="field_name"
                    value={formData.field_name}
                    onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                    placeholder="名前"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="field_type">項目タイプ</Label>
                  <Select value={formData.field_type} onValueChange={(value: any) => setFormData({ ...formData, field_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">テキスト</SelectItem>
                      <SelectItem value="email">メール</SelectItem>
                      <SelectItem value="tel">電話番号</SelectItem>
                      <SelectItem value="select">選択肢</SelectItem>
                      <SelectItem value="textarea">テキストエリア</SelectItem>
                      <SelectItem value="date">日付</SelectItem>
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

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    id="is_required"
                    type="checkbox"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="is_required">必須項目</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="is_displayed"
                    type="checkbox"
                    checked={formData.is_displayed}
                    onChange={(e) => setFormData({ ...formData, is_displayed: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="is_displayed">表示する</Label>
                </div>
              </div>

              {formData.field_type === 'select' && (
                <div className="space-y-2">
                  <Label htmlFor="options">選択肢（JSON形式）</Label>
                  <Input
                    id="options"
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    placeholder='["選択肢1", "選択肢2", "選択肢3"]'
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="validation_rules">入力ルール（JSON形式）</Label>
                <Input
                  id="validation_rules"
                  value={formData.validation_rules}
                  onChange={(e) => setFormData({ ...formData, validation_rules: e.target.value })}
                  placeholder='{"最小文字数": 3, "最大文字数": 50}'
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingField ? '更新' : '追加'}
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
