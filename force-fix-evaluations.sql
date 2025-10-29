-- =====================================================
-- evaluationsテーブルを強制的に再作成して権限を付与
-- 既存のデータは削除されるので注意！
-- =====================================================

-- 警告: 既存のデータが削除されます
-- 開発環境でのみ実行してください

-- 1. 既存テーブルを削除（存在する場合）
DROP TABLE IF EXISTS evaluation_field_values CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS evaluation_fields CASCADE;

-- 2. テーブルを再作成
CREATE TABLE evaluation_fields (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL,
  overall_rating DECIMAL(3,2) DEFAULT 0,
  strengths TEXT,
  weaknesses TEXT,
  comments TEXT,
  recommendation TEXT DEFAULT '要検討',
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE evaluation_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL REFERENCES evaluation_fields(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evaluation_id, field_id)
);

-- 3. インデックス作成
CREATE INDEX idx_evaluations_applicant_id ON evaluations(applicant_id);
CREATE INDEX idx_evaluation_field_values_evaluation_id ON evaluation_field_values(evaluation_id);
CREATE INDEX idx_evaluation_field_values_field_id ON evaluation_field_values(field_id);
CREATE INDEX idx_evaluation_fields_display_order ON evaluation_fields(display_order);

-- 4. RLSを無効化（重要！）
ALTER TABLE evaluation_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_field_values DISABLE ROW LEVEL SECURITY;

-- 5. 全ロールに完全な権限を付与
GRANT ALL PRIVILEGES ON evaluation_fields TO anon;
GRANT ALL PRIVILEGES ON evaluation_fields TO authenticated;
GRANT ALL PRIVILEGES ON evaluation_fields TO service_role;

GRANT ALL PRIVILEGES ON evaluations TO anon;
GRANT ALL PRIVILEGES ON evaluations TO authenticated;
GRANT ALL PRIVILEGES ON evaluations TO service_role;

GRANT ALL PRIVILEGES ON evaluation_field_values TO anon;
GRANT ALL PRIVILEGES ON evaluation_field_values TO authenticated;
GRANT ALL PRIVILEGES ON evaluation_field_values TO service_role;

-- 6. シーケンスへの権限
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 7. 初期データ挿入
INSERT INTO evaluation_fields (id, name, description, weight, is_required, is_active, display_order)
VALUES 
  ('1', '技術スキル', 'プログラミング技術、フレームワークの理解度、技術的な問題解決能力', 25, true, true, 1),
  ('2', 'コミュニケーション能力', '説明力、質問への回答能力、チームワーク、プレゼンテーション能力', 20, true, true, 2),
  ('3', '問題解決能力', '論理的思考力、課題分析力、解決策の提案力、学習意欲', 20, true, true, 3),
  ('4', '企業文化との適合性', '価値観の一致、働き方への理解、会社への興味・関心', 15, true, true, 4),
  ('5', 'リーダーシップ', 'チームをまとめる力、意思決定力、責任感、影響力', 10, false, true, 5),
  ('6', '学習意欲', '新しい技術への関心、成長志向、自己学習の習慣', 10, true, true, 6);

-- 8. 確認
SELECT 
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%evaluation%'
ORDER BY tablename;

SELECT 'テーブル作成完了！' as status;

