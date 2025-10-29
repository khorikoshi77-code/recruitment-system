-- =====================================================
-- status_settingsテーブルの存在確認とRLS設定確認
-- =====================================================

-- 1. テーブルの存在確認
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'status_settings'
) AS table_exists;

-- 2. RLS設定の確認
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'status_settings';

-- 3. テーブルが存在する場合、構造を確認
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'status_settings'
ORDER BY ordinal_position;

-- 4. RLSポリシーの確認
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'status_settings';

-- =====================================================
-- status_settingsテーブルが存在する場合の権限修正
-- =====================================================

-- RLSを無効化（開発環境用）
ALTER TABLE IF EXISTS status_settings DISABLE ROW LEVEL SECURITY;

-- 全ロールに権限を付与
GRANT ALL ON status_settings TO authenticated;
GRANT ALL ON status_settings TO anon;
GRANT ALL ON status_settings TO service_role;

-- 確認
SELECT 'status_settingsテーブルの権限設定を完了しました' AS message;
