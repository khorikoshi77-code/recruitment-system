-- =====================================================
-- evaluationsテーブルの存在と構造を確認
-- =====================================================

-- 1. テーブルの存在確認
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%evaluation%'
ORDER BY table_name;

-- 2. テーブルのカラム構造確認
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name LIKE '%evaluation%'
ORDER BY table_name, ordinal_position;

-- 3. RLS状態の確認
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%evaluation%'
ORDER BY tablename;

-- 4. 権限の確認
SELECT 
    grantee, 
    table_schema,
    table_name, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name LIKE '%evaluation%'
ORDER BY table_name, grantee, privilege_type;

-- 5. 現在のロール確認
SELECT current_user, current_role, session_user;

-- 6. テーブルのオーナー確認
SELECT 
    t.tablename,
    t.tableowner
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename LIKE '%evaluation%'
ORDER BY t.tablename;

