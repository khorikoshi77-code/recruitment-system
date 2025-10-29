/**
 * 全テーブルの存在確認
 */

const https = require('https');

const SUPABASE_URL = 'https://slyedtijjvutaptbisve.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNseWVkdGlqanZ1dGFwdGJpc3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTQwNDYsImV4cCI6MjA3NjE3MDA0Nn0.TFC-ySwoiDEMJsvIjjAVFi-0PJuaskcwMYczHfco1l4';

const API_BASE = SUPABASE_URL.replace('https://', '').replace('http://', '');

function checkTable(tableName) {
  return new Promise((resolve) => {
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
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            resolve({
              exists: true,
              columns,
              hasData: data.length > 0,
              sample: data[0] || null
            });
          } else {
            resolve({ exists: false, error: data.message || data.code });
          }
        } catch (e) {
          resolve({ exists: false, error: 'Parse error' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ exists: false, error: error.message });
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 全テーブル存在確認\n');

  // コンポーネントで使用されているテーブルをリストアップ
  const tables = [
    { name: 'users', usage: 'UserList, UserEdit, UserRegister' },
    { name: 'roles', usage: 'UserRegister' },
    { name: 'applicants', usage: 'ApplicantList, ApplicantDetail, InterviewCalendar' },
    { name: 'applicant_fields', usage: 'DisplaySettings' },
    { name: 'evaluations', usage: 'InterviewEvaluation' },
    { name: 'evaluation_fields', usage: 'EvaluationContext' },
    { name: 'evaluation_field_values', usage: 'InterviewEvaluation' },
    { name: 'display_settings', usage: 'DashboardEditor, DisplaySettings' },
    { name: 'dashboard_cards', usage: 'DashboardCardManager' },
    { name: 'status_settings', usage: '(推測) StatusManagement' },
    { name: 'permission_settings', usage: '(推測) RoleManagement' },
    { name: 'interviews', usage: '(未実装)' }
  ];

  const existingTables = [];
  const missingTables = [];

  for (const table of tables) {
    const result = await checkTable(table.name);

    if (result.exists) {
      existingTables.push(table.name);
      console.log(`✅ ${table.name}`);
      console.log(`   使用場所: ${table.usage}`);
      console.log(`   カラム: ${result.columns.join(', ')}`);
      console.log(`   データ: ${result.hasData ? 'あり' : 'なし'}`);
    } else {
      missingTables.push(table.name);
      console.log(`❌ ${table.name}`);
      console.log(`   使用場所: ${table.usage}`);
      console.log(`   エラー: ${result.error}`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log(`\n📊 サマリー:`);
  console.log(`   存在するテーブル: ${existingTables.length}個`);
  console.log(`   存在しないテーブル: ${missingTables.length}個\n`);

  console.log(`✅ 存在するテーブル:\n   ${existingTables.join(', ')}\n`);

  if (missingTables.length > 0) {
    console.log(`❌ 存在しないテーブル:\n   ${missingTables.join(', ')}\n`);
  }

  console.log('✨ 確認完了\n');
}

main().catch(console.error);
