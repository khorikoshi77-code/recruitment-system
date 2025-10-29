'use client'

import { Applicant } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface RecentUpdatesProps {
  applicants: Applicant[]
}

const statusColors = {
  '応募': 'bg-blue-100 text-blue-800',
  '書類通過': 'bg-green-100 text-green-800',
  '面接中': 'bg-yellow-100 text-yellow-800',
  '内定': 'bg-purple-100 text-purple-800',
  '辞退': 'bg-red-100 text-red-800',
}

export function RecentUpdates({ applicants }: RecentUpdatesProps) {
  const recentApplicants = applicants.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近の更新</CardTitle>
        <CardDescription>
          最新の応募者情報更新
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentApplicants.length > 0 ? (
          <div className="space-y-4">
            {recentApplicants.map((applicant) => (
              <div key={applicant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{applicant.name}</h4>
                    <Badge 
                      className={statusColors[applicant.status as keyof typeof statusColors]}
                    >
                      {applicant.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{applicant.position}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {applicant.updated_at ? format(new Date(applicant.updated_at), 'yyyy年MM月dd日 HH:mm', { locale: ja }) : '日付なし'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            最近の更新はありません
          </div>
        )}
      </CardContent>
    </Card>
  )
}
