'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  UserPlus,
  Shield,
  Settings,
  Archive
} from 'lucide-react'

const navigation = [
  { name: 'ダッシュボード', href: '/', icon: LayoutDashboard },
  { name: '応募者一覧', href: '/applicants', icon: Users },
  { name: '面接日程', href: '/interviews', icon: Calendar },
  { name: 'データベース', href: '/past-applicants', icon: Archive },
  { name: '集計レポート', href: '/reports', icon: BarChart3 },
]

const recruiterOnlyNavigation = [
  { name: '応募者登録', href: '/applicants/new', icon: UserPlus },
  { name: 'ユーザー管理', href: '/users', icon: Shield },
  { name: 'システム設定', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role } = useAuth()

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
        
        {(role === '採用担当' || role === '管理者') && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            {recruiterOnlyNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}
