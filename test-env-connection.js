/**
 * 環境変数とSupabase接続のテスト
 */

console.log('=== 環境変数の確認 ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未設定');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 設定済み' : '❌ 未設定');
console.log('');

// ブラウザ環境のシミュレーション
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('✅ ブラウザ用設定: 正常');
} else {
  console.log('❌ ブラウザ用設定: 不足');
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ サーバー用設定: 正常');
} else {
  console.log('⚠️  サーバー用設定: 未設定（CRUD操作に制限あり）');
}

