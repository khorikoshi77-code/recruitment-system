'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Users, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface User {
  id: string
  email: string
  role: '採用担当' | '面接官' | '管理者'
  created_at: string
  updated_at: string
}

const roleColors = {
  '採用担当': 'bg-blue-100 text-blue-800',
  '面接官': 'bg-green-100 text-green-800',
  '管理者': 'bg-red-100 text-red-800',
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, role } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('ユーザーデータの取得エラー:', error)
        // エラーでも現在のユーザーを表示
        if (user && role) {
          setUsers([{
            id: user.id,
            email: user.email || '',
            role: role as '採用担当' | '面接官',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        }
        return
      }
      setUsers(data || [])
    } catch (error: any) {
      console.error('ユーザーデータの取得に失敗しました:', error)
      setError('ユーザーデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('このユーザーを削除しますか？\n\n注意: この操作は取り消せません。')) return

    try {
      // 認証ユーザーを削除
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) {
        console.warn('認証ユーザーの削除に失敗しました:', authError)
        // 認証ユーザーの削除に失敗しても、データベースのユーザー情報は削除を試行
      }

      // データベースのユーザー情報を削除
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (dbError) throw dbError

      // ユーザー一覧を再取得
      await fetchUsers()
    } catch (error: any) {
      console.error('ユーザーの削除に失敗しました:', error)
      setError('ユーザーの削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        </div>
        <Button asChild>
          <a href="/users/new">
            <Plus className="h-4 w-4 mr-2" />
            ユーザー追加
          </a>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ユーザー一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>登録済みユーザー</span>
          </CardTitle>
          <CardDescription>
            システムに登録されているユーザー一覧（{users.length}名）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>ロール</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        className={roleColors[user.role]}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? format(new Date(user.created_at), 'yyyy/MM/dd', { locale: ja }) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/users/${user.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            編集
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              登録されているユーザーがありません
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
