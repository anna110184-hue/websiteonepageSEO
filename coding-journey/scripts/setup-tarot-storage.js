import { supabase } from '../lib/supabase/client.js'

console.log('🔮 設置塔羅牌儲存系統...')

// 創建 tarot-cards bucket 並設置資料夾結構
async function setupTarotStorage() {
  try {
    console.log('\n📦 Step 1: 創建 storage bucket...')

    // 創建 bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('tarot-cards', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "tarot-cards" 已存在')
      } else {
        console.error('❌ 創建 bucket 失敗:', bucketError.message)
        return false
      }
    } else {
      console.log('✅ 成功創建 bucket "tarot-cards"')
    }

    console.log('\n🔐 Step 2: 設置公開讀取政策...')

    // 設置公開讀取政策
    const { error: policyError } = await supabase.rpc('create_tarot_storage_policy')

    if (policyError) {
      console.log('⚠️  政策設置需要在 Supabase Dashboard 手動完成')
      console.log('   請到 Storage > Policies 添加以下政策:')
      console.log(`
   政策名稱: "Public read access for tarot cards"
   操作: SELECT
   目標角色: public
   表達式: bucket_id = 'tarot-cards'
      `)
    }

    console.log('\n📁 Step 3: 創建資料夾結構...')

    // 創建資料夾結構（通過上傳空文件來創建資料夾）
    const folders = [
      'major-arcana/.gitkeep',
      'minor-arcana/cups/.gitkeep',
      'minor-arcana/swords/.gitkeep',
      'minor-arcana/wands/.gitkeep',
      'minor-arcana/pentacles/.gitkeep'
    ]

    const emptyFile = new Blob([''], { type: 'text/plain' })

    for (const folderPath of folders) {
      const { error: uploadError } = await supabase.storage
        .from('tarot-cards')
        .upload(folderPath, emptyFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        if (uploadError.message.includes('already exists')) {
          console.log(`✅ 資料夾 ${folderPath.replace('/.gitkeep', '')} 已存在`)
        } else {
          console.error(`❌ 創建資料夾 ${folderPath} 失敗:`, uploadError.message)
        }
      } else {
        console.log(`✅ 創建資料夾: ${folderPath.replace('/.gitkeep', '')}`)
      }
    }

    console.log('\n🎯 Step 4: 驗證設置...')

    // 驗證 bucket 和資料夾
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('❌ 無法列出 buckets:', listError.message)
      return false
    }

    const tarotBucket = buckets.find(bucket => bucket.name === 'tarot-cards')
    if (tarotBucket) {
      console.log('✅ Bucket "tarot-cards" 驗證成功')
      console.log(`   - 公開訪問: ${tarotBucket.public}`)
    }

    // 列出資料夾結構
    const { data: files, error: filesError } = await supabase.storage
      .from('tarot-cards')
      .list('', { limit: 100 })

    if (!filesError && files) {
      console.log('\n📂 已創建的資料夾結構:')
      files.forEach(file => {
        if (file.name !== '.emptyFolderPlaceholder') {
          console.log(`   📁 ${file.name}`)
        }
      })
    }

    console.log('\n🎉 塔羅牌儲存系統設置完成!')
    console.log('\n📝 接下來你可以:')
    console.log('   1. 上傳塔羅牌圖片到對應資料夾')
    console.log('   2. 使用 getTarotCardUrl() 函數獲取圖片 URL')
    console.log('   3. 使用 uploadTarotCard() 函數上傳新圖片')

    return true

  } catch (error) {
    console.error('❌ 設置過程中發生錯誤:', error.message)
    return false
  }
}

// 如果直接執行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTarotStorage()
}