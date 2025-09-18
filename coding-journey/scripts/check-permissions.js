import { supabase } from '../lib/supabase/client.js'

console.log('🔐 檢查 Supabase 權限和連線狀態...')

async function checkPermissions() {
  try {
    console.log('🔗 連線資訊:')
    console.log(`   URL: ${process.env.SUPABASE_URL}`)
    console.log(`   Key: ${process.env.SUPABASE_ANON_KEY ? '已設定' : '未設定'}`)

    // 測試基本連線
    console.log('\n📡 測試基本連線...')

    // 測試 Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔑 Auth 狀態:', user ? '已登入' : '未登入')

    // 測試 Database
    console.log('\n🗄️  測試資料庫連線...')
    const { data: dbTest, error: dbError } = await supabase
      .from('non_existent_table')
      .select('*')
      .limit(1)

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        console.log('✅ 資料庫連線正常 (表格不存在是預期的)')
      } else {
        console.log('⚠️  資料庫連線異常:', dbError.message)
      }
    }

    // 測試 Storage 權限
    console.log('\n📦 測試 Storage 權限...')
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()

    if (storageError) {
      console.error('❌ Storage 錯誤:', storageError.message)
      console.log('\n可能的原因:')
      console.log('1. 你的 Supabase 計劃不包含 Storage 功能')
      console.log('2. Storage 功能尚未啟用')
      console.log('3. API Key 權限不足')

      return false
    } else {
      console.log(`✅ Storage 連線正常，找到 ${buckets.length} 個 buckets`)
      return true
    }

  } catch (error) {
    console.error('❌ 檢查過程發生錯誤:', error.message)
    return false
  }
}

async function provideGuidance() {
  const hasStorageAccess = await checkPermissions()

  if (!hasStorageAccess) {
    console.log('\n📋 解決步驟:')
    console.log('1. 確認你的 Supabase 計劃支援 Storage')
    console.log('2. 前往 Dashboard 檢查 Storage 是否可用')
    console.log('3. 如果看不到 Storage 選項，可能需要升級計劃')
    return
  }

  console.log('\n🛠️  創建 bucket 的詳細步驟:')
  console.log('1. 前往: https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem')
  console.log('2. 登入你的帳號')
  console.log('3. 在左側選單找到 "Storage"')
  console.log('4. 點擊 "Create bucket"')
  console.log('5. 設定:')
  console.log('   - Bucket name: tarot-cards')
  console.log('   - Public bucket: ✅ 勾選')
  console.log('   - File size limit: 5242880 (5MB)')
  console.log('   - Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp')
  console.log('6. 點擊 "Create bucket"')

  console.log('\n🔄 創建完成後，再次執行:')
  console.log('   node scripts/verify-bucket.js')
}

provideGuidance()