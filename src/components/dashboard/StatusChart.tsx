'use client'

import { Applicant } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface StatusChartProps {
  applicants: Applicant[]
}

export function StatusChart({ applicants }: StatusChartProps) {
  const statusCounts = applicants.reduce((acc, applicant) => {
    acc[applicant.status] = (acc[applicant.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const data = [
    { name: '応募', value: statusCounts['応募'] || 0, color: '#3B82F6' },
    { name: '書類通過', value: statusCounts['書類通過'] || 0, color: '#10B981' },
    { name: '面接中', value: statusCounts['面接中'] || 0, color: '#F59E0B' },
    { name: '内定', value: statusCounts['内定'] || 0, color: '#8B5CF6' },
    { name: '辞退', value: statusCounts['辞退'] || 0, color: '#EF4444' },
  ].filter(item => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            人数: {payload[0].value}人
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ステータス別応募者数</CardTitle>
        <CardDescription>
          応募者の現在のステータス分布
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            データがありません
          </div>
        )}
      </CardContent>
    </Card>
  )
}
