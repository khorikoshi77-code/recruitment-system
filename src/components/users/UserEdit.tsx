'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, User, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface User {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

interface Role {
  id: string
  role_name: string
  role_key: string
  description: string
  is_active: boolean
}

interface UserEditProps {
  userId: string
}

export function UserEdit({ userId }: UserEditProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  // フォーム状態
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    fetchUser()
    fetchRoles()
  }, [userId])

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('role_name', { ascending: true })

      if (error) {
        console.error('ロールデータの取得エラー:', error)
        // エラーでもデフォルトロールを表示
        setRoles([
          {
            id: 'admin',
            role_name: '管理者',
            role_key: 'admin',
            description: 'システム全体の管理',
            is_active: true
          },
          {
            id: 'recruiter',
            role_name: '採用担当',
            role_key: 'recruiter',
            description: '採用業務全般を担当',
            is_active: true
          },
          {
            id: 'interviewer',
            role_name: '面接官',
            role_key: 'interviewer',
            description: '面接業務を担当',
            is_active: true
          }
        ])
        return
      }
      setRoles(data || [])
    } catch (error: any) {
      console.error('ロールデータの取得に失敗しました:', error)
      // エラーでもデフォルトロールを表示
      setRoles([
        {
          id: 'admin',
          role_name: '管理者',
          role_key: 'admin',
          description: 'システム全体の管理',
          is_active: true
        },
        {
          id: 'recruiter',
          role_name: '採用担当',
          role_key: 'recruiter',
          description: '採用業務全般を担当',
          is_active: true
        },
        {
          id: 'interviewer',
          role_name: '面接官',
          role_key: 'interviewer',
          description: '面接業務を担当',
          is_active: true
        }
      ])
    } finally {
      setRolesLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      if (!data) throw new Error('ユーザーが見つかりません')

      setUser(data)
      setEmail(data.email)
      setRole(data.role)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          email,
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error

      setSuccess('更新が完了しました')
      setUser({ ...user, email, role, updated_at: new Date().toISOString() })
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

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">ユーザー編集</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>ユーザーが見つかりません</AlertDescription>
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
        <div className="flex items-center space-x-2">
          <User className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">ユーザー編集</h1>
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>基本情報</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">ユーザーID</Label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">登録日</Label>
              <p className="text-sm">
                {format(new Date(user.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">最終更新</Label>
              <p className="text-sm">
                {format(new Date(user.updated_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 編集フォーム */}
        <Card>
          <CardHeader>
            <CardTitle>情報編集</CardTitle>
            <CardDescription>
              ユーザー情報を編集してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
              />
            </div>

            <div>
              <Label htmlFor="role">ロール</Label>
              <Select value={role} onValueChange={(value: string) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={rolesLoading ? "読み込み中..." : "ロールを選択してください"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((roleItem) => (
                    <SelectItem key={roleItem.id} value={roleItem.role_name}>
                      {roleItem.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </div>
  )
}
