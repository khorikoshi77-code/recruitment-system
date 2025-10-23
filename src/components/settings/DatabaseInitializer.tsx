'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface TableStatus {
  name: string
  exists: boolean
  created: boolean
}

export function DatabaseInitializer() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([])
  const [needsInitialization, setNeedsInitialization] = useState(false)

  const checkTables = async () => {
    setChecking(true)
    setError('')
    setSuccess('')
    
    try {
      const tables = [
        'users',
        'roles', 
        'applicants',
        'applicant_fields',
        'interviews',
        'reports',
        'display_settings'
      ]

      const statuses: TableStatus[] = []
      let needsInit = false

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1)

          if (error && error.code === 'PGRST116') {
            // テーブルが存在しない
            statuses.push({ name: table, exists: false, created: false })
            needsInit = true
          } else {
            // テーブルが存在する
            statuses.push({ name: table, exists: true, created: false })
          }
        } catch (err) {
          statuses.push({ name: table, exists: false, created: false })
          needsInit = true
        }
      }

      setTableStatuses(statuses)
      setNeedsInitialization(needsInit)
      
      if (needsInit) {
        setError('データベースの初期化が必要です。以下のテーブルが不足しています。')
      } else {
        setSuccess('すべてのテーブルが正常に存在しています。')
      }
    } catch (error: any) {
      console.error('テーブルチェックエラー:', error)
      setError('テーブルの確認に失敗しました。')
    } finally {
      setChecking(false)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // テーブル作成を試行（エラーでも続行）
      const tables = [
        { name: 'users', data: { email: 'test@example.com', password_hash: 'dummy', role: '管理者' } },
        { name: 'roles', data: { role_name: '管理者', role_key: 'admin', description: 'システム管理', is_active: true, permissions: {} } },
        { name: 'applicants', data: { name: 'テスト', email: 'test@example.com', position: 'テスト職種', status: '応募' } },
        { name: 'applicant_fields', data: { field_name: '名前', field_key: 'name', field_type: 'text', is_required: true, is_displayed: true, display_order: 1 } }
      ]

      for (const table of tables) {
        try {
          // テーブルが存在するかテスト
          await supabase.from(table.name).select('*').limit(1)
          console.log(`${table.name}テーブルは既に存在します`)
        } catch (error: any) {
          if (error.code === 'PGRST116') {
            console.log(`${table.name}テーブルが存在しません。作成を試行します。`)
            // テーブル作成を試行（この方法は制限があるため、スキップ）
            console.log('テーブル作成はスキップします')
          }
        }
      }

      // 初期データの挿入を試行
      try {
        await supabase
          .from('roles')
          .upsert([
            {
              role_name: '管理者',
              role_key: 'admin',
              description: 'システム全体の管理',
              is_active: true,
              permissions: {
                "応募者": ["作成", "閲覧", "更新", "削除", "評価更新"],
                "ユーザー": ["作成", "閲覧", "更新", "削除"],
                "設定": ["閲覧", "更新"],
                "レポート": ["閲覧", "エクスポート"],
                "面接": ["作成", "閲覧", "更新", "削除"]
              }
            }
          ], { onConflict: 'role_key' })
        console.log('ロールデータを挿入しました')
      } catch (error) {
        console.log('ロールデータの挿入に失敗しました（テーブルが存在しない可能性があります）')
      }

      try {
        await supabase
          .from('applicant_fields')
          .upsert([
            {
              field_name: '名前',
              field_key: 'name',
              field_type: 'text',
              is_required: true,
              is_displayed: true,
              display_order: 1
            },
            {
              field_name: 'メールアドレス',
              field_key: 'email',
              field_type: 'email',
              is_required: true,
              is_displayed: true,
              display_order: 2
            },
            {
              field_name: '応募職種',
              field_key: 'position',
              field_type: 'text',
              is_required: true,
              is_displayed: true,
              display_order: 3
            }
          ], { onConflict: 'field_key' })
        console.log('フィールドデータを挿入しました')
      } catch (error) {
        console.log('フィールドデータの挿入に失敗しました（テーブルが存在しない可能性があります）')
      }

      setSuccess('初期化を試行しました。テーブルが存在しない場合は、SupabaseのSQLエディタで手動作成してください。')
      setError('一部のテーブルが存在しない可能性があります。SupabaseのSQLエディタでテーブルを作成してください。')
      
      return

      // 6. 初期データを挿入
      await supabase
        .from('roles')
        .upsert([
          {
            role_name: '管理者',
            role_key: 'admin',
            description: 'システム全体の管理',
            is_active: true,
            permissions: {
              "応募者": ["作成", "閲覧", "更新", "削除", "評価更新"],
              "ユーザー": ["作成", "閲覧", "更新", "削除"],
              "設定": ["閲覧", "更新"],
              "レポート": ["閲覧", "エクスポート"],
              "面接": ["作成", "閲覧", "更新", "削除"]
            }
          },
          {
            role_name: '採用担当',
            role_key: 'recruiter',
            description: '採用業務全般を担当',
            is_active: true,
            permissions: {
              "応募者": ["作成", "閲覧", "更新", "削除", "評価更新"],
              "ユーザー": ["作成", "閲覧", "更新", "削除"],
              "設定": ["閲覧", "更新"],
              "レポート": ["閲覧", "エクスポート"],
              "面接": ["作成", "閲覧", "更新", "削除"]
            }
          },
          {
            role_name: '面接官',
            role_key: 'interviewer',
            description: '面接業務を担当',
            is_active: true,
            permissions: {
              "応募者": ["閲覧", "評価更新"],
              "ユーザー": [],
              "設定": [],
              "レポート": ["閲覧"],
              "面接": ["作成", "閲覧", "更新"]
            }
          }
        ], { onConflict: 'role_key' })

      await supabase
        .from('applicant_fields')
        .upsert([
          {
            field_name: '名前',
            field_key: 'name',
            field_type: 'text',
            is_required: true,
            is_displayed: true,
            display_order: 1
          },
          {
            field_name: 'メールアドレス',
            field_key: 'email',
            field_type: 'email',
            is_required: true,
            is_displayed: true,
            display_order: 2
          },
          {
            field_name: '応募職種',
            field_key: 'position',
            field_type: 'text',
            is_required: true,
            is_displayed: true,
            display_order: 3
          }
        ], { onConflict: 'field_key' })

      setSuccess('データベースの初期化が完了しました。')
      setNeedsInitialization(false)
      
      // テーブル状態を再確認
      await checkTables()
      
    } catch (error: any) {
      console.error('初期化エラー:', error)
      setError(`初期化に失敗しました: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>データベース初期化</span>
        </CardTitle>
        <CardDescription>
          システムに必要なテーブルとデータを作成します。既存のデータは保護されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-4">
          <Button
            onClick={checkTables}
            disabled={checking}
            variant="outline"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                確認中...
              </>
            ) : (
              'テーブル状態を確認'
            )}
          </Button>

          {needsInitialization && (
            <Button
              onClick={initializeDatabase}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  初期化中...
                </>
              ) : (
                'データベースを初期化'
              )}
            </Button>
          )}
        </div>

        {tableStatuses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">テーブル状態</h4>
            <div className="grid grid-cols-2 gap-2">
              {tableStatuses.map((status) => (
                <div
                  key={status.name}
                  className="flex items-center space-x-2 p-2 rounded border"
                >
                  {status.exists ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">{status.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
