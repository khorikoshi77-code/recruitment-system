/**
 * Supabase CRUD APIテスト
 * SUPABASE_SERVICE_ROLE_KEYを使用してCRUD操作をテストします
 * 
 * 実行方法: node test-supabase-crud.js
 */

const https = require('https');

// 環境変数から読み込み（.env.localから手動でコピーしてください）
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数が設定されていません');
  console.log('以下の環境変数を設定してください:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL');
  console.log('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Supabase REST API のベースURL
const API_BASE = SUPABASE_URL.replace('https://', '').replace('http://', '');

/**
 * Supabase REST APIリクエスト
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: `/rest/v1/${path}`,
      method: method,
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = body ? JSON.parse(body) : null;
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: jsonData, status: res.statusCode });
          } else {
            resolve({ success: false, error: jsonData, status: res.statusCode });
          }
        } catch (e) {
          resolve({ success: false, error: body, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * テスト実行
 */
async function runTests() {
  console.log('🚀 Supabase CRUD APIテスト開始\n');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY.substring(0, 20)}...\n`);

  let testApplicantId = null;

  // ==================== CREATE テスト ====================
  console.log('📝 [CREATE] 応募者を作成中...');
  try {
    const createResult = await makeRequest('POST', 'applicants', {
      name: 'テスト太郎',
      email: `test-${Date.now()}@example.com`,
      phone: '090-1234-5678',
      position: 'テストエンジニア',
      status: '応募',
      evaluation: '',
      comment: 'APIテストで作成',
      interview_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (createResult.success && createResult.data && createResult.data.length > 0) {
      testApplicantId = createResult.data[0].id;
      console.log('✅ CREATE成功');
      console.log(`   ID: ${testApplicantId}`);
      console.log(`   名前: ${createResult.data[0].name}`);
    } else {
      console.log('❌ CREATE失敗');
      console.log('   エラー:', createResult.error);
      console.log('   ステータス:', createResult.status);
    }
  } catch (error) {
    console.log('❌ CREATE例外:', error.message);
  }

  console.log('');

  // ==================== READ テスト ====================
  console.log('📖 [READ] 応募者を取得中...');
  try {
    const readResult = await makeRequest('GET', 'applicants?select=*&limit=5');

    if (readResult.success) {
      console.log('✅ READ成功');
      console.log(`   取得件数: ${readResult.data.length}件`);
      if (readResult.data.length > 0) {
        console.log('   最初のレコード:');
        console.log(`     - ID: ${readResult.data[0].id}`);
        console.log(`     - 名前: ${readResult.data[0].name}`);
        console.log(`     - ステータス: ${readResult.data[0].status}`);
      }
    } else {
      console.log('❌ READ失敗');
      console.log('   エラー:', readResult.error);
      console.log('   ステータス:', readResult.status);
    }
  } catch (error) {
    console.log('❌ READ例外:', error.message);
  }

  console.log('');

  // ==================== UPDATE テスト ====================
  if (testApplicantId) {
    console.log('✏️  [UPDATE] 応募者を更新中...');
    try {
      const updateResult = await makeRequest('PATCH', `applicants?id=eq.${testApplicantId}`, {
        status: '書類通過',
        evaluation: 'APIテストで更新',
        updated_at: new Date().toISOString()
      });

      if (updateResult.success) {
        console.log('✅ UPDATE成功');
        if (updateResult.data && updateResult.data.length > 0) {
          console.log(`   更新後ステータス: ${updateResult.data[0].status}`);
          console.log(`   評価: ${updateResult.data[0].evaluation}`);
        }
      } else {
        console.log('❌ UPDATE失敗');
        console.log('   エラー:', updateResult.error);
        console.log('   ステータス:', updateResult.status);
      }
    } catch (error) {
      console.log('❌ UPDATE例外:', error.message);
    }

    console.log('');
  }

  // ==================== DELETE テスト ====================
  if (testApplicantId) {
    console.log('🗑️  [DELETE] テストデータを削除中...');
    try {
      const deleteResult = await makeRequest('DELETE', `applicants?id=eq.${testApplicantId}`);

      if (deleteResult.success || deleteResult.status === 204) {
        console.log('✅ DELETE成功');
        console.log(`   削除されたID: ${testApplicantId}`);
      } else {
        console.log('❌ DELETE失敗');
        console.log('   エラー:', deleteResult.error);
        console.log('   ステータス:', deleteResult.status);
      }
    } catch (error) {
      console.log('❌ DELETE例外:', error.message);
    }

    console.log('');
  }

  // ==================== 他のテーブルテスト ====================
  console.log('📋 [その他] 各テーブルの存在確認中...');
  
  const tables = ['users', 'roles', 'applicant_fields', 'display_settings'];
  
  for (const table of tables) {
    try {
      const result = await makeRequest('GET', `${table}?select=*&limit=1`);
      
      if (result.success) {
        console.log(`✅ ${table} テーブル: アクセス可能 (${result.data.length}件)`);
      } else {
        console.log(`❌ ${table} テーブル: エラー (ステータス: ${result.status})`);
        if (result.error && result.error.message) {
          console.log(`   メッセージ: ${result.error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${table} テーブル: 例外 - ${error.message}`);
    }
  }

  console.log('\n✨ テスト完了\n');
}

// テスト実行
runTests().catch(console.error);

