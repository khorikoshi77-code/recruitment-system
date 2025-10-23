'use client'

import { useEffect, useState } from 'react'
import { supabase, DashboardCard } from '@/lib/supabase'
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
  GripVertical,
  Save,
  X,
  BarChart3,
  Users,
  TrendingUp,
  UserCheck,
  Clock,
  Activity,
  PieChart
} from 'lucide-react'

interface DashboardCardManagerProps {
  onBack: () => void
}

const cardTypeOptions = [
  { value: 'number', label: '数値表示', icon: BarChart3 },
  { value: 'chart', label: 'グラフ', icon: PieChart },
  { value: 'list', label: '一覧', icon: Users },
  { value: 'progress', label: '進捗', icon: Activity }
]

const iconOptions = [
  { value: 'BarChart3', label: '棒グラフ', icon: BarChart3 },
  { value: 'Users', label: 'ユーザー', icon: Users },
  { value: 'TrendingUp', label: 'トレンド', icon: TrendingUp },
  { value: 'UserCheck', label: 'チェック', icon: UserCheck },
  { value: 'Clock', label: '時計', icon: Clock },
  { value: 'Activity', label: 'アクティビティ', icon: Activity },
  { value: 'PieChart', label: '円グラフ', icon: PieChart }
]

const colorOptions = [
  { value: 'blue', label: '青', color: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: '緑', color: 'bg-green-100 text-green-800' },
  { value: 'yellow', label: '黄', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'red', label: '赤', color: 'bg-red-100 text-red-800' },
  { value: 'purple', label: '紫', color: 'bg-purple-100 text-purple-800' },
  { value: 'indigo', label: '藍', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'pink', label: 'ピンク', color: 'bg-pink-100 text-pink-800' },
  { value: 'gray', label: 'グレー', color: 'bg-gray-100 text-gray-800' }
]

const dataSourceOptions = [
  { value: '応募者', label: '応募者データ' },
  { value: 'ユーザー', label: 'ユーザーデータ' },
  { value: '面接', label: '面接データ' }
]

export function DashboardCardManager({ onBack }: DashboardCardManagerProps) {
  const [cards, setCards] = useState<DashboardCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<DashboardCard | null>(null)

  const [formData, setFormData] = useState({
    card_key: '',
    card_name: '',
    card_type: 'number' as 'number' | 'chart' | 'list' | 'progress',
    card_icon: 'BarChart3',
    card_color: 'blue',
    data_source: '応募者',
    data_query: '{}',
    display_order: 0
  })

  useEffect(() => {
    fetchCards()
  }, [])

  useEffect(() => {
    // ブラウザの戻るボタンに対応
    const handlePopState = () => {
      onBack()
    }

    // 現在の状態を履歴に追加
    window.history.pushState({ section: 'dashboard_cards' }, '', window.location.href)
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack])

  // カード名からキーを自動生成
  const generateCardKey = (cardName: string) => {
    return cardName
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // 特殊文字を削除
      .replace(/\s+/g, '_') // スペースをアンダースコアに
      .replace(/^_+|_+$/g, '') // 前後のアンダースコアを削除
  }

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_cards')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('カードデータの取得エラー:', error)
        // モックデータを表示
        setCards([
          {
            id: '1',
            card_key: '総応募者数',
            card_name: '総応募者数',
            card_type: 'number',
            card_icon: 'Users',
            card_color: 'blue',
            data_source: '応募者',
            data_query: { 件数: true },
            display_order: 1,
            is_active: true,
            is_custom: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            card_key: '書類通過率',
            card_name: '書類通過率',
            card_type: 'number',
            card_icon: 'TrendingUp',
            card_color: 'green',
            data_source: '応募者',
            data_query: { ステータス: '書類通過', 割合: true },
            display_order: 2,
            is_active: true,
            is_custom: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            card_key: 'カスタム指標',
            card_name: 'カスタム指標',
            card_type: 'chart',
            card_icon: 'BarChart3',
            card_color: 'purple',
            data_source: '応募者',
            data_query: { グループ分け: 'position', グラフ種類: 'bar' },
            display_order: 3,
            is_active: true,
            is_custom: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        setError('データベースに接続できません。デモデータを表示しています。')
        return
      }
      setCards(data || [])
    } catch (error: any) {
      console.error('カードデータの取得に失敗しました:', error)
      setCards([])
      setError('カードデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const cardData = {
        ...formData,
        card_key: generateCardKey(formData.card_name), // キーを自動生成
        data_query: JSON.parse(formData.data_query),
        is_custom: true,
        is_active: true
      }

      if (editingCard) {
        // 更新
        const { error } = await supabase
          .from('dashboard_cards')
          .update(cardData)
          .eq('id', editingCard.id)

        if (error) throw error
        setSuccess('カードを更新しました')
      } else {
        // 新規作成
        const { error } = await supabase
          .from('dashboard_cards')
          .insert([cardData])

        if (error) throw error
        setSuccess('カードを作成しました')
      }

      setShowForm(false)
      setEditingCard(null)
      setFormData({
        card_key: '',
        card_name: '',
        card_type: 'number',
        card_icon: 'BarChart3',
        card_color: 'blue',
        data_source: '応募者',
        data_query: '{}',
        display_order: 0
      })
      fetchCards()
    } catch (error: any) {
      console.error('カードの保存に失敗しました:', error)
      setError('カードの保存に失敗しました')
    }
  }

  const handleEdit = (card: DashboardCard) => {
    setEditingCard(card)
    setFormData({
      card_key: card.card_key,
      card_name: card.card_name,
      card_type: card.card_type,
      card_icon: card.card_icon || 'BarChart3',
      card_color: card.card_color,
      data_source: card.data_source,
      data_query: JSON.stringify(card.data_query),
      display_order: card.display_order
    })
    setShowForm(true)
  }

  const handleDelete = async (cardId: string) => {
    if (!confirm('このカードを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('dashboard_cards')
        .delete()
        .eq('id', cardId)

      if (error) throw error
      setSuccess('カードを削除しました')
      fetchCards()
    } catch (error: any) {
      console.error('カードの削除に失敗しました:', error)
      setError('カードの削除に失敗しました')
    }
  }

  const getCardTypeLabel = (type: string) => {
    const option = cardTypeOptions.find(opt => opt.value === type)
    return option ? option.label : type
  }

  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find(opt => opt.value === iconName)
    return option ? option.icon : BarChart3
  }

  const getColorClasses = (color: string) => {
    const option = colorOptions.find(opt => opt.value === color)
    return option ? option.color : 'bg-gray-100 text-gray-800'
  }

  const resetForm = () => {
    setEditingCard(null)
    setShowForm(false)
    setFormData({
      card_key: '',
      card_name: '',
      card_type: 'number',
      card_icon: 'BarChart3',
      card_color: 'blue',
      data_source: '応募者',
      data_query: '{}',
      display_order: 0
    })
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
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボードカード管理</h1>
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
        <p className="text-gray-600">トップ画面に表示する項目を自由に作成・編集できます</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          カードを作成
        </Button>
      </div>

      {/* カード一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>カード一覧</CardTitle>
          <CardDescription>
            現在登録されているカード（{cards.length}件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表示順</TableHead>
                <TableHead>カード名</TableHead>
                <TableHead>タイプ</TableHead>
                <TableHead>アイコン</TableHead>
                <TableHead>色</TableHead>
                <TableHead>データソース</TableHead>
                <TableHead>カスタム</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => {
                const IconComponent = getIconComponent(card.card_icon || 'BarChart3')
                return (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span>{card.display_order}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{card.card_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCardTypeLabel(card.card_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <IconComponent className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <Badge className={getColorClasses(card.card_color)}>
                        {colorOptions.find(option => option.value === card.card_color)?.label || card.card_color}
                      </Badge>
                    </TableCell>
                    <TableCell>{card.data_source}</TableCell>
                    <TableCell>
                      <Badge variant={card.is_custom ? "default" : "secondary"}>
                        {card.is_custom ? 'カスタム' : '標準'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(card)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {card.is_custom && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(card.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* カード作成・編集フォーム */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCard ? 'カードを編集' : 'カードを作成'}
            </CardTitle>
            <CardDescription>
              {editingCard ? 'カードの情報を編集できます' : '新しいカードを作成できます'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card_name">カード名</Label>
                  <Input
                    id="card_name"
                    value={formData.card_name}
                    onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                    placeholder="例: カスタム指標"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card_type">カードタイプ</Label>
                  <Select
                    value={formData.card_type}
                    onValueChange={(value: any) => setFormData({ ...formData, card_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cardTypeOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="card_icon">アイコン</Label>
                  <Select
                    value={formData.card_icon}
                    onValueChange={(value) => setFormData({ ...formData, card_icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card_color">色</Label>
                  <Select
                    value={formData.card_color}
                    onValueChange={(value) => setFormData({ ...formData, card_color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded ${option.color}`}></div>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data_source">データソース</Label>
                  <Select
                    value={formData.data_source}
                    onValueChange={(value) => setFormData({ ...formData, data_source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSourceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

                <div>
                  <Label htmlFor="data_query">データ取得条件（JSON形式）</Label>
                  <Input
                    id="data_query"
                    value={formData.data_query}
                    onChange={(e) => setFormData({ ...formData, data_query: e.target.value })}
                    placeholder='例: {"件数": true, "ステータス": "応募"}'
                    required
                  />
                </div>

              <div>
                <Label htmlFor="display_order">表示順序</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCard(null)
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  キャンセル
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCard ? '更新' : '作成'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
