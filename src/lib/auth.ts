import { supabase } from './supabase'
import { User } from './supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserRole(userId: string): Promise<string | null> {
  // まずIDで検索
  let { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  
  // IDで見つからない場合は、メールアドレスで検索
  if (error) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      const { data: emailData, error: emailError } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()
      
      if (emailError) return null
      return emailData.role
    }
  }
  
  if (error) return null
  return data?.role || null
}

export async function createUser(email: string, password: string, role: '採用担当' | '面接官') {
  // 認証ユーザーを作成
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
      data: {
        role: role
      }
    }
  })
  
  if (authError) {
    console.error('サインアップエラー:', authError)
    throw new Error(authError.message || 'ユーザー作成に失敗しました')
  }
  
  if (!authData.user) throw new Error('ユーザー作成に失敗しました')
  
  // ユーザー情報をusersテーブルに追加
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      role,
    })
  
  if (userError) {
    console.error('usersテーブル挿入エラー:', userError)
    throw userError
  }
  
  return authData.user
}
