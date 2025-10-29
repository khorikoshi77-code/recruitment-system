-- =====================================================
-- Supabase RLS（Row Level Security）ポリシー設定
-- SERVICE_ROLE_KEYでCRUD操作を可能にする設定
-- =====================================================

-- 注意: このSQLはSupabaseのSQLエディタで実行してください

-- =====================================================
-- 1. applicants テーブルのRLSポリシー
-- =====================================================

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "service_role_all_applicants" ON applicants;
DROP POLICY IF EXISTS "anon_read_applicants" ON applicants;
DROP POLICY IF EXISTS "authenticated_all_applicants" ON applicants;

-- SERVICE_ROLEに完全アクセス権限を付与
CREATE POLICY "service_role_all_applicants"
ON applicants
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 認証済みユーザーに完全アクセス権限を付与
CREATE POLICY "authenticated_all_applicants"
ON applicants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 匿名ユーザーに読み取り権限を付与（公開ページ用）
CREATE POLICY "anon_read_applicants"
ON applicants
FOR SELECT
TO anon
USING (true);

-- =====================================================
-- 2. users テーブルのRLSポリシー
-- =====================================================

DROP POLICY IF EXISTS "service_role_all_users" ON users;
DROP POLICY IF EXISTS "authenticated_all_users" ON users;

CREATE POLICY "service_role_all_users"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_users"
ON users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. roles テーブルのRLSポリシー
-- =====================================================

DROP POLICY IF EXISTS "service_role_all_roles" ON roles;
DROP POLICY IF EXISTS "authenticated_all_roles" ON roles;

CREATE POLICY "service_role_all_roles"
ON roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_roles"
ON roles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 4. applicant_fields テーブルのRLSポリシー
-- =====================================================

DROP POLICY IF EXISTS "service_role_all_applicant_fields" ON applicant_fields;
DROP POLICY IF EXISTS "authenticated_all_applicant_fields" ON applicant_fields;

CREATE POLICY "service_role_all_applicant_fields"
ON applicant_fields
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_applicant_fields"
ON applicant_fields
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 5. display_settings テーブルのRLSポリシー
-- =====================================================

DROP POLICY IF EXISTS "service_role_all_display_settings" ON display_settings;
DROP POLICY IF EXISTS "authenticated_all_display_settings" ON display_settings;

CREATE POLICY "service_role_all_display_settings"
ON display_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_display_settings"
ON display_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 6. interviews テーブルのRLSポリシー（存在する場合）
-- =====================================================

DROP POLICY IF EXISTS "service_role_all_interviews" ON interviews;
DROP POLICY IF EXISTS "authenticated_all_interviews" ON interviews;

CREATE POLICY "service_role_all_interviews"
ON interviews
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_interviews"
ON interviews
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 7. reports テーブルのRLSポリシー（存在する場合）
-- =====================================================

DROP POLICY IF EXISTS "service_role_all_reports" ON reports;
DROP POLICY IF EXISTS "authenticated_all_reports" ON reports;

CREATE POLICY "service_role_all_reports"
ON reports
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_reports"
ON reports
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 8. dashboard_cards テーブルのRLSポリシー（存在する場合）
-- =====================================================

DROP POLICY IF EXISTS "service_role_all_dashboard_cards" ON dashboard_cards;
DROP POLICY IF EXISTS "authenticated_all_dashboard_cards" ON dashboard_cards;

CREATE POLICY "service_role_all_dashboard_cards"
ON dashboard_cards
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_dashboard_cards"
ON dashboard_cards
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 9. evaluation_fields テーブルのRLSポリシー（存在する場合）
-- =====================================================

DROP POLICY IF EXISTS "service_role_all_evaluation_fields" ON evaluation_fields;
DROP POLICY IF EXISTS "authenticated_all_evaluation_fields" ON evaluation_fields;

CREATE POLICY "service_role_all_evaluation_fields"
ON evaluation_fields
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_evaluation_fields"
ON evaluation_fields
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 確認用クエリ
-- =====================================================

-- 各テーブルのRLS状態を確認
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 各テーブルのポリシーを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

