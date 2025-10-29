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
  console.log('📝 ユーザー作成開始:', email)

  // メールアドレスの重複チェック
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    console.error('❌ メールアドレスが既に登録されています:', email)
    throw new Error('このメールアドレスは既に登録されています')
  }

  if (checkError) {
    console.warn('⚠️  メールアドレスチェック中にエラー:', checkError)
    // チェックエラーの場合は続行（重複チェックできなかっただけ）
  }

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

  console.log('📝 Supabase auth.signUp レスポンス:', {
    user: authData?.user?.id,
    error: authError?.message,
    session: authData?.session ? 'あり' : 'なし'
  })

  if (authError) {
    console.error('❌ サインアップエラー:', authError)

    // エラーメッセージを日本語に変換
    let errorMessage = 'ユーザー作成に失敗しました'

    if (authError.message.includes('invalid') && authError.message.includes('email')) {
      errorMessage = '無効なメールアドレスです。実際に使用可能なメールアドレスを入力してください'
    } else if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
      errorMessage = 'このメールアドレスは既に登録されています'
    } else if (authError.message.includes('password')) {
      errorMessage = 'パスワードが要件を満たしていません'
    } else if (authError.message) {
      errorMessage = authError.message
    }

    throw new Error(errorMessage)
  }

  if (!authData.user) {
    console.error('❌ authData.user が null です')
    throw new Error('ユーザー作成に失敗しました')
  }

  console.log('✅ 認証ユーザー作成成功:', authData.user.id)

  // ユーザー情報をusersテーブルに追加（タイムアウト付き）
  console.log('📝 usersテーブルにデータを挿入中...')

  try {
    // タイムアウト処理を追加（10秒）
    console.log('📝 UPSERT データ:', { id: authData.user.id, email, role })

    const upsertPromise = supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email,
        role,
      }, {
        onConflict: 'id'
      })

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('usersテーブルへのupsertがタイムアウトしました（10秒）')), 10000)
    })

    const { error: userError } = await Promise.race([upsertPromise, timeoutPromise]) as any

    if (userError) {
      console.error('❌ usersテーブルupsertエラー:', userError)
      console.error('❌ エラーコード:', userError.code)
      console.error('❌ エラー詳細:', userError.details)
      console.error('❌ エラーヒント:', userError.hint)
      throw new Error('ユーザー情報の登録に失敗しました: ' + userError.message)
    }

    console.log('✅ usersテーブルへのupsert成功')
    console.log('🎉 ユーザー作成完了:', authData.user.id)

    return authData.user
  } catch (error: any) {
    console.error('❌ usersテーブルupsert処理でエラー:', error)

    // タイムアウトエラーの場合は、ユーザーは作成されているので特別な処理
    if (error.message.includes('タイムアウト')) {
      console.warn('⚠️  タイムアウトしましたが、認証ユーザーは作成されています')
      console.warn('⚠️  usersテーブルへのupsertは手動で行う必要があるかもしれません')
    }

    throw error
  }
}
