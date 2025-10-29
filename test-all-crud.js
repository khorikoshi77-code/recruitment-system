const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slyedtijjvutaptbisve.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// テスト用のIDを保存
const testData = {
  userId: null,
  applicantId: null,
  interviewId: null,
  evaluationId: null,
  evaluationFieldId: null,
  evaluationFieldValueId: null
}

// ============================================
// テストヘルパー関数
// ============================================
function logSection(title) {
  console.log('\n' + '='.repeat(60))
  console.log(`📋 ${title}`)
  console.log('='.repeat(60))
}

function logTest(name, status, data = null) {
  const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'
  console.log(`${icon} ${name}`)
  if (data) {
    console.log('   データ:', JSON.stringify(data, null, 2))
  }
}

// ============================================
// 1. Users (ユーザー) テーブル
// ============================================
async function testUsers() {
  logSection('Users (ユーザー) CRUD テスト')

  try {
    // READ (既存ユーザーを取得)
    logTest('Read: ユーザー一覧取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (readError) throw readError
    if (readData && readData.length > 0) {
      testData.userId = readData[0].id
      logTest('Read: ユーザー取得', 'success', readData[0])
    } else {
      logTest('Read: ユーザーなし', 'success', { message: 'データが存在しません' })
    }

    // 注意: usersテーブルはauth.usersと連携しているため、CREATEとDELETEはスキップ
    console.log('ℹ️  Note: usersテーブルはauth.usersと連携しているため、CREATE/UPDATE/DELETEはスキップします')

  } catch (error) {
    logTest('Users テスト失敗', 'error', error.message)
    // usersテーブルのエラーは致命的ではないので、続行
  }
}

// ============================================
// 2. Applicants (応募者) テーブル
// ============================================
async function testApplicants() {
  logSection('Applicants (応募者) CRUD テスト')

  try {
    // CREATE
    logTest('Create: 応募者作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('applicants')
      .insert({
        name: 'テスト応募者',
        email: `applicant-${Date.now()}@example.com`,
        position: 'フロントエンドエンジニア',
        status: '書類選考',
        phone: '090-1234-5678',
        comment: 'テスト用応募者',
        evaluation: ''
      })
      .select()
      .single()

    if (createError) throw createError
    testData.applicantId = createData.id
    logTest('Create: 応募者作成', 'success', createData)

    // READ
    logTest('Read: 応募者取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('applicants')
      .select('*')
      .eq('id', testData.applicantId)
      .single()

    if (readError) throw readError
    logTest('Read: 応募者取得', 'success', readData)

    // UPDATE
    logTest('Update: 応募者更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('applicants')
      .update({ status: '一次面接' })
      .eq('id', testData.applicantId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: 応募者更新', 'success', updateData)

    // DELETE (最後にクリーンアップ)
    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Applicants テスト失敗', 'error', error.message)
    throw error
  }
}

// ============================================
// 3. Interviews (面接日程) テーブル - スキップ
// ============================================
async function testInterviews() {
  logSection('Interviews (面接日程) CRUD テスト - スキップ')
  console.log('ℹ️  Note: interviewsテーブルが存在しないため、このテストはスキップします')
}

// ============================================
// 4. Evaluation Fields (評価項目マスタ) テーブル
// ============================================
async function testEvaluationFields() {
  logSection('Evaluation Fields (評価項目マスタ) CRUD テスト')

  try {
    // CREATE
    logTest('Create: 評価項目作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('evaluation_fields')
      .insert({
        name: 'テスト評価項目',
        description: 'テスト用の評価項目です',
        weight: 15,
        is_required: false,
        is_active: true,
        display_order: 99
      })
      .select()
      .single()

    if (createError) throw createError
    testData.evaluationFieldId = createData.id
    logTest('Create: 評価項目作成', 'success', createData)

    // READ
    logTest('Read: 評価項目取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('evaluation_fields')
      .select('*')
      .eq('id', testData.evaluationFieldId)
      .single()

    if (readError) throw readError
    logTest('Read: 評価項目取得', 'success', readData)

    // UPDATE
    logTest('Update: 評価項目更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('evaluation_fields')
      .update({ weight: 20 })
      .eq('id', testData.evaluationFieldId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: 評価項目更新', 'success', updateData)

    // DELETE (最後にクリーンアップ)
    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Evaluation Fields テスト失敗', 'error', error.message)
    throw error
  }
}

// ============================================
// 5. Evaluations (面接評価) テーブル
// ============================================
async function testEvaluations() {
  logSection('Evaluations (面接評価) CRUD テスト')

  try {
    // CREATE
    logTest('Create: 評価作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('evaluations')
      .insert({
        applicant_id: testData.applicantId,
        overall_rating: 4.5,
        strengths: 'テスト強み',
        weaknesses: 'テスト改善点',
        comments: 'テストコメント',
        recommendation: '採用'
      })
      .select()
      .single()

    if (createError) throw createError
    testData.evaluationId = createData.id
    logTest('Create: 評価作成', 'success', createData)

    // READ
    logTest('Read: 評価取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', testData.evaluationId)
      .single()

    if (readError) throw readError
    logTest('Read: 評価取得', 'success', readData)

    // UPDATE
    logTest('Update: 評価更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('evaluations')
      .update({
        overall_rating: 5.0,
        comments: '更新されたコメント'
      })
      .eq('id', testData.evaluationId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: 評価更新', 'success', updateData)

    // DELETE (最後にクリーンアップ)
    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Evaluations テスト失敗', 'error', error.message)
    throw error
  }
}

// ============================================
// 6. Evaluation Field Values (評価項目詳細値) テーブル
// ============================================
async function testEvaluationFieldValues() {
  logSection('Evaluation Field Values (評価項目詳細値) CRUD テスト')

  try {
    // CREATE
    logTest('Create: 評価項目詳細値作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('evaluation_field_values')
      .insert({
        evaluation_id: testData.evaluationId,
        field_id: testData.evaluationFieldId,
        rating: 4
      })
      .select()
      .single()

    if (createError) throw createError
    testData.evaluationFieldValueId = createData.id
    logTest('Create: 評価項目詳細値作成', 'success', createData)

    // READ
    logTest('Read: 評価項目詳細値取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('evaluation_field_values')
      .select('*')
      .eq('id', testData.evaluationFieldValueId)
      .single()

    if (readError) throw readError
    logTest('Read: 評価項目詳細値取得', 'success', readData)

    // UPDATE
    logTest('Update: 評価項目詳細値更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('evaluation_field_values')
      .update({ rating: 5 })
      .eq('id', testData.evaluationFieldValueId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: 評価項目詳細値更新', 'success', updateData)

    // DELETE (最後にクリーンアップ)
    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Evaluation Field Values テスト失敗', 'error', error.message)
    throw error
  }
}

// ============================================
// クリーンアップ（テストデータの削除）
// ============================================
async function cleanup() {
  logSection('クリーンアップ（テストデータの削除）')

  try {
    // 削除は依存関係の逆順で実行
    if (testData.evaluationFieldValueId) {
      logTest('Delete: 評価項目詳細値削除', 'pending')
      const { error } = await supabase
        .from('evaluation_field_values')
        .delete()
        .eq('id', testData.evaluationFieldValueId)
      if (error) throw error
      logTest('Delete: 評価項目詳細値削除', 'success')
    }

    if (testData.evaluationId) {
      logTest('Delete: 評価削除', 'pending')
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', testData.evaluationId)
      if (error) throw error
      logTest('Delete: 評価削除', 'success')
    }

    if (testData.evaluationFieldId) {
      logTest('Delete: 評価項目削除', 'pending')
      const { error } = await supabase
        .from('evaluation_fields')
        .delete()
        .eq('id', testData.evaluationFieldId)
      if (error) throw error
      logTest('Delete: 評価項目削除', 'success')
    }

    if (testData.applicantId) {
      logTest('Delete: 応募者削除', 'pending')
      const { error } = await supabase
        .from('applicants')
        .delete()
        .eq('id', testData.applicantId)
      if (error) throw error
      logTest('Delete: 応募者削除', 'success')
    }

    // Note: usersテーブルはauth.usersと連携しているため削除しない
    // Note: interviewsテーブルは存在しないためスキップ

  } catch (error) {
    logTest('クリーンアップ失敗', 'error', error.message)
  }
}

// ============================================
// メイン実行
// ============================================
async function runAllTests() {
  console.log('\n🚀 全機能CRUD APIテスト開始\n')

  try {
    await testUsers()
    await testApplicants()
    await testInterviews()
    await testEvaluationFields()
    await testEvaluations()
    await testEvaluationFieldValues()

    console.log('\n✅ 全テスト成功！')

  } catch (error) {
    console.error('\n❌ テスト失敗:', error.message)
  } finally {
    await cleanup()
    console.log('\n🏁 テスト完了\n')
  }
}

runAllTests()
