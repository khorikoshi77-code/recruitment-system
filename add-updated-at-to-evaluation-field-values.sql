-- =====================================================
-- evaluation_field_valuesテーブルにupdated_atカラムを追加
-- =====================================================

-- 1. カラムの存在確認
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'evaluation_field_values'
ORDER BY ordinal_position;

-- 2. updated_atカラムを追加（既に存在する場合はスキップ）
ALTER TABLE evaluation_field_values
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. 既存データのupdated_atを現在時刻で初期化
UPDATE evaluation_field_values
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- 4. 確認
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'evaluation_field_values'
ORDER BY ordinal_position;

-- =====================================================
-- 完了メッセージ
-- =====================================================
SELECT '✅ evaluation_field_valuesテーブルにupdated_atカラムを追加しました' AS message;
