import { supabase } from '../lib/supabase/client.js'

console.log('🔍 檢查 Supabase Storage Buckets...')

async function verifyBucket() {
  try {
    // 列出所有 buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('❌ 無法獲取 buckets:', error.message)
      return false
    }

    console.log(`📦 找到 ${buckets.length} 個 buckets:`)

    if (buckets.length === 0) {
      console.log('   (沒有 buckets)')
      console.log('\n💡 請按照以下步驟在 Supabase Dashboard 創建 bucket:')
      console.log('   1. 前往: https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem')
      console.log('   2. 點擊左側 Storage')
      console.log('   3. 點擊 Create bucket')
      console.log('   4. 名稱: tarot-cards')
      console.log('   5. 勾選 Public bucket ✅')
      return false
    }

    buckets.forEach(bucket => {
      console.log(`   📁 ${bucket.name} (public: ${bucket.public})`)
      if (bucket.name === 'tarot-cards') {
        console.log('   ✅ 找到 tarot-cards bucket!')
      }
    })

    // 檢查是否有 tarot-cards bucket
    const tarotBucket = buckets.find(b => b.name === 'tarot-cards')

    if (!tarotBucket) {
      console.log('\n❌ 沒有找到 "tarot-cards" bucket')
      console.log('💡 請在 Supabase Dashboard 創建 tarot-cards bucket')
      return false
    }

    if (!tarotBucket.public) {
      console.log('\n⚠️  tarot-cards bucket 不是公開的')
      console.log('💡 請在 bucket 設定中啟用 "public" 選項')
      return false
    }

    console.log('\n🎉 tarot-cards bucket 設置正確!')

    // 如果 bucket 存在，測試建立資料夾
    console.log('\n📁 準備創建資料夾結構...')

    return true

  } catch (err) {
    console.error('❌ 檢查過程發生錯誤:', err.message)
    return false
  }
}

verifyBucket()