/**
 * usersテーブルのスキーマを確認
 */

const https = require('https');

const SUPABASE_URL = 'https://slyedtijjvutaptbisve.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNseWVkdGlqanZ1dGFwdGJpc3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTQwNDYsImV4cCI6MjA3NjE3MDA0Nn0.TFC-ySwoiDEMJsvIjjAVFi-0PJuaskcwMYczHfco1l4';

const API_BASE = SUPABASE_URL.replace('https://', '').replace('http://', '');

function checkTable(tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: `/rest/v1/${tableName}?select=*&limit=1`,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`\n✅ ${tableName} テーブル構造:`);
            if (data.length > 0) {
              console.log('カラム:', Object.keys(data[0]).join(', '));
              console.log('サンプルデータ:', JSON.stringify(data[0], null, 2));
            } else {
              console.log('データが存在しません。空のテーブルです。');
            }
            resolve(data);
          } else {
            console.log(`\n❌ ${tableName} テーブル: エラー (${res.statusCode})`);
            console.log('メッセージ:', data.message || data.code);
            reject(data);
          }
        } catch (e) {
          console.log(`\n❌ ${tableName} テーブル: パースエラー`);
          console.log('レスポンス:', body.substring(0, 200));
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`\n❌ ${tableName} テーブル: 接続エラー`);
      console.log(error.message);
      reject(error);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 テーブルスキーマ確認\n');

  const tables = ['users', 'applicants', 'evaluations', 'evaluation_fields', 'evaluation_field_values', 'interviews'];

  for (const table of tables) {
    try {
      await checkTable(table);
    } catch (error) {
      // エラーは既にログ出力済み
    }
  }

  console.log('\n✨ 確認完了\n');
}

main().catch(console.error);
