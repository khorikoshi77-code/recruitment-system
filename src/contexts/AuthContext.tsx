'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserRole } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  role: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期認証状態を取得
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          // データベースアクセスを試行
          try {
            const { data, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single()
            
            if (data) {
              setRole(data.role)
            }
          } catch (dbError) {
            console.warn('データベースアクセスエラー:', dbError)
            // エラー時はロールを設定しない
          }
        }
      } catch (error) {
        console.error('認証セッション取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user)
            // データベースアクセスを試行
            try {
              const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single()
              
              if (data) {
                setRole(data.role)
              }
            } catch (dbError) {
              console.warn('データベースアクセスエラー:', dbError)
              // エラー時はロールを設定しない
            }
          } else {
            setUser(null)
            setRole(null)
          }
        } catch (error) {
          console.error('認証状態変更エラー:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
