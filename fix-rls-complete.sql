-- =====================================================
-- RLS問題を完全に解決するSQL
-- SERVICE_ROLE_KEYでアクセス可能にする
-- =====================================================

-- ステップ1: 全テーブルのRLSを一旦無効化
ALTER TABLE IF EXISTS applicants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applicant_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS display_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dashboard_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluation_fields DISABLE ROW LEVEL SECURITY;

-- ステップ2: authenticatedロールとanonロールに直接権限を付与
-- applicants テーブル
GRANT ALL ON applicants TO authenticated;
GRANT ALL ON applicants TO anon;
GRANT ALL ON applicants TO service_role;

-- users テーブル
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;
GRANT ALL ON users TO service_role;

-- roles テーブル
GRANT ALL ON roles TO authenticated;
GRANT ALL ON roles TO anon;
GRANT ALL ON roles TO service_role;

-- applicant_fields テーブル
GRANT ALL ON applicant_fields TO authenticated;
GRANT ALL ON applicant_fields TO anon;
GRANT ALL ON applicant_fields TO service_role;

-- display_settings テーブル
GRANT ALL ON display_settings TO authenticated;
GRANT ALL ON display_settings TO anon;
GRANT ALL ON display_settings TO service_role;

-- interviews テーブル（存在する場合）
GRANT ALL ON interviews TO authenticated;
GRANT ALL ON interviews TO anon;
GRANT ALL ON interviews TO service_role;

-- reports テーブル（存在する場合）
GRANT ALL ON reports TO authenticated;
GRANT ALL ON reports TO anon;
GRANT ALL ON reports TO service_role;

-- dashboard_cards テーブル（存在する場合）
GRANT ALL ON dashboard_cards TO authenticated;
GRANT ALL ON dashboard_cards TO anon;
GRANT ALL ON dashboard_cards TO service_role;

-- evaluation_fields テーブル（存在する場合）
GRANT ALL ON evaluation_fields TO authenticated;
GRANT ALL ON evaluation_fields TO anon;
GRANT ALL ON evaluation_fields TO service_role;

-- ステップ3: シーケンス（ID自動採番）への権限も付与
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 確認用クエリ
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

