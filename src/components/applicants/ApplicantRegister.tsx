'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, ApplicantField } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, UserPlus } from 'lucide-react'

export function ApplicantRegister() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fields, setFields] = useState<ApplicantField[]>([])
  const [fieldsLoading, setFieldsLoading] = useState(true)

  // フォーム状態
  const [formData, setFormData] = useState<Record<string, string>>({
    status: '応募'
  })

  useEffect(() => {
    fetchFields()
  }, [])

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('applicant_fields')
        .select('*')
        .eq('is_displayed', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('項目データの取得エラー:', error)
        // テーブルが存在しない場合はデフォルト項目を表示
        if (error.code === 'PGRST116') {
          console.log('テーブルが存在しません。デフォルト項目を表示します。')
        }
        setFields([
          {
            id: '1',
            field_key: 'name',
            field_name: '名前',
            field_type: 'text',
            is_required: true,
            is_displayed: true,
            display_order: 1,
            options: null,
            validation_rules: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            field_key: 'email',
            field_name: 'メールアドレス',
            field_type: 'email',
            is_required: true,
            is_displayed: true,
            display_order: 2,
            options: null,
            validation_rules: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            field_key: 'position',
            field_name: '応募職種',
            field_type: 'text',
            is_required: true,
            is_displayed: true,
            display_order: 3,
            options: null,
            validation_rules: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        return
      }
      setFields(data || [])
    } catch (error: any) {
      console.error('項目データの取得に失敗しました:', error)
      setFields([])
    } finally {
      setFieldsLoading(false)
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
      // 必須項目のバリデーション
      const requiredFields = fields.filter(field => field.is_required)
      const missingFields = requiredFields.filter(field => !formData[field.field_key])
      
      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(field => field.field_name).join('、')
        throw new Error(`${fieldNames}は必須項目です`)
      }

      // メールアドレスの重複チェック（emailフィールドがある場合のみ）
      const emailField = fields.find(field => field.field_key === 'email')
      if (emailField && formData.email) {
        const { data: existingApplicant } = await supabase
          .from('applicants')
          .select('id')
          .eq('email', formData.email)
          .single()

        if (existingApplicant) {
          throw new Error('このメールアドレスは既に登録されています')
        }
      }

      // 応募者データを登録（動的フィールド）
      const applicantData: Record<string, any> = {
        status: formData.status
      }
      
      fields.forEach(field => {
        if (formData[field.field_key]) {
          applicantData[field.field_key] = formData[field.field_key]
        }
      })

      const { error } = await supabase
        .from('applicants')
        .insert(applicantData)

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('データベースのテーブルが存在しません。管理者にお問い合わせください。')
        }
        throw error
      }

      setSuccess('応募者の登録が完了しました')
      
      // 3秒後に応募者一覧に遷移
      setTimeout(() => {
        router.push('/applicants')
      }, 2000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <UserPlus className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">応募者登録</h1>
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
          <CardTitle>応募者情報入力</CardTitle>
          <CardDescription>
            新規応募者の情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fieldsLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.field_key}>
                      {field.field_name}
                      {field.is_required && <span className="text-red-500"> *</span>}
                    </Label>
                    {field.field_type === 'textarea' ? (
                      <Textarea
                        id={field.field_key}
                        value={formData[field.field_key] || ''}
                        onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                        placeholder={`${field.field_name}を入力してください`}
                        rows={4}
                        required={field.is_required}
                      />
                    ) : field.field_type === 'select' ? (
                      <select
                        id={field.field_key}
                        value={formData[field.field_key] || ''}
                        onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required={field.is_required}
                      >
                        <option value="">選択してください</option>
                        {field.options && Object.entries(field.options).map(([key, value]) => (
                          <option key={key} value={key}>{String(value)}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.field_key}
                        type={field.field_type === 'email' ? 'email' : field.field_type === 'tel' ? 'tel' : 'text'}
                        value={formData[field.field_key] || ''}
                        onChange={(e) => handleInputChange(field.field_key, e.target.value)}
                        placeholder={`${field.field_name}を入力してください`}
                        required={field.is_required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? '登録中...' : '登録'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
