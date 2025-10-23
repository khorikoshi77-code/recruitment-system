'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Edit, Trash2, Star, Save } from 'lucide-react'

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

export function EvaluationManagement({ onBack }: { onBack: () => void }) {
  const [fields, setFields] = useState<EvaluationField[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingField, setEditingField] = useState<EvaluationField | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 1,
    is_required: false,
    is_active: true,
    display_order: 0
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
    window.history.pushState({ section: 'evaluation' }, '', window.location.href)
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack])

  const fetchFields = async () => {
    try {
      setLoading(true)
      // デモデータを表示
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
          is_active: false,
          display_order: 6,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]
      setFields(demoFields)
    } catch (error) {
      console.error('評価項目の取得エラー:', error)
      setError('評価項目の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingField(null)
    setIsAdding(true)
    setFormData({
      name: '',
      description: '',
      weight: 10,
      is_required: false,
      is_active: true,
      display_order: fields.length + 1
    })
  }

  const handleEdit = (field: EvaluationField) => {
    setEditingField(field)
    setIsAdding(false)
    setFormData({
      name: field.name,
      description: field.description,
      weight: field.weight,
      is_required: field.is_required,
      is_active: field.is_active,
      display_order: field.display_order
    })
  }

  const calculateTotalWeight = (fields: EvaluationField[]) => {
    return fields.reduce((sum, field) => sum + field.weight, 0)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('項目名は必須です')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let updatedFields: EvaluationField[]
      
      if (editingField) {
        // 編集
        updatedFields = fields.map(field =>
          field.id === editingField.id
            ? { ...field, ...formData, updated_at: new Date().toISOString() }
            : field
        )
      } else {
        // 新規追加
        const newField: EvaluationField = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        updatedFields = [...fields, newField]
      }

      // 重みの合計チェック（有効項目のみ）
      const activeFields = updatedFields.filter(field => field.is_active)
      const activeWeight = calculateTotalWeight(activeFields)
      if (activeWeight !== 100) {
        setError(`有効項目の重み合計が${activeWeight}%です。100%になるように調整してください。`)
        setSaving(false)
        return
      }

      setFields(updatedFields)
      setSuccess(editingField ? '評価項目を更新しました' : '評価項目を追加しました')

      setEditingField(null)
      setIsAdding(false)
      setFormData({
        name: '',
        description: '',
        weight: 10,
        is_required: false,
        is_active: true,
        display_order: 0
      })
    } catch (error) {
      setError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (fieldId: string) => {
    if (confirm('この評価項目を削除しますか？')) {
      const updatedFields = fields.filter(field => field.id !== fieldId)
      setFields(updatedFields)
      setSuccess('評価項目を削除しました')
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setIsAdding(false)
    setFormData({
      name: '',
      description: '',
      weight: 10,
      is_required: false,
      is_active: true,
      display_order: 0
    })
  }

  const toggleFieldActive = (fieldId: string) => {
    const updatedFields = fields.map(field =>
      field.id === fieldId
        ? { ...field, is_active: !field.is_active, updated_at: new Date().toISOString() }
        : field
    )
    setFields(updatedFields)
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(field => field.id === fieldId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= fields.length) return

    const newFields = [...fields]
    const [movedField] = newFields.splice(currentIndex, 1)
    newFields.splice(newIndex, 0, movedField)

    // 表示順序を更新
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      display_order: index + 1,
      updated_at: new Date().toISOString()
    }))

    setFields(updatedFields)
  }

  const totalWeight = calculateTotalWeight(fields)
  const activeFields = fields.filter(field => field.is_active)
  const activeWeight = calculateTotalWeight(activeFields)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Star className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">面接評価項目</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
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
        <Star className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">面接評価項目</h1>
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

      {/* 評価項目一覧 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>評価項目一覧</CardTitle>
              <CardDescription>
                面接で使用する評価項目を管理できます
                <div className="mt-2">
                  <div className={`text-sm ${activeWeight === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                    項目合計重み: {activeWeight}% {activeWeight === 100 ? '✓' : `(残り${100 - activeWeight}%) ⚠️`}
                  </div>
                </div>
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              項目追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
               <div key={field.id} className={`border rounded-lg p-4 ${!field.is_active ? 'opacity-50 bg-gray-50' : 'bg-green-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{field.name}</h3>
                      {field.is_required && (
                        <Badge variant="destructive" className="text-xs">必須</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        重み: {field.weight}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{field.description}</p>
                     <div className="flex items-center space-x-4 text-xs text-gray-500">
                       <span>表示順: {field.display_order}</span>
                     </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFieldActive(field.id)}
                      className={field.is_active ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}
                    >
                      {field.is_active ? '無効' : '有効'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(field.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 編集フォーム */}
      {(isAdding || editingField) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingField ? '評価項目の編集' : '新しい評価項目の追加'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">項目名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例: 技術スキル"
                />
              </div>

              <div>
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="この評価項目の詳細な説明を入力してください"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">重み（%）</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">表示順序</Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={formData.is_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                  />
                  <Label htmlFor="is_required">必須項目にする</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <Label htmlFor="is_active">有効にする</Label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '保存'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
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
