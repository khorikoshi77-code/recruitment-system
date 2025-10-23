'use client'

import { useEffect, useState } from 'react'
import { supabase, DisplaySetting } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  LayoutDashboard,
  Save,
  CheckSquare,
  Square,
  BarChart3,
  Users,
  TrendingUp,
  UserCheck,
  Clock,
  X,
  Plus
} from 'lucide-react'

interface DashboardEditorProps {
  onBack: () => void
  onNavigate?: (section: string) => void
}

const dashboardCardOptions = [
  { 
    value: 'total_applicants', 
    label: '総応募者数', 
    icon: Users,
    description: '全応募者の総数',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    value: 'passed_rate', 
    label: '書類通過率', 
    icon: TrendingUp,
    description: '書類通過者の割合',
    color: 'bg-green-100 text-green-800'
  },
  { 
    value: 'interviewing_count', 
    label: '面接中', 
    icon: Clock,
    description: '現在面接中の人数',
    color: 'bg-yellow-100 text-yellow-800'
  },
  { 
    value: 'offered_count', 
    label: '内定者数', 
    icon: UserCheck,
    description: '内定者の人数',
    color: 'bg-purple-100 text-purple-800'
  },
  { 
    value: 'declined_count', 
    label: '辞退者数', 
    icon: X,
    description: '辞退した人数',
    color: 'bg-red-100 text-red-800'
  },
  { 
    value: 'recent_applicants', 
    label: '最近の応募者', 
    icon: BarChart3,
    description: '最近の応募者一覧',
    color: 'bg-indigo-100 text-indigo-800'
  }
]

export function DashboardEditor({ onBack, onNavigate }: DashboardEditorProps) {
  const [dashboardSettings, setDashboardSettings] = useState<DisplaySetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // フォーム状態
  const [formData, setFormData] = useState({
    cards: [] as string[],
    layout: 'grid' as 'grid' | 'list',
    show_charts: true,
    show_recent_updates: true
  })

  useEffect(() => {
    fetchDashboardSettings()
  }, [])

  useEffect(() => {
    // ブラウザの戻るボタンに対応
    const handlePopState = () => {
      onBack()
    }

    // 現在の状態を履歴に追加
    window.history.pushState({ section: 'dashboard' }, '', window.location.href)
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack])

  const fetchDashboardSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('display_settings')
        .select('*')
        .eq('page_name', 'dashboard')
        .single()

      if (error) {
        console.error('ダッシュボード設定の取得エラー:', error)
        // テーブルが存在しない場合もモックデータを表示
        setDashboardSettings({
          id: '1',
          page_name: 'dashboard',
          settings: {
            cards: ['total_applicants', 'passed_rate', 'interviewing_count', 'offered_count'],
            layout: 'grid',
            show_charts: true,
            show_recent_updates: true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setFormData({
          cards: ['total_applicants', 'passed_rate', 'interviewing_count', 'offered_count'],
          layout: 'grid',
          show_charts: true,
          show_recent_updates: true
        })
        setError('データベースに接続できません。デモデータを表示しています。')
        return
      }
      
      if (data) {
        setDashboardSettings(data)
        setFormData({
          cards: data.settings.cards || [],
          layout: data.settings.layout || 'grid',
          show_charts: data.settings.show_charts !== false,
          show_recent_updates: data.settings.show_recent_updates !== false
        })
      } else {
        // デフォルト設定
        setFormData({
          cards: ['total_applicants', 'passed_rate', 'interviewing_count', 'offered_count'],
          layout: 'grid',
          show_charts: true,
          show_recent_updates: true
        })
      }
    } catch (error: any) {
      console.error('ダッシュボード設定の取得に失敗しました:', error)
      // エラー時もモックデータを表示
      setDashboardSettings({
        id: '1',
        page_name: 'dashboard',
        settings: {
          cards: ['total_applicants', 'passed_rate'],
          layout: 'grid',
          show_charts: true,
          show_recent_updates: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setFormData({
        cards: ['total_applicants', 'passed_rate'],
        layout: 'grid',
        show_charts: true,
        show_recent_updates: true
      })
      setError('データベースに接続できません。デモデータを表示しています。')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCard = (cardValue: string) => {
    const newCards = formData.cards.includes(cardValue)
      ? formData.cards.filter(card => card !== cardValue)
      : [...formData.cards, cardValue]
    
    setFormData({ ...formData, cards: newCards })
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('display_settings')
        .upsert({
          page_name: 'dashboard',
          settings: formData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('ダッシュボード設定の保存エラー:', error)
        setError('ダッシュボード設定の保存に失敗しました。データベースの設定を確認してください。')
        return
      }
      setSuccess('ダッシュボード設定の保存が完了しました')
      await fetchDashboardSettings()
    } catch (error: any) {
      console.error('ダッシュボード設定の保存に失敗しました:', error)
      setError('ダッシュボード設定の保存に失敗しました')
    }
  }

  const getCardInfo = (cardValue: string) => {
    return dashboardCardOptions.find(card => card.value === cardValue)
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
          <LayoutDashboard className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
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
        <p className="text-gray-600">トップ画面の表示内容を自由に設定できます</p>
        {onNavigate && (
          <Button 
            variant="outline" 
            onClick={() => onNavigate('dashboard_cards')}
          >
            <Plus className="h-4 w-4 mr-2" />
            カードを管理
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 設定フォーム */}
        <Card>
          <CardHeader>
            <CardTitle>ダッシュボード設定</CardTitle>
            <CardDescription>
              表示するカードとレイアウトを設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 表示するカード */}
            <div className="space-y-4">
              <h4 className="font-medium">表示するカード</h4>
              <div className="space-y-2">
                {dashboardCardOptions.map((card) => (
                  <div key={card.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleToggleCard(card.value)}
                      className="flex items-center space-x-3 flex-1"
                    >
                      {formData.cards.includes(card.value) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <card.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{card.label}</div>
                        <div className="text-sm text-gray-500">{card.description}</div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* レイアウト設定 */}
            <div className="space-y-4">
              <h4 className="font-medium">レイアウト設定</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="layout_grid"
                    type="radio"
                    name="layout"
                    value="grid"
                    checked={formData.layout === 'grid'}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value as 'grid' | 'list' })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="layout_grid">グリッドレイアウト（推奨）</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="layout_list"
                    type="radio"
                    name="layout"
                    value="list"
                    checked={formData.layout === 'list'}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value as 'grid' | 'list' })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="layout_list">リストレイアウト</Label>
                </div>
              </div>
            </div>

            {/* その他の設定 */}
            <div className="space-y-4">
              <h4 className="font-medium">その他の設定</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="show_charts"
                    type="checkbox"
                    checked={formData.show_charts}
                    onChange={(e) => setFormData({ ...formData, show_charts: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="show_charts">グラフを表示する</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="show_recent_updates"
                    type="checkbox"
                    checked={formData.show_recent_updates}
                    onChange={(e) => setFormData({ ...formData, show_recent_updates: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="show_recent_updates">最近の更新を表示する</Label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                設定を保存
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* プレビュー */}
        <Card>
          <CardHeader>
            <CardTitle>プレビュー</CardTitle>
            <CardDescription>
              現在の設定での表示イメージ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`grid gap-4 ${formData.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {formData.cards.map((cardValue) => {
                  const card = getCardInfo(cardValue)
                  if (!card) return null
                  
                  return (
                    <div key={cardValue} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${card.color}`}>
                            <card.icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-sm">{card.label}</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-xs text-gray-500">{card.description}</div>
                    </div>
                  )
                })}
              </div>
              
              {formData.cards.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  表示するカードが選択されていません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
