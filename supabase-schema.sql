-- 採用システム データベーススキーマ

-- ロールテーブル
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT '管理者',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 応募者テーブル
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT '応募' CHECK (status IN ('応募', '書類通過', '面接中', '内定', '辞退')),
  evaluation TEXT,
  comment TEXT,
  interview_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_applicants_status ON applicants(status);
CREATE INDEX idx_applicants_position ON applicants(position);
CREATE INDEX idx_applicants_created_at ON applicants(created_at);
-- 既存テーブルのインデックス（スキップ）

-- RLS（Row Level Security）設定
-- 既存テーブルのRLS（スキップ）
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- 既存テーブルのRLSポリシー（スキップ）

-- 採用担当と管理者は全応募者にアクセス可能
CREATE POLICY "Recruiters and admins can access all applicants" ON applicants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('採用担当', '管理者')
    )
  );

-- 面接官は応募者の閲覧と評価入力のみ可能
CREATE POLICY "Interviewers can view and update applicants" ON applicants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('採用担当', '面接官', '管理者')
    )
  );

CREATE POLICY "Interviewers can update evaluation" ON applicants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('採用担当', '面接官', '管理者')
    )
  );

-- 更新日時自動更新のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- システム設定テーブル
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 応募者項目設定テーブル
CREATE TABLE applicant_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key VARCHAR(50) UNIQUE NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('text', 'email', 'tel', 'select', 'textarea', 'date')),
  is_required BOOLEAN DEFAULT false,
  is_displayed BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  options JSONB, -- 選択肢の場合のオプション
  validation_rules JSONB, -- バリデーションルール
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ステータス設定テーブル
CREATE TABLE status_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key VARCHAR(20) UNIQUE NOT NULL,
  status_name VARCHAR(50) NOT NULL,
  status_color VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表示設定テーブル
CREATE TABLE display_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name VARCHAR(50) NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 権限設定テーブル
CREATE TABLE permission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ダッシュボードカードテーブル
CREATE TABLE dashboard_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_key VARCHAR(50) UNIQUE NOT NULL,
  card_name VARCHAR(100) NOT NULL,
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('number', 'chart', 'list', 'progress')),
  card_icon VARCHAR(50),
  card_color VARCHAR(20) NOT NULL,
  data_source VARCHAR(50) NOT NULL,
  data_query JSONB,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_applicant_fields_display_order ON applicant_fields(display_order);
CREATE INDEX idx_status_settings_display_order ON status_settings(display_order);
CREATE INDEX idx_dashboard_cards_display_order ON dashboard_cards(display_order);
CREATE INDEX idx_dashboard_cards_is_active ON dashboard_cards(is_active);
CREATE INDEX idx_display_settings_page_name ON display_settings(page_name);
CREATE INDEX idx_permission_settings_role ON permission_settings(role);

-- RLS設定
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_cards ENABLE ROW LEVEL SECURITY;

-- 採用担当のみアクセス可能
CREATE POLICY "Recruiters can access system_settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = '採用担当'
    )
  );

CREATE POLICY "Recruiters can access applicant_fields" ON applicant_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = '採用担当'
    )
  );

CREATE POLICY "Recruiters can access status_settings" ON status_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = '採用担当'
    )
  );

CREATE POLICY "Recruiters can access display_settings" ON display_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = '採用担当'
    )
  );

CREATE POLICY "Recruiters can access permission_settings" ON permission_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = '採用担当'
    )
  );

CREATE POLICY "Recruiters can access dashboard_cards" ON dashboard_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = '採用担当'
    )
  );

-- 更新日時自動更新のトリガー
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_fields_updated_at BEFORE UPDATE ON applicant_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_status_settings_updated_at BEFORE UPDATE ON status_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_display_settings_updated_at BEFORE UPDATE ON display_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_settings_updated_at BEFORE UPDATE ON permission_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_cards_updated_at BEFORE UPDATE ON dashboard_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データの挿入
INSERT INTO applicant_fields (field_key, field_name, field_type, is_required, is_displayed, display_order) VALUES
('name', '名前', 'text', true, true, 1),
('email', 'メールアドレス', 'email', true, true, 2),
('phone', '電話番号', 'tel', false, true, 3),
('position', '応募職種', 'text', true, true, 4),
('evaluation', '評価', 'textarea', false, true, 5),
('comment', 'コメント', 'textarea', false, true, 6),
('interview_date', '面接予定日', 'date', false, true, 7);

INSERT INTO status_settings (status_key, status_name, status_color, display_order) VALUES
('応募', '応募', 'blue', 1),
('書類通過', '書類通過', 'green', 2),
('面接中', '面接中', 'yellow', 3),
('内定', '内定', 'purple', 4),
('辞退', '辞退', 'red', 5);

INSERT INTO system_settings (key, value, description) VALUES
('app_name', '"採用システム"', 'アプリケーション名'),
('app_version', '"1.0.0"', 'アプリケーションバージョン'),
('max_file_size', '10485760', '最大ファイルサイズ（バイト）'),
('enable_notifications', 'true', '通知機能の有効/無効');

INSERT INTO display_settings (page_name, settings) VALUES
('applicant_list', '{"columns": ["name", "email", "position", "status", "created_at"], "items_per_page": 20}'),
('applicant_detail', '{"sections": ["basic_info", "status_evaluation", "interview_schedule"]}'),
('dashboard', '{"cards": ["total_applicants", "passed_rate", "interviewing_count", "offered_count"]}');

INSERT INTO permission_settings (role, permissions) VALUES
('採用担当', '{"applicants": ["create", "read", "update", "delete"], "users": ["create", "read", "update", "delete"], "settings": ["read", "update"], "reports": ["read", "export"]}'),
('面接官', '{"applicants": ["read", "update_evaluation"], "users": [], "settings": [], "reports": ["read"]}');

-- 既存テーブルの初期データ（スキップ）

-- ダッシュボードカードの初期データ
INSERT INTO dashboard_cards (card_key, card_name, card_type, card_icon, card_color, data_source, data_query, display_order, is_custom) VALUES
('total_applicants', '総応募者数', 'number', 'Users', 'blue', 'applicants', '{"count": true}', 1, false),
('passed_rate', '書類通過率', 'number', 'TrendingUp', 'green', 'applicants', '{"status": "書類通過", "percentage": true}', 2, false),
('interviewing_count', '面接中', 'number', 'Clock', 'yellow', 'applicants', '{"status": "面接中", "count": true}', 3, false),
('offered_count', '内定者数', 'number', 'UserCheck', 'purple', 'applicants', '{"status": "内定", "count": true}', 4, false),
('declined_count', '辞退者数', 'number', 'X', 'red', 'applicants', '{"status": "辞退", "count": true}', 5, false),
('recent_applicants', '最近の応募者', 'list', 'BarChart3', 'indigo', 'applicants', '{"limit": 5, "order": "created_at DESC"}', 6, false);

-- updated_at トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルに updated_at トリガーを設定
-- 既存テーブルのトリガー（スキップ）

-- 既存のトリガー（スキップ）