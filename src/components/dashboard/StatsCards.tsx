'use client'

import { Applicant } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, Clock } from 'lucide-react'

interface StatsCardsProps {
  applicants: Applicant[]
}

export function StatsCards({ applicants }: StatsCardsProps) {
  const stats = {
    total: applicants.length,
    applied: applicants.filter(a => a.status === '応募').length,
    passed: applicants.filter(a => a.status === '書類通過').length,
    interviewing: applicants.filter(a => a.status === '面接中').length,
    offered: applicants.filter(a => a.status === '内定').length,
    declined: applicants.filter(a => a.status === '辞退').length,
  }

  const cards = [
    {
      title: '総応募者数',
      value: stats.total,
      icon: Users,
      description: '全応募者数',
      color: 'text-blue-600',
    },
    {
      title: '書類通過',
      value: stats.passed,
      icon: UserCheck,
      description: `${stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% 通過率`,
      color: 'text-green-600',
    },
    {
      title: '面接中',
      value: stats.interviewing,
      icon: Clock,
      description: '現在面接中',
      color: 'text-yellow-600',
    },
    {
      title: '内定者数',
      value: stats.offered,
      icon: UserCheck,
      description: `${stats.total > 0 ? Math.round((stats.offered / stats.total) * 100) : 0}% 内定率`,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-gray-500 mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
