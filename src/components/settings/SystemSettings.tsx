'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Database, 
  Eye, 
  Shield, 
  Users,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
  Star
} from 'lucide-react'
import { DatabaseInitializer } from './DatabaseInitializer'

interface SystemSettingsProps {
  onNavigate: (section: string) => void
}

export function SystemSettings({ onNavigate }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const settingsSections = [
    {
      id: 'fields',
      title: '応募者登録',
      description: '応募者情報の項目を追加・編集・削除できます',
      icon: Database,
      color: 'blue',
      features: [
        '項目の追加・削除',
        '必須項目の設定',
        '表示順序の変更',
        '入力ルールの設定'
      ]
    },
    {
      id: 'status',
      title: '採用ステータス',
      description: '採用ステータスを管理できます',
      icon: CheckCircle,
      color: 'green',
      features: [
        'ステータスの追加・削除',
        'ステータスの色設定',
        '表示順序の変更',
        'ステータスの流れ設定'
      ]
    },
    {
      id: 'display',
      title: '表示設定',
      description: '各画面の表示項目を設定できます',
      icon: Eye,
      color: 'purple',
      features: [
        '一覧画面の表示項目選択',
        '詳細画面の表示項目選択',
        '検索対象項目の設定',
        '1ページあたりの表示件数設定'
      ]
    },
    {
      id: 'dashboard',
      title: 'ダッシュボード',
      description: 'ダッシュボードの表示内容をカスタマイズできます',
      icon: LayoutDashboard,
      color: 'indigo',
      features: [
        '表示する項目の選択',
        '画面レイアウトの設定',
        'グラフの表示・非表示',
        'オリジナル項目の作成',
        '変更内容の確認'
      ]
    },
    {
      id: 'evaluation',
      title: '面接評価項目',
      description: '面接で使用する評価項目を管理できます',
      icon: Star,
      color: 'amber',
      features: [
        '評価項目の追加・編集・削除',
        '項目の重み設定',
        '必須項目の設定',
        '表示順序の変更',
        '項目の説明設定'
      ]
    },
    {
      id: 'roles',
      title: 'ロール',
      description: 'システム内のロール（役割）を管理できます',
      icon: Users,
      color: 'orange',
      features: [
        'ロールの追加・編集・削除',
        'ロールキーの設定',
        '説明の設定',
        '有効/無効の切り替え'
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      orange: 'bg-orange-100 text-orange-800',
      amber: 'bg-amber-100 text-amber-800'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">システム設定</h1>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          設定を変更する前に、現在の設定内容を確認することをお勧めします。
          設定変更は即座に反映されます。
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Card key={section.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getColorClasses(section.color)}`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {section.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">主な機能:</h4>
                <ul className="space-y-1">
                  {section.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate(section.id)
                  }}
                >
                  設定を開く
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
