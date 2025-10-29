-- =====================================================
-- evaluations関連テーブルの権限を確実に付与
-- =====================================================

-- 1. RLSを無効化
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_field_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_fields DISABLE ROW LEVEL SECURITY;

-- 2. 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "service_role_all_evaluations" ON evaluations;
DROP POLICY IF EXISTS "authenticated_all_evaluations" ON evaluations;
DROP POLICY IF EXISTS "anon_read_evaluations" ON evaluations;

DROP POLICY IF EXISTS "service_role_all_evaluation_field_values" ON evaluation_field_values;
DROP POLICY IF EXISTS "authenticated_all_evaluation_field_values" ON evaluation_field_values;
DROP POLICY IF EXISTS "anon_read_evaluation_field_values" ON evaluation_field_values;

DROP POLICY IF EXISTS "service_role_all_evaluation_fields" ON evaluation_fields;
DROP POLICY IF EXISTS "authenticated_all_evaluation_fields" ON evaluation_fields;
DROP POLICY IF EXISTS "anon_read_evaluation_fields" ON evaluation_fields;

-- 3. 全ロールに権限を付与
GRANT ALL ON evaluations TO authenticated;
GRANT ALL ON evaluations TO anon;
GRANT ALL ON evaluations TO service_role;
GRANT ALL ON evaluations TO postgres;

GRANT ALL ON evaluation_field_values TO authenticated;
GRANT ALL ON evaluation_field_values TO anon;
GRANT ALL ON evaluation_field_values TO service_role;
GRANT ALL ON evaluation_field_values TO postgres;

GRANT ALL ON evaluation_fields TO authenticated;
GRANT ALL ON evaluation_fields TO anon;
GRANT ALL ON evaluation_fields TO service_role;
GRANT ALL ON evaluation_fields TO postgres;

-- 4. シーケンスへの権限付与
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- 5. 確認
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'evaluation%'
ORDER BY tablename;

-- 権限確認
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name LIKE 'evaluation%'
ORDER BY table_name, grantee;

