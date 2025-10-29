-- =====================================================
-- RLS（Row Level Security）を無効化する
-- 警告: 本番環境では推奨されません
-- 開発・テスト環境でのみ使用してください
-- =====================================================

-- 注意: このSQLはSupabaseのSQLエディタで実行してください

-- 主要テーブルのRLSを無効化
ALTER TABLE IF EXISTS applicants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applicant_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS display_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dashboard_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluation_fields DISABLE ROW LEVEL SECURITY;

-- 確認用クエリ
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

