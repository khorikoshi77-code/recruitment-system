# Supabase CRUD APIテスト結果

## テスト実行日時
2025年10月29日

## テスト概要
SUPABASE_SERVICE_ROLE_KEYを使用してSupabaseのCRUD操作をテストしました。

## テスト環境
- **Supabase URL**: https://slyedtijjvutaptbisve.supabase.co
- **認証方式**: SERVICE_ROLE_KEY

## テスト結果

### ❌ 全テーブルで権限エラーが発生

```
❌ CREATE失敗
   エラー: permission denied for table applicants (42501)
   ステータス: 403

❌ READ失敗
   エラー: permission denied for table applicants (42501)
   ステータス: 403
```

### 影響を受けるテーブル
- ✗ applicants
- ✗ users
- ✗ roles
- ✗ applicant_fields
- ✗ display_settings

## 原因分析

### 問題点
**Row Level Security (RLS)** が有効になっているが、SERVICE_ROLEに対するポリシーが設定されていないため、アクセスが拒否されています。

### エラーコード
- **42501**: PostgreSQLの権限不足エラー
- **403 Forbidden**: HTTPステータスコード

## 解決方法

### 方法1: RLSポリシーを設定する（推奨）

Supabaseダッシュボードで以下の手順を実施してください：

1. **Supabaseダッシュボード**にログイン
2. **SQL Editor**を開く
3. `fix-rls-policies.sql`の内容を実行

このSQLは、以下のポリシーを設定します：
- SERVICE_ROLEに全テーブルへの完全アクセス権限
- 認証済みユーザーに全テーブルへの完全アクセス権限
- 匿名ユーザーに読み取り権限（applicantsのみ）

```sql
-- 例: applicantsテーブルのポリシー
CREATE POLICY "service_role_all_applicants"
ON applicants
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### 方法2: RLSを無効化する（開発環境のみ）

⚠️ **警告**: 本番環境では推奨されません

開発・テスト環境でのみ使用する場合：

1. **SQL Editor**を開く
2. `disable-rls.sql`の内容を実行

```sql
ALTER TABLE applicants DISABLE ROW LEVEL SECURITY;
```

## 再テスト方法

RLSポリシーを設定後、以下のコマンドで再テストしてください：

```powershell
# PowerShell
$env:NEXT_PUBLIC_SUPABASE_URL="https://slyedtijjvutaptbisve.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
node test-supabase-crud.js
```

## 期待される成功時の出力

```
🚀 Supabase CRUD APIテスト開始

📝 [CREATE] 応募者を作成中...
✅ CREATE成功
   ID: 12345678-1234-1234-1234-123456789abc
   名前: テスト太郎

📖 [READ] 応募者を取得中...
✅ READ成功
   取得件数: 5件

✏️  [UPDATE] 応募者を更新中...
✅ UPDATE成功
   更新後ステータス: 書類通過

🗑️  [DELETE] テストデータを削除中...
✅ DELETE成功

📋 [その他] 各テーブルの存在確認中...
✅ users テーブル: アクセス可能
✅ roles テーブル: アクセス可能
✅ applicant_fields テーブル: アクセス可能
✅ display_settings テーブル: アクセス可能

✨ テスト完了
```

## セキュリティに関する注意事項

### SERVICE_ROLE_KEYの取り扱い

⚠️ **重要**: SERVICE_ROLE_KEYは非常に強力な権限を持ちます

- ✅ サーバーサイドでのみ使用してください
- ✅ 環境変数に保存し、コードにハードコーディングしないでください
- ✅ Gitリポジトリにコミットしないでください（.gitignoreに追加）
- ❌ クライアントサイド（ブラウザ）では絶対に使用しないでください
- ❌ 公開リポジトリには絶対にアップロードしないでください

### RLSの重要性

本番環境では、必ずRLSポリシーを適切に設定してください：

1. **最小権限の原則**: 必要最小限の権限のみを付与
2. **ロール別アクセス制御**: ユーザーロールに応じた権限設定
3. **データの分離**: ユーザーごとのデータアクセス制限

## 次のステップ

1. ✅ `fix-rls-policies.sql`をSupabaseで実行
2. ✅ `test-supabase-crud.js`で再テスト
3. ✅ アプリケーションでCRUD操作が正常に動作することを確認
4. ✅ 本番環境にデプロイ前にRLSポリシーを再確認

## 関連ファイル

- `test-supabase-crud.js` - CRUDテストスクリプト
- `fix-rls-policies.sql` - RLSポリシー設定SQL（推奨）
- `disable-rls.sql` - RLS無効化SQL（開発環境のみ）

## 参考リンク

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

