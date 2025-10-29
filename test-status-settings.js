/**
 * status_settingsテーブルのアクセステスト
 */

const https = require('https');

const SUPABASE_URL = 'https://slyedtijjvutaptbisve.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNseWVkdGlqanZ1dGFwdGJpc3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTQwNDYsImV4cCI6MjA3NjE3MDA0Nn0.TFC-ySwoiDEMJsvIjjAVFi-0PJuaskcwMYczHfco1l4';

const API_BASE = SUPABASE_URL.replace('https://', '').replace('http://', '');

function testAccess() {
  return new Promise((resolve) => {
    const options = {
      hostname: API_BASE,
      path: `/rest/v1/status_settings?select=*&limit=5`,
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
            console.log('✅ status_settings テーブルへのアクセス成功！');
            console.log(`   ステータス: ${res.statusCode}`);
            console.log(`   データ件数: ${data.length}件`);

            if (data.length > 0) {
              console.log('   カラム:', Object.keys(data[0]).join(', '));
              console.log('\n   サンプルデータ:');
              data.forEach((item, i) => {
                console.log(`   ${i + 1}. ${item.status_name} (${item.status_key})`);
              });
            } else {
              console.log('   ⚠️  データが存在しません（空のテーブル）');
            }

            resolve({ success: true, data });
          } else {
            console.log('❌ status_settings テーブルへのアクセス失敗');
            console.log(`   ステータス: ${res.statusCode}`);
            console.log(`   エラー: ${data.message || data.code}`);
            resolve({ success: false, error: data });
          }
        } catch (e) {
          console.log('❌ レスポンスのパースエラー');
          console.log('   レスポンス:', body.substring(0, 200));
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ 接続エラー');
      console.log('   ', error.message);
      resolve({ success: false, error: error.message });
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 status_settings テーブル アクセステスト\n');
  await testAccess();
  console.log('\n✨ テスト完了\n');
}

main().catch(console.error);
