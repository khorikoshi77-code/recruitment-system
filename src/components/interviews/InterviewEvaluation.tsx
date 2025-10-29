'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEvaluation } from '@/contexts/EvaluationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, Save, ArrowLeft, User, Calendar, Briefcase } from 'lucide-react'

interface Applicant {
  id: string
  name: string
  email: string
  position: string
  interview_date: string
  status: string
}

interface EvaluationData {
  technical_skills: number
  communication: number
  problem_solving: number
  cultural_fit: number
  overall_rating: number
  strengths: string
  weaknesses: string
  comments: string
  recommendation: string
}

export function InterviewEvaluation({ applicantId }: { applicantId: string }) {
  const router = useRouter()
  const { fields: evaluationFields, loading: fieldsLoading } = useEvaluation()
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const [evaluation, setEvaluation] = useState<Record<string, any>>({
    strengths: '',
    weaknesses: '',
    comments: '',
    recommendation: ''
  })
  const [overallRating, setOverallRating] = useState(0)

  useEffect(() => {
    fetchApplicant()
  }, [applicantId])

  const fetchApplicant = async () => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('id', applicantId)
        .single()

      if (error) throw error
      setApplicant(data)
    } catch (error) {
      console.error('応募者データの取得エラー:', error)
      setError('応募者データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (fieldId: string, value: number) => {
    const newEvaluation = {
      ...evaluation,
      [fieldId]: value
    }
    setEvaluation(newEvaluation)
    
    // 総合評価を再計算
    const activeFields = evaluationFields.filter(field => field.is_active)
    if (activeFields.length === 0) {
      setOverallRating(0)
      return
    }
    
    let totalWeightedScore = 0
    let totalActiveWeight = 0
    
    // 全有効項目の重み合計を計算
    activeFields.forEach(field => {
      totalActiveWeight += field.weight
    })
    
    // 入力された項目の重み付きスコアを計算
    activeFields.forEach(field => {
      const rating = newEvaluation[field.id]
      if (rating !== undefined && rating > 0) {
        const normalizedWeight = field.weight / 100
        totalWeightedScore += rating * normalizedWeight
      }
    })
    
    if (totalActiveWeight === 0) {
      setOverallRating(0)
    } else {
      // 全有効項目の重み合計（100%）で割る
      const weightedAverage = totalWeightedScore / (totalActiveWeight / 100)
      setOverallRating(weightedAverage) // そのままの値を使用
    }
  }

  const handleTextChange = (field: string, value: string) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateOverallRating = () => {
    // 有効な評価項目のみを対象とする
    const activeFields = evaluationFields.filter(field => field.is_active)
    
    if (activeFields.length === 0) return 0
    
    let totalWeightedScore = 0
    let totalWeight = 0
    
    activeFields.forEach(field => {
      const rating = evaluation[field.id]
      if (rating !== undefined && rating > 0) {
        // 重みを100で割って正規化（25% → 0.25）
        const normalizedWeight = field.weight / 100
        totalWeightedScore += rating * normalizedWeight
        totalWeight += normalizedWeight
      }
    })
    
    if (totalWeight === 0) return 0
    
    const weightedAverage = totalWeightedScore / totalWeight
    return weightedAverage // そのままの値を使用
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      console.log('評価保存開始:', { applicantId, evaluationFields: evaluationFields.length })
      const overallRating = calculateOverallRating()
      console.log('総合評価計算完了:', overallRating)

      // 評価データを保存（evaluationsテーブルに保存）
      // ✅ 採否未選択時は「要検討」を自動設定
      const { data: evaluationResult, error: evalError } = await supabase
        .from('evaluations')
        .upsert({
          applicant_id: applicantId,
          overall_rating: overallRating ?? 3,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          comments: evaluation.comments,
          recommendation: evaluation.recommendation || '要検討',
          evaluated_at: new Date().toISOString()
        })
        .select()

      if (evalError) throw evalError

      // 評価項目の詳細データを一括保存
      const evaluationId = evaluationResult[0].id
      console.log('評価ID取得完了:', evaluationId)
      const activeFields = evaluationFields.filter(field => field.is_active)
      console.log('有効な評価項目数:', activeFields.length)

      const fieldValues = activeFields
        .filter(field => {
          const rating = evaluation[field.id]
          return rating !== undefined && rating > 0
        })
        .map(field => ({
          evaluation_id: evaluationId,
          field_id: field.id,
          rating: evaluation[field.id]
        }))

      if (fieldValues.length > 0) {
        console.log('評価項目データ保存:', fieldValues)
        const { error: fieldError } = await supabase
          .from('evaluation_field_values')
          .upsert(fieldValues)
          .select()

        if (fieldError) {
          console.error('評価項目保存エラー:', fieldError)
          throw fieldError
        }
        console.log('評価項目データ保存完了')
      }

      // 応募者のステータスを更新
      const { error: updateError } = await supabase
        .from('applicants')
        .update({ 
          evaluation: evaluation.comments,
          status: evaluation.recommendation === '採用' ? '内定' : 
                  evaluation.recommendation === '不採用' ? '不採用' : '面接中'
        })
        .eq('id', applicantId)

      if (updateError) throw updateError

      console.log('応募者ステータス更新完了')
      setSuccess('評価が保存されました')
      
      // 3秒後に面接日程ページに遷移
      setTimeout(() => {
        router.push('/interviews')
      }, 2000)

    } catch (error: any) {
      console.error('評価保存エラー詳細:', error)
      const errorMessage = error.message || '評価の保存に失敗しました'
      console.error('エラーメッセージ:', errorMessage)
      setError(errorMessage)
    } finally {
      console.log('保存処理終了 - ローディング状態解除')
      setSaving(false)
    }
  }

  const StarRating = ({ 
    value, 
    onChange, 
    label,
    description,
    required,
    weight
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
    description?: string;
    required?: boolean;
    weight?: number;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label>{label}</Label>
        {required && <span className="text-red-500 text-sm">*</span>}
        {weight && <span className="text-xs text-gray-500">({weight}%)</span>}
      </div>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? 0 : star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
           <span className="ml-2 text-sm text-gray-600">
              {value}/5 ({Math.round((value / 5) * (weight || 1))})
           </span>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Star className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">面接評価</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Star className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">面接評価</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>応募者データが見つかりませんでした</AlertDescription>
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
        <Star className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">面接評価</h1>
      </div>

      {/* 応募者情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>応募者情報</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">名前</Label>
              <p className="text-lg font-medium">{applicant.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">職種</Label>
              <p className="text-lg font-medium">{applicant.position}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">面接日</Label>
              <p className="text-lg font-medium">
                {applicant.interview_date ? new Date(applicant.interview_date).toLocaleDateString('ja-JP') : '未設定'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* 評価フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>面接評価入力</CardTitle>
          <CardDescription>
            各項目を5段階で評価し、詳細なコメントを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 評価項目 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {evaluationFields
                .filter(field => field.is_active)
                .sort((a, b) => a.display_order - b.display_order)
                .map((field) => (
                  <StarRating
                    key={field.id}
                    value={evaluation[field.id] || 0}
                    onChange={(value) => handleRatingChange(field.id, value)}
                    label={field.name}
                    description={field.description}
                    required={field.is_required}
                    weight={field.weight}
                  />
                ))}
            </div>

            {/* 総合評価 */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-4">
                <Label className="text-lg font-medium">総合評価</Label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const roundedRating = parseFloat(overallRating.toFixed(1))
                    const isFilled = star <= Math.floor(roundedRating)
                    const isHalfFilled = star === Math.ceil(roundedRating) && roundedRating % 1 !== 0
                    
                    return (
                      <div key={star} className="relative">
                        <Star
                          className={`h-6 w-6 ${
                            isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                        {isHalfFilled && (
                          <div className="absolute inset-0 overflow-hidden">
                            <Star
                              className="h-6 w-6 text-yellow-400 fill-current"
                              style={{
                                clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <span className="ml-2 text-lg font-medium">
                    {overallRating.toFixed(1)}/5 ({(() => {
                      const activeFields = evaluationFields.filter(field => field.is_active)
                      let totalWeightedScore = 0
                      
                      activeFields.forEach(field => {
                        const rating = evaluation[field.id]
                        if (rating !== undefined && rating > 0) {
                          totalWeightedScore += Math.round((rating / 5) * field.weight)
                        }
                      })
                      
                      return totalWeightedScore
                    })()})
                  </span>
                </div>
              </div>
            </div>

            {/* テキスト入力 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="strengths">強み・良い点</Label>
                <Textarea
                  id="strengths"
                  value={evaluation.strengths}
                  onChange={(e) => handleTextChange('strengths', e.target.value)}
                  placeholder="応募者の強みや良い点を具体的に記入してください"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="weaknesses">改善点・課題</Label>
                <Textarea
                  id="weaknesses"
                  value={evaluation.weaknesses}
                  onChange={(e) => handleTextChange('weaknesses', e.target.value)}
                  placeholder="改善が必要な点や課題を具体的に記入してください"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="comments">総合コメント</Label>
                <Textarea
                  id="comments"
                  value={evaluation.comments}
                  onChange={(e) => handleTextChange('comments', e.target.value)}
                  placeholder="面接全体を通しての総合的な評価やコメントを記入してください"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="recommendation">採用推奨</Label>
                <Select
                  value={evaluation.recommendation}
                  onValueChange={(value) => handleTextChange('recommendation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="採用推奨を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="採用">採用</SelectItem>
                    <SelectItem value="不採用">不採用</SelectItem>
                    <SelectItem value="要検討">要検討</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex space-x-4 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : '評価を保存'}
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
