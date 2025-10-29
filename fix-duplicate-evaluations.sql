-- =====================================================
-- 重複評価データの確認と削除、UNIQUE制約の追加
-- =====================================================

-- 1. 重複データの確認
SELECT
    applicant_id,
    COUNT(*) as evaluation_count
FROM evaluations
GROUP BY applicant_id
HAVING COUNT(*) > 1
ORDER BY evaluation_count DESC;

-- 2. 各応募者の最新評価以外を削除（バックアップ用に確認）
WITH ranked_evaluations AS (
    SELECT
        id,
        applicant_id,
        evaluated_at,
        ROW_NUMBER() OVER (PARTITION BY applicant_id ORDER BY evaluated_at DESC) as rn
    FROM evaluations
)
SELECT
    id,
    applicant_id,
    evaluated_at,
    rn
FROM ranked_evaluations
WHERE rn > 1
ORDER BY applicant_id, evaluated_at DESC;

-- 3. 最新評価以外を削除（実行前に上記で確認すること！）
-- ⚠️ この操作は取り消せません！実行前に確認してください
DELETE FROM evaluations
WHERE id IN (
    WITH ranked_evaluations AS (
        SELECT
            id,
            applicant_id,
            evaluated_at,
            ROW_NUMBER() OVER (PARTITION BY applicant_id ORDER BY evaluated_at DESC) as rn
        FROM evaluations
    )
    SELECT id
    FROM ranked_evaluations
    WHERE rn > 1
);

-- 4. UNIQUE制約を追加
ALTER TABLE evaluations
ADD CONSTRAINT evaluations_applicant_id_unique
UNIQUE (applicant_id);

-- 5. 確認
SELECT
    applicant_id,
    COUNT(*) as evaluation_count
FROM evaluations
GROUP BY applicant_id
ORDER BY evaluation_count DESC;

-- =====================================================
-- 完了メッセージ
-- =====================================================
SELECT '✅ 重複評価データを削除し、UNIQUE制約を追加しました' AS message;
