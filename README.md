# 採用システム

応募〜内定までの採用業務を一元管理する社内向けWebアプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS
- **UIライブラリ**: Shadcn/UI, Lucide Icons
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **グラフ**: Recharts
- **日付処理**: date-fns

## 機能

### 採用担当
- 応募者一覧表示・検索・絞り込み
- 応募者登録・編集・削除
- ステータス管理（応募→書類通過→面接中→内定→辞退）
- 評価・コメント入力
- 面接日程管理
- 集計レポート・CSV出力

### 面接官
- 応募者情報の閲覧
- 評価・コメント入力
- 面接日程の確認

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Supabaseデータベースの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase-schema.sql`の内容をSupabaseのSQLエディタで実行
3. 環境変数にSupabaseのURLとキーを設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## データベーススキーマ

### applicants テーブル
- id: UUID (主キー)
- name: 氏名
- email: メールアドレス
- phone: 電話番号
- position: 応募職種
- status: ステータス（応募/書類通過/面接中/内定/辞退）
- evaluation: 評価
- comment: コメント・備考
- interview_date: 面接予定日
- created_at: 登録日時
- updated_at: 更新日時

### users テーブル
- id: UUID (主キー)
- email: メールアドレス
- role: ロール（採用担当/面接官）
- created_at: 登録日時
- updated_at: 更新日時

## デプロイ

### Vercelでのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ実行

## ライセンス

このプロジェクトは社内利用目的で作成されています。