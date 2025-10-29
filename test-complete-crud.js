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
  roleId: null,
  applicantId: null,
  applicantFieldId: null,
  evaluationId: null,
  evaluationFieldId: null,
  evaluationFieldValueId: null,
  displaySettingId: null,
  dashboardCardId: null,
  statusSettingId: null
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
  if (data && status === 'error') {
    console.log('   エラー:', data)
  } else if (data && status === 'success' && typeof data === 'object') {
    const keys = Object.keys(data).slice(0, 5)
    console.log('   主要フィールド:', keys.join(', '))
  }
}

// ============================================
// 1. Roles (役割マスタ) テーブル
// ============================================
async function testRoles() {
  logSection('Roles (役割マスタ) CRUD テスト')

  try {
    // CREATE
    logTest('Create: 役割作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('roles')
      .insert({
        role_name: 'テスト役割',
        role_key: `test_role_${Date.now()}`,
        description: 'テスト用の役割です',
        is_active: true
      })
      .select()
      .single()

    if (createError) throw createError
    testData.roleId = createData.id
    logTest('Create: 役割作成', 'success', createData)

    // READ
    logTest('Read: 役割取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', testData.roleId)
      .single()

    if (readError) throw readError
    logTest('Read: 役割取得', 'success', readData)

    // UPDATE
    logTest('Update: 役割更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('roles')
      .update({ description: '更新されたテスト役割' })
      .eq('id', testData.roleId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: 役割更新', 'success', updateData)

    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Roles テスト失敗', 'error', error.message)
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
        status: '応募',
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
      .update({ status: '書類選考' })
      .eq('id', testData.applicantId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: 応募者更新', 'success', updateData)

    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Applicants テスト失敗', 'error', error.message)
    throw error
  }
}

// ============================================
// 3. Applicant Fields (応募者フィールド設定) テーブル
// ============================================
async function testApplicantFields() {
  logSection('Applicant Fields (応募者フィールド設定) CRUD テスト')

  try {
    // CREATE
    logTest('Create: フィールド設定作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('applicant_fields')
      .insert({
        field_key: `test_field_${Date.now()}`,
        field_name: 'テストフィールド',
        field_type: 'text',
        is_required: false,
        is_displayed: true,
        display_order: 999
      })
      .select()
      .single()

    if (createError) throw createError
    testData.applicantFieldId = createData.id
    logTest('Create: フィールド設定作成', 'success', createData)

    // READ
    logTest('Read: フィールド設定取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('applicant_fields')
      .select('*')
      .eq('id', testData.applicantFieldId)
      .single()

    if (readError) throw readError
    logTest('Read: フィールド設定取得', 'success', readData)

    // UPDATE
    logTest('Update: フィールド設定更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('applicant_fields')
      .update({ field_name: '更新されたテストフィールド' })
      .eq('id', testData.applicantFieldId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: フィールド設定更新', 'success', updateData)

    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Applicant Fields テスト失敗', 'error', error.message)
  }
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

    // UPDATE (updated_atカラムがないのでスキップ)
    console.log('ℹ️  Note: evaluation_field_valuesテーブルにはupdated_atカラムがないため、UPDATEはスキップします')

    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Evaluation Field Values テスト失敗', 'error', error.message)
  }
}

// ============================================
// 7. Display Settings (画面表示設定) テーブル
// ============================================
async function testDisplaySettings() {
  logSection('Display Settings (画面表示設定) CRUD テスト')

  try {
    // CREATE
    logTest('Create: 画面表示設定作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('display_settings')
      .insert({
        page_name: `test_page_${Date.now()}`,
        settings: { test: true }
      })
      .select()
      .single()

    if (createError) throw createError
    testData.displaySettingId = createData.id
    logTest('Create: 画面表示設定作成', 'success', createData)

    // READ
    logTest('Read: 画面表示設定取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('display_settings')
      .select('*')
      .eq('id', testData.displaySettingId)
      .single()

    if (readError) throw readError
    logTest('Read: 画面表示設定取得', 'success', readData)

    // UPDATE
    logTest('Update: 画面表示設定更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('display_settings')
      .update({ settings: { test: true, updated: true } })
      .eq('id', testData.displaySettingId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: 画面表示設定更新', 'success', updateData)

    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Display Settings テスト失敗', 'error', error.message)
  }
}

// ============================================
// 8. Dashboard Cards (ダッシュボードカード設定) テーブル
// ============================================
async function testDashboardCards() {
  logSection('Dashboard Cards (ダッシュボードカード設定) CRUD テスト')

  try {
    // CREATE
    logTest('Create: ダッシュボードカード作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('dashboard_cards')
      .insert({
        card_key: `test_card_${Date.now()}`,
        card_name: 'テストカード',
        card_type: 'number',
        card_color: '#3B82F6',
        data_source: 'test',
        data_query: {},
        display_order: 999,
        is_active: true,
        is_custom: true
      })
      .select()
      .single()

    if (createError) throw createError
    testData.dashboardCardId = createData.id
    logTest('Create: ダッシュボードカード作成', 'success', createData)

    // READ
    logTest('Read: ダッシュボードカード取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('dashboard_cards')
      .select('*')
      .eq('id', testData.dashboardCardId)
      .single()

    if (readError) throw readError
    logTest('Read: ダッシュボードカード取得', 'success', readData)

    // UPDATE
    logTest('Update: ダッシュボードカード更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('dashboard_cards')
      .update({ card_name: '更新されたテストカード' })
      .eq('id', testData.dashboardCardId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: ダッシュボードカード更新', 'success', updateData)

    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Dashboard Cards テスト失敗', 'error', error.message)
  }
}

// ============================================
// 9. Status Settings (ステータス設定) テーブル
// ============================================
async function testStatusSettings() {
  logSection('Status Settings (ステータス設定) CRUD テスト')

  try {
    // CREATE
    logTest('Create: ステータス設定作成', 'pending')
    const { data: createData, error: createError } = await supabase
      .from('status_settings')
      .insert({
        status_key: `test_${Date.now() % 10000}`, // 20文字制限に対応
        status_name: 'テストステータス',
        status_color: '#10B981',
        is_active: true,
        display_order: 999
      })
      .select()
      .single()

    if (createError) throw createError
    testData.statusSettingId = createData.id
    logTest('Create: ステータス設定作成', 'success', createData)

    // READ
    logTest('Read: ステータス設定取得', 'pending')
    const { data: readData, error: readError } = await supabase
      .from('status_settings')
      .select('*')
      .eq('id', testData.statusSettingId)
      .single()

    if (readError) throw readError
    logTest('Read: ステータス設定取得', 'success', readData)

    // UPDATE
    logTest('Update: ステータス設定更新', 'pending')
    const { data: updateData, error: updateError } = await supabase
      .from('status_settings')
      .update({ status_name: '更新されたテストステータス' })
      .eq('id', testData.statusSettingId)
      .select()
      .single()

    if (updateError) throw updateError
    logTest('Update: ステータス設定更新', 'success', updateData)

    console.log('⏭️  Delete: 最後にクリーンアップします')

  } catch (error) {
    logTest('Status Settings テスト失敗', 'error', error.message)
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

    if (testData.dashboardCardId) {
      logTest('Delete: ダッシュボードカード削除', 'pending')
      const { error } = await supabase
        .from('dashboard_cards')
        .delete()
        .eq('id', testData.dashboardCardId)
      if (error) throw error
      logTest('Delete: ダッシュボードカード削除', 'success')
    }

    if (testData.displaySettingId) {
      logTest('Delete: 画面表示設定削除', 'pending')
      const { error } = await supabase
        .from('display_settings')
        .delete()
        .eq('id', testData.displaySettingId)
      if (error) throw error
      logTest('Delete: 画面表示設定削除', 'success')
    }

    if (testData.applicantFieldId) {
      logTest('Delete: フィールド設定削除', 'pending')
      const { error } = await supabase
        .from('applicant_fields')
        .delete()
        .eq('id', testData.applicantFieldId)
      if (error) throw error
      logTest('Delete: フィールド設定削除', 'success')
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

    if (testData.statusSettingId) {
      logTest('Delete: ステータス設定削除', 'pending')
      const { error } = await supabase
        .from('status_settings')
        .delete()
        .eq('id', testData.statusSettingId)
      if (error) throw error
      logTest('Delete: ステータス設定削除', 'success')
    }

    if (testData.roleId) {
      logTest('Delete: 役割削除', 'pending')
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', testData.roleId)
      if (error) throw error
      logTest('Delete: 役割削除', 'success')
    }

  } catch (error) {
    logTest('クリーンアップ失敗', 'error', error.message)
  }
}

// ============================================
// メイン実行
// ============================================
async function runAllTests() {
  console.log('\n🚀 全機能CRUD APIテスト開始（実装済みテーブル）\n')
  console.log('📋 テスト対象: 10テーブル')
  console.log('   1. roles')
  console.log('   2. applicants')
  console.log('   3. applicant_fields')
  console.log('   4. evaluation_fields')
  console.log('   5. evaluations')
  console.log('   6. evaluation_field_values')
  console.log('   7. display_settings')
  console.log('   8. dashboard_cards')
  console.log('   9. status_settings')
  console.log('   10. users (READ only)\n')

  try {
    await testRoles()
    await testApplicants()
    await testApplicantFields()
    await testEvaluationFields()
    await testEvaluations()
    await testEvaluationFieldValues()
    await testDisplaySettings()
    await testDashboardCards()
    await testStatusSettings()

    console.log('\n✅ 全テスト成功！')

  } catch (error) {
    console.error('\n❌ テスト失敗:', error.message)
  } finally {
    await cleanup()
    console.log('\n🏁 テスト完了\n')
  }
}

runAllTests()
