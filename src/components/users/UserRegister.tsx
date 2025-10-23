'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'

interface Role {
  id: string
  role_name: string
  role_key: string
  description: string
  is_active: boolean
}

export function UserRegister() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  // フォーム状態
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  })

  useEffect(() => {
    fetchRoles()
  }, [])

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // バリデーション
      if (!formData.email || !formData.password || !formData.role) {
        throw new Error('すべての項目を入力してください')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('パスワードが一致しません')
      }

      if (formData.password.length < 6) {
        throw new Error('パスワードは6文字以上で入力してください')
      }

      // ユーザー作成
      await createUser(formData.email, formData.password, formData.role as '採用担当' | '面接官')

      setSuccess('ユーザーの登録が完了しました')
      
      // 3秒後にユーザー一覧に遷移
      setTimeout(() => {
        router.push('/users')
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'ユーザーの登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div className="flex items-center space-x-2">
          <UserPlus className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">ユーザー追加</h1>
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

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>ユーザー情報入力</CardTitle>
          <CardDescription>
            新しいユーザーの情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">ロール <span className="text-red-500">*</span></Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={rolesLoading ? "読み込み中..." : "ロールを選択してください"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.role_name}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="6文字以上で入力"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード確認 <span className="text-red-500">*</span></Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="パスワードを再入力"
                required
              />
            </div>


            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? '登録中...' : '登録'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
