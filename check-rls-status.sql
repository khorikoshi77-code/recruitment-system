-- =====================================================
-- RLSとポリシーの状態を確認するSQL
-- =====================================================

-- 1. 各テーブルのRLS有効/無効状態を確認
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'applicants', 
    'users', 
    'roles', 
    'applicant_fields', 
    'display_settings',
    'interviews',
    'reports',
    'dashboard_cards',
    'evaluation_fields'
  )
ORDER BY tablename;

-- 2. 各テーブルに設定されているポリシーを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. 現在のロールと権限を確認
SELECT current_user, current_role;

-- 4. テーブルへの直接アクセス権限を確認
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'applicants', 
    'users', 
    'roles', 
    'applicant_fields', 
    'display_settings'
  )
ORDER BY table_name, grantee;

