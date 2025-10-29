/**
 * 面接評価API完全テスト
 * CREATE -> READ -> UPDATE -> DELETE の一連の流れをテスト
 */

const https = require('https');

const SUPABASE_URL = 'https://slyedtijjvutaptbisve.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNseWVkdGlqanZ1dGFwdGJpc3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTQwNDYsImV4cCI6MjA3NjE3MDA0Nn0.TFC-ySwoiDEMJsvIjjAVFi-0PJuaskcwMYczHfco1l4';

const API_BASE = SUPABASE_URL.replace('https://', '').replace('http://', '');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: path,
      method: method,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = body ? JSON.parse(body) : null;
          resolve({ statusCode: res.statusCode, data: result });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
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

async function testEvaluationAPI() {
  console.log('🧪 面接評価API完全テスト開始\n');

  let testApplicantId = null;
  let testEvaluationId = null;
  let testFieldId = null;

  try {
    // ===== STEP 0: テスト用の応募者を取得 =====
    console.log('📋 STEP 0: テスト用応募者を取得');
    const applicantsResult = await makeRequest('GET', '/rest/v1/applicants?select=id,name&limit=1');

    if (applicantsResult.statusCode === 200 && applicantsResult.data.length > 0) {
      testApplicantId = applicantsResult.data[0].id;
      console.log(`   ✅ テスト用応募者: ${applicantsResult.data[0].name} (${testApplicantId})`);
    } else {
      console.log('   ❌ テスト用応募者が見つかりません');
      return;
    }

    // ===== STEP 0.5: 評価項目を取得 =====
    console.log('\n📋 STEP 0.5: 評価項目を取得');
    const fieldsResult = await makeRequest('GET', '/rest/v1/evaluation_fields?select=id,name&is_active=eq.true&limit=1');

    if (fieldsResult.statusCode === 200 && fieldsResult.data.length > 0) {
      testFieldId = fieldsResult.data[0].id;
      console.log(`   ✅ テスト用評価項目: ${fieldsResult.data[0].name} (${testFieldId})`);
    } else {
      console.log('   ⚠️  評価項目が見つかりません');
    }

    // ===== STEP 1: 既存評価の確認（READ） =====
    console.log('\n📖 STEP 1: 既存評価の確認');
    const existingResult = await makeRequest('GET', `/rest/v1/evaluations?applicant_id=eq.${testApplicantId}`);

    if (existingResult.statusCode === 200) {
      if (existingResult.data.length > 0) {
        console.log(`   ✅ 既存評価あり: ${existingResult.data.length}件`);
        console.log(`      ID: ${existingResult.data[0].id}`);
        console.log(`      総合評価: ${existingResult.data[0].overall_rating}`);
        console.log(`      推奨: ${existingResult.data[0].recommendation}`);

        // 既存評価を削除してクリーンな状態でテスト
        console.log('\n🧹 既存評価を削除してクリーンな状態でテスト');
        for (const evaluation of existingResult.data) {
          await makeRequest('DELETE', `/rest/v1/evaluations?id=eq.${evaluation.id}`);
        }
        console.log('   ✅ 既存評価を削除しました');
      } else {
        console.log('   ✅ 既存評価なし（新規作成可能）');
      }
    }

    // ===== STEP 2: 新規評価作成（CREATE） =====
    console.log('\n➕ STEP 2: 新規評価作成');
    const newEvaluation = {
      applicant_id: testApplicantId,
      overall_rating: 4.5,
      strengths: 'テスト: 技術力が高い',
      weaknesses: 'テスト: 経験が浅い',
      comments: 'テスト: 総合的に良い候補者',
      recommendation: '採用',
      evaluated_at: new Date().toISOString()
    };

    const createResult = await makeRequest('POST', '/rest/v1/evaluations', newEvaluation);

    if (createResult.statusCode >= 200 && createResult.statusCode < 300) {
      testEvaluationId = createResult.data[0].id;
      console.log('   ✅ 評価作成成功！');
      console.log(`      評価ID: ${testEvaluationId}`);
      console.log(`      総合評価: ${createResult.data[0].overall_rating}`);
      console.log(`      推奨: ${createResult.data[0].recommendation}`);
    } else {
      console.log(`   ❌ 評価作成失敗: ${createResult.statusCode}`);
      console.log(`      エラー: ${JSON.stringify(createResult.data)}`);
      return;
    }

    // ===== STEP 2.5: 評価項目詳細を作成 =====
    if (testFieldId) {
      console.log('\n➕ STEP 2.5: 評価項目詳細を作成');
      const fieldValue = {
        evaluation_id: testEvaluationId,
        field_id: testFieldId,
        rating: 5
      };

      const fieldResult = await makeRequest('POST', '/rest/v1/evaluation_field_values', fieldValue);

      if (fieldResult.statusCode >= 200 && fieldResult.statusCode < 300) {
        console.log('   ✅ 評価項目詳細作成成功！');
        console.log(`      Rating: ${fieldResult.data[0].rating}`);
      } else {
        console.log(`   ❌ 評価項目詳細作成失敗: ${fieldResult.statusCode}`);
      }
    }

    // ===== STEP 3: 評価を取得（READ） =====
    console.log('\n📖 STEP 3: 作成した評価を取得');
    const readResult = await makeRequest('GET', `/rest/v1/evaluations?id=eq.${testEvaluationId}`);

    if (readResult.statusCode === 200 && readResult.data.length > 0) {
      console.log('   ✅ 評価取得成功！');
      console.log(`      総合評価: ${readResult.data[0].overall_rating}`);
      console.log(`      強み: ${readResult.data[0].strengths}`);
      console.log(`      弱み: ${readResult.data[0].weaknesses}`);
      console.log(`      コメント: ${readResult.data[0].comments}`);
      console.log(`      推奨: ${readResult.data[0].recommendation}`);
    } else {
      console.log(`   ❌ 評価取得失敗: ${readResult.statusCode}`);
    }

    // ===== STEP 3.5: 評価項目詳細を取得 =====
    if (testFieldId) {
      console.log('\n📖 STEP 3.5: 評価項目詳細を取得');
      const fieldReadResult = await makeRequest('GET', `/rest/v1/evaluation_field_values?evaluation_id=eq.${testEvaluationId}`);

      if (fieldReadResult.statusCode === 200) {
        console.log(`   ✅ 評価項目詳細取得成功: ${fieldReadResult.data.length}件`);
        fieldReadResult.data.forEach((fv, i) => {
          console.log(`      ${i + 1}. Rating: ${fv.rating}`);
        });
      } else {
        console.log(`   ❌ 評価項目詳細取得失敗: ${fieldReadResult.statusCode}`);
      }
    }

    // ===== STEP 4: 評価を更新（UPDATE） =====
    console.log('\n✏️  STEP 4: 評価を更新');
    const updateData = {
      overall_rating: 5.0,
      strengths: 'テスト: 更新後の強み',
      recommendation: '要検討'
    };

    const updateResult = await makeRequest('PATCH', `/rest/v1/evaluations?id=eq.${testEvaluationId}`, updateData);

    if (updateResult.statusCode >= 200 && updateResult.statusCode < 300) {
      console.log('   ✅ 評価更新成功！');
      console.log(`      新総合評価: ${updateResult.data[0].overall_rating}`);
      console.log(`      新強み: ${updateResult.data[0].strengths}`);
      console.log(`      新推奨: ${updateResult.data[0].recommendation}`);
    } else {
      console.log(`   ❌ 評価更新失敗: ${updateResult.statusCode}`);
    }

    // ===== STEP 5: UPSERT機能テスト =====
    console.log('\n🔄 STEP 5: UPSERT機能テスト（同じapplicant_idで上書き）');
    const upsertData = {
      applicant_id: testApplicantId,
      overall_rating: 3.5,
      strengths: 'UPSERT テスト',
      weaknesses: 'UPSERT テスト',
      comments: 'UPSERT機能により既存評価を上書き',
      recommendation: '不採用',
      evaluated_at: new Date().toISOString()
    };

    const upsertResult = await makeRequest('POST', '/rest/v1/evaluations', upsertData);

    if (upsertResult.statusCode >= 200 && upsertResult.statusCode < 300) {
      console.log('   ✅ UPSERT成功！');
      console.log(`      評価ID: ${upsertResult.data[0].id}`);
      console.log(`      ${upsertResult.data[0].id === testEvaluationId ? '既存評価を更新' : '新規評価を作成'}`);
      console.log(`      総合評価: ${upsertResult.data[0].overall_rating}`);
      testEvaluationId = upsertResult.data[0].id; // IDを更新
    } else {
      console.log(`   ❌ UPSERT失敗: ${upsertResult.statusCode}`);
    }

    // ===== STEP 6: 評価を削除（DELETE） =====
    console.log('\n🗑️  STEP 6: 評価を削除');
    const deleteResult = await makeRequest('DELETE', `/rest/v1/evaluations?id=eq.${testEvaluationId}`);

    if (deleteResult.statusCode >= 200 && deleteResult.statusCode < 300) {
      console.log('   ✅ 評価削除成功！');
    } else {
      console.log(`   ❌ 評価削除失敗: ${deleteResult.statusCode}`);
    }

    // ===== STEP 7: 削除確認（READ） =====
    console.log('\n🔍 STEP 7: 削除確認');
    const verifyResult = await makeRequest('GET', `/rest/v1/evaluations?id=eq.${testEvaluationId}`);

    if (verifyResult.statusCode === 200 && verifyResult.data.length === 0) {
      console.log('   ✅ 評価が正常に削除されました');
    } else {
      console.log(`   ⚠️  評価がまだ存在します: ${verifyResult.data.length}件`);
    }

    // ===== STEP 7.5: CASCADE削除の確認 =====
    if (testFieldId) {
      console.log('\n🔍 STEP 7.5: CASCADE削除の確認（評価項目詳細）');
      const cascadeResult = await makeRequest('GET', `/rest/v1/evaluation_field_values?evaluation_id=eq.${testEvaluationId}`);

      if (cascadeResult.statusCode === 200 && cascadeResult.data.length === 0) {
        console.log('   ✅ 評価項目詳細も正常に削除されました（CASCADE動作確認）');
      } else {
        console.log(`   ⚠️  評価項目詳細がまだ存在します: ${cascadeResult.data.length}件`);
      }
    }

    console.log('\n✨ 全テスト完了！\n');

  } catch (error) {
    console.error('\n❌ テストエラー:', error.message);
  }
}

testEvaluationAPI().catch(console.error);
