-- =====================================================
-- 評価関連テーブルの作成
-- evaluations と evaluation_field_values テーブル
-- =====================================================

-- 1. evaluations テーブル（面接評価のメインテーブル）
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  overall_rating DECIMAL(3,2) DEFAULT 0,
  strengths TEXT,
  weaknesses TEXT,
  comments TEXT,
  recommendation TEXT DEFAULT '要検討',
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(applicant_id)
);

-- 2. evaluation_field_values テーブル（評価項目の詳細値）
CREATE TABLE IF NOT EXISTS evaluation_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evaluation_id, field_id)
);

-- 3. evaluation_fields テーブル（評価項目マスタ）
CREATE TABLE IF NOT EXISTS evaluation_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_evaluations_applicant_id ON evaluations(applicant_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_field_values_evaluation_id ON evaluation_field_values(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_field_values_field_id ON evaluation_field_values(field_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_fields_display_order ON evaluation_fields(display_order);

-- 5. RLSを無効化して全ロールに権限を付与
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_field_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_fields DISABLE ROW LEVEL SECURITY;

GRANT ALL ON evaluations TO authenticated;
GRANT ALL ON evaluations TO anon;
GRANT ALL ON evaluations TO service_role;

GRANT ALL ON evaluation_field_values TO authenticated;
GRANT ALL ON evaluation_field_values TO anon;
GRANT ALL ON evaluation_field_values TO service_role;

GRANT ALL ON evaluation_fields TO authenticated;
GRANT ALL ON evaluation_fields TO anon;
GRANT ALL ON evaluation_fields TO service_role;

-- 6. 初期データの挿入（評価項目マスタ）
INSERT INTO evaluation_fields (id, name, description, weight, is_required, is_active, display_order)
VALUES 
  ('1', '技術スキル', 'プログラミング技術、フレームワークの理解度、技術的な問題解決能力', 25, true, true, 1),
  ('2', 'コミュニケーション能力', '説明力、質問への回答能力、チームワーク、プレゼンテーション能力', 20, true, true, 2),
  ('3', '問題解決能力', '論理的思考力、課題分析力、解決策の提案力、学習意欲', 20, true, true, 3),
  ('4', '企業文化との適合性', '価値観の一致、働き方への理解、会社への興味・関心', 15, true, true, 4),
  ('5', 'リーダーシップ', 'チームをまとめる力、意思決定力、責任感、影響力', 10, false, true, 5),
  ('6', '学習意欲', '新しい技術への関心、成長志向、自己学習の習慣', 10, true, true, 6)
ON CONFLICT (id) DO NOTHING;

-- 7. シーケンスへの権限付与
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 確認用クエリ
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('evaluations', 'evaluation_field_values', 'evaluation_fields')
ORDER BY tablename;

-- 作成されたテーブルの確認
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('evaluations', 'evaluation_field_values', 'evaluation_fields')
ORDER BY table_name, ordinal_position;

