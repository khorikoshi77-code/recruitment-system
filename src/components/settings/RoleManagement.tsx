'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft,
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Save,
  X
} from 'lucide-react'

interface Role {
  id: string
  role_name: string
  role_key: string
  description: string
  is_active: boolean
  permissions: Record<string, string[]>
  created_at: string
  updated_at: string
}

interface RoleManagementProps {
  onBack: () => void
}

// 権限モジュール定義
const permissionModules = [
  {
    module: '応募者',
    label: '応募者管理',
    permissions: [
      { key: '作成', label: '作成' },
      { key: '閲覧', label: '閲覧' },
      { key: '更新', label: '編集' },
      { key: '削除', label: '削除' },
      { key: '評価更新', label: '評価更新' }
    ]
  },
  {
    module: 'ユーザー',
    label: 'ユーザー管理',
    permissions: [
      { key: '作成', label: '作成' },
      { key: '閲覧', label: '閲覧' },
      { key: '更新', label: '編集' },
      { key: '削除', label: '削除' }
    ]
  },
  {
    module: '設定',
    label: 'システム設定',
    permissions: [
      { key: '閲覧', label: '閲覧' },
      { key: '更新', label: '更新' }
    ]
  },
  {
    module: 'レポート',
    label: 'レポート',
    permissions: [
      { key: '閲覧', label: '閲覧' },
      { key: 'エクスポート', label: 'エクスポート' }
    ]
  },
  {
    module: '面接',
    label: '面接管理',
    permissions: [
      { key: '作成', label: '作成' },
      { key: '閲覧', label: '閲覧' },
      { key: '更新', label: '編集' },
      { key: '削除', label: '削除' }
    ]
  }
]

export function RoleManagement({ onBack }: RoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    is_active: true,
    permissions: {} as Record<string, string[]>
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    // ブラウザの戻るボタンに対応
    const handlePopState = () => {
      onBack()
    }

    // 現在の状態を履歴に追加
    window.history.pushState({ section: 'roles' }, '', window.location.href)
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack])

  // ロール名からキーを自動生成
  const generateRoleKey = (roleName: string) => {
    return roleName
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // 特殊文字を削除
      .replace(/\s+/g, '_') // スペースをアンダースコアに
      .replace(/^_+|_+$/g, '') // 前後のアンダースコアを削除
  }

  // 権限のチェック・更新
  const handlePermissionChange = (module: string, permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked
          ? [...(prev.permissions[module] || []), permission]
          : (prev.permissions[module] || []).filter(p => p !== permission)
      }
    }))
  }

  // 全権限の選択・解除
  const handleSelectAllPermissions = (module: string, checked: boolean) => {
    const moduleData = permissionModules.find(m => m.module === module)
    if (!moduleData) return

    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked ? moduleData.permissions.map(p => p.key) : []
      }
    }))
  }

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('role_name', { ascending: true })

      if (error) {
        console.error('ロールデータの取得エラー:', error)
        // エラーでも管理者ロールを作成
        await createAdminRole()
        setRoles([{
          id: 'admin-role',
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
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        return
      }
      
      // データが空の場合は管理者ロールを自動作成
      if (!data || data.length === 0) {
        await createAdminRole()
        // 再取得
        const { data: newData, error: newError } = await supabase
          .from('roles')
          .select('*')
          .order('role_name', { ascending: true })
        
        if (newError) {
          console.error('再取得エラー:', newError)
          setError('ロールデータの取得に失敗しました')
          return
        }
        setRoles(newData || [])
      } else {
        setRoles(data)
      }
    } catch (error: any) {
      console.error('ロールデータの取得に失敗しました:', error)
      setRoles([])
      setError('ロールデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createAdminRole = async () => {
    try {
      const { error } = await supabase
        .from('roles')
        .insert({
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
        })
        .select()

      if (error) {
        console.error('管理者ロール作成エラー:', error)
        throw error
      }
    } catch (error: any) {
      console.error('管理者ロールの作成に失敗しました:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const roleData = {
        ...formData,
        role_key: generateRoleKey(formData.role_name), // キーを自動生成
      }

      if (editingRole) {
        // 更新
        const { error } = await supabase
          .from('roles')
          .update(roleData)
          .eq('id', editingRole.id)
          .select()

        if (error) throw error
        setSuccess('ロールを更新しました')
      } else {
        // 新規作成
        const { error } = await supabase
          .from('roles')
          .insert([roleData])
          .select()

        if (error) throw error
        setSuccess('ロールを作成しました')
      }

      setShowForm(false)
      setEditingRole(null)
      setFormData({
        role_name: '',
        description: '',
        is_active: true,
        permissions: {}
      })
      fetchRoles()
    } catch (error: any) {
      console.error('ロールの保存に失敗しました:', error)
      setError('ロールの保存に失敗しました')
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      role_name: role.role_name,
      description: role.description,
      is_active: role.is_active,
      permissions: role.permissions || {}
    })
    setShowForm(true)
  }

  const handleDelete = async (roleId: string) => {
    // 管理者ロールの削除を防止
    const roleToDelete = roles.find(role => role.id === roleId)
    if (roleToDelete?.role_name === '管理者') {
      alert('管理者ロールは削除できません')
      return
    }
    
    if (!confirm('このロールを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId)
        .select()

      if (error) throw error
      setSuccess('ロールを削除しました')
      fetchRoles()
    } catch (error: any) {
      console.error('ロールの削除に失敗しました:', error)
      setError('ロールの削除に失敗しました')
    }
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
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">ロール</h1>
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
        <p className="text-gray-600">システム内のロール（役割）を管理できます</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ロールを追加
        </Button>
      </div>

      {/* ロール一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>ロール一覧</CardTitle>
          <CardDescription>
            現在登録されているロール（{roles.length}件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ロール名</TableHead>
                <TableHead>説明</TableHead>
                <TableHead>権限</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {error ? (
                      <div>
                        <p className="text-red-600 mb-2">{error}</p>
                        <p className="text-sm">データベースの設定を確認してください。</p>
                      </div>
                    ) : (
                      <p>ロールが登録されていません</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="font-medium">{role.role_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {role.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.permissions || {}).map(([module, perms]) => (
                          perms.length > 0 && (
                            <Badge key={module} variant="outline" className="text-xs">
                              {module}: {perms.length}権限
                            </Badge>
                          )
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.is_active ? "default" : "secondary"}>
                        {role.is_active ? '有効' : '無効'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(role.id)}
                          disabled={role.role_name === '管理者'}
                          title={role.role_name === '管理者' ? '管理者ロールは削除できません' : 'ロールを削除'}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* ロール作成・編集フォーム */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingRole ? 'ロールを編集' : 'ロールを作成'}
            </CardTitle>
            <CardDescription>
              {editingRole ? 'ロールの情報を編集できます' : '新しいロールを作成できます'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="role_name">ロール名</Label>
                <Input
                  id="role_name"
                  value={formData.role_name}
                  onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                  placeholder="例: 人事担当"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">説明</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例: 人事業務全般を担当"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="is_active">有効</Label>
              </div>

              {/* 権限設定 */}
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <Label className="text-lg font-semibold text-gray-900">権限設定</Label>
                  <p className="text-sm text-gray-600 mt-1">このロールがアクセスできる機能を選択してください</p>
                </div>
                
                {permissionModules.map((module, index) => {
                  const colors = ['bg-blue-50 border-blue-200', 'bg-green-50 border-green-200', 'bg-purple-50 border-purple-200', 'bg-orange-50 border-orange-200', 'bg-red-50 border-red-200']
                  const colorClass = colors[index % colors.length]
                  
                  return (
                    <div key={module.module} className={`border-2 rounded-xl p-6 ${colorClass}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <h4 className="text-lg font-semibold text-gray-900">{module.label}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={module.permissions.every(perm => 
                              (formData.permissions[module.module] || []).includes(perm.key)
                            )}
                            onChange={(e) => handleSelectAllPermissions(module.module, e.target.checked)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Label className="text-sm font-medium text-gray-700">すべて選択</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {module.permissions.map((permission) => (
                          <div key={permission.key} className="flex items-center space-x-3 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              id={`${module.module}_${permission.key}`}
                              checked={(formData.permissions[module.module] || []).includes(permission.key)}
                              onChange={(e) => handlePermissionChange(module.module, permission.key, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label htmlFor={`${module.module}_${permission.key}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingRole(null)
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  キャンセル
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingRole ? '更新' : '作成'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
