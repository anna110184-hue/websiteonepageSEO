import { supabase } from '../lib/supabase/client.js'

console.log('🧪 測試塔羅牌儲存系統...')

async function testTarotStorage() {
  try {
    console.log('\n📦 Step 1: 檢查 bucket 是否存在...')

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ 無法獲取 buckets:', bucketsError.message)
      return false
    }

    const tarotBucket = buckets.find(bucket => bucket.name === 'tarot-cards')

    if (!tarotBucket) {
      console.error('❌ 找不到 "tarot-cards" bucket')
      console.log('💡 請先在 Supabase Dashboard 創建 bucket')
      return false
    }

    console.log('✅ 找到 "tarot-cards" bucket')
    console.log(`   - 公開訪問: ${tarotBucket.public}`)
    console.log(`   - 檔案大小限制: ${tarotBucket.file_size_limit || 'unlimited'}`)

    console.log('\n📁 Step 2: 檢查資料夾結構...')

    // 檢查主要資料夾
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from('tarot-cards')
      .list('', { limit: 100 })

    if (rootError) {
      console.error('❌ 無法列出根目錄:', rootError.message)
      return false
    }

    console.log('📂 根目錄內容:')
    if (rootFiles && rootFiles.length > 0) {
      rootFiles.forEach(file => {
        console.log(`   📁 ${file.name}`)
      })
    } else {
      console.log('   (空目錄)')
    }

    // 檢查 minor-arcana 子資料夾
    const { data: minorFiles, error: minorError } = await supabase.storage
      .from('tarot-cards')
      .list('minor-arcana', { limit: 100 })

    if (!minorError && minorFiles && minorFiles.length > 0) {
      console.log('\n📂 minor-arcana 子資料夾:')
      minorFiles.forEach(file => {
        console.log(`   📁 minor-arcana/${file.name}`)
      })
    }

    console.log('\n🔗 Step 3: 測試 URL 生成...')

    // 測試 URL 生成
    const testPaths = [
      'major-arcana/fool.jpg',
      'minor-arcana/cups/ace-of-cups.jpg',
      'minor-arcana/swords/king-of-swords.jpg'
    ]

    testPaths.forEach(path => {
      const { data } = supabase.storage
        .from('tarot-cards')
        .getPublicUrl(path)

      console.log(`📄 ${path}`)
      console.log(`   URL: ${data.publicUrl}`)
    })

    console.log('\n🎯 Step 4: 測試上傳功能...')

    // 創建測試檔案
    const testFile = new Blob(['Test tarot card image'], { type: 'text/plain' })
    const testPath = 'test-upload.txt'

    const { error: uploadError } = await supabase.storage
      .from('tarot-cards')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ 上傳測試失敗:', uploadError.message)
      if (uploadError.message.includes('policy')) {
        console.log('💡 可能需要設置上傳政策 (policies)')
      }
    } else {
      console.log('✅ 上傳測試成功')

      // 刪除測試檔案
      const { error: deleteError } = await supabase.storage
        .from('tarot-cards')
        .remove([testPath])

      if (!deleteError) {
        console.log('✅ 測試檔案已清理')
      }
    }

    console.log('\n🎉 儲存系統測試完成!')

    // 總結
    console.log('\n📋 系統狀態總結:')
    console.log(`✅ Bucket 存在: ${tarotBucket ? 'Yes' : 'No'}`)
    console.log(`✅ 公開訪問: ${tarotBucket?.public ? 'Yes' : 'No'}`)
    console.log(`📁 根資料夾數量: ${rootFiles?.length || 0}`)

    return true

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message)
    return false
  }
}

// 執行測試
testTarotStorage()