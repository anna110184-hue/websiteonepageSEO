import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔮 完整設置塔羅牌儲存系統 (使用 service role key)...')

// 使用 service role key 創建管理員客戶端
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function setupCompleteStorage() {
  try {
    console.log('\n🔧 Step 1: 創建 tarot-cards bucket...')

    // 創建 bucket
    const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.createBucket('tarot-cards', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5 * 1024 * 1024 // 5MB
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

    console.log('\n🔐 Step 2: 設置 Storage Policies...')

    // 創建公開讀取政策
    const createReadPolicy = `
      CREATE POLICY IF NOT EXISTS "Public read access for tarot cards"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'tarot-cards');
    `

    const { error: readPolicyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createReadPolicy
    })

    if (readPolicyError) {
      console.log('⚠️  無法透過 RPC 創建讀取政策，將使用替代方法')

      // 替代方法：直接嘗試設置 bucket 為公開
      const { error: updateError } = await supabaseAdmin.storage.updateBucket('tarot-cards', {
        public: true
      })

      if (updateError) {
        console.log('⚠️  需要手動設置政策 - 請在 Dashboard 中設置')
      } else {
        console.log('✅ 成功設置 bucket 為公開')
      }
    } else {
      console.log('✅ 創建公開讀取政策成功')
    }

    // 創建認證用戶上傳政策
    const createUploadPolicy = `
      CREATE POLICY IF NOT EXISTS "Authenticated users can upload tarot cards"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'tarot-cards');
    `

    const { error: uploadPolicyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createUploadPolicy
    })

    if (!uploadPolicyError) {
      console.log('✅ 創建上傳政策成功')
    }

    console.log('\n📁 Step 3: 創建資料夾結構...')

    const folders = [
      'major-arcana/.gitkeep',
      'minor-arcana/cups/.gitkeep',
      'minor-arcana/swords/.gitkeep',
      'minor-arcana/wands/.gitkeep',
      'minor-arcana/pentacles/.gitkeep'
    ]

    const emptyFile = new Blob(['# 塔羅牌資料夾結構'], { type: 'text/plain' })

    for (const folderPath of folders) {
      const { error: uploadError } = await supabaseAdmin.storage
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

    console.log('\n🧪 Step 4: 測試功能...')

    // 測試公開 URL 生成
    const testImagePath = 'test-image.jpg'
    const testFile = new Blob(['mock image data'], { type: 'image/jpeg' })

    const { data: uploadData, error: testUploadError } = await supabaseAdmin.storage
      .from('tarot-cards')
      .upload(`major-arcana/${testImagePath}`, testFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (testUploadError) {
      console.error('❌ 測試上傳失敗:', testUploadError.message)
    } else {
      console.log('✅ 測試上傳成功')

      // 獲取公開 URL
      const { data: urlData } = supabaseAdmin.storage
        .from('tarot-cards')
        .getPublicUrl(`major-arcana/${testImagePath}`)

      console.log(`📄 測試圖片 URL: ${urlData.publicUrl}`)

      // 清理測試檔案
      await supabaseAdmin.storage
        .from('tarot-cards')
        .remove([`major-arcana/${testImagePath}`])

      console.log('🧹 測試檔案已清理')
    }

    console.log('\n📊 Step 5: 驗證最終狀態...')

    // 列出所有 buckets
    const { data: finalBuckets, error: listError } = await supabaseAdmin.storage.listBuckets()

    if (listError) {
      console.error('❌ 無法列出 buckets:', listError.message)
    } else {
      console.log(`✅ 總共有 ${finalBuckets.length} 個 buckets:`)
      finalBuckets.forEach(bucket => {
        console.log(`   📦 ${bucket.name} (公開: ${bucket.public})`)
      })
    }

    // 列出 tarot-cards 的資料夾
    const { data: rootFolders, error: foldersError } = await supabaseAdmin.storage
      .from('tarot-cards')
      .list('', { limit: 100 })

    if (!foldersError && rootFolders) {
      console.log('\n📂 tarot-cards 資料夾:')
      rootFolders.forEach(folder => {
        if (folder.name !== '.gitkeep') {
          console.log(`   📁 ${folder.name}`)
        }
      })

      // 檢查 minor-arcana 子資料夾
      const { data: minorFolders, error: minorError } = await supabaseAdmin.storage
        .from('tarot-cards')
        .list('minor-arcana', { limit: 100 })

      if (!minorError && minorFolders) {
        console.log('\n📂 minor-arcana 子資料夾:')
        minorFolders.forEach(folder => {
          if (folder.name !== '.gitkeep') {
            console.log(`   📁 minor-arcana/${folder.name}`)
          }
        })
      }
    }

    console.log('\n🎉 塔羅牌儲存系統設置完成!')
    console.log('\n📝 現在你可以:')
    console.log('   1. 使用 tarotStorage.getTarotCardUrl() 獲取圖片 URL')
    console.log('   2. 使用 tarotStorage.uploadTarotCard() 上傳圖片')
    console.log('   3. 使用 tarotStorage.listTarotCards() 列出圖片')
    console.log('   4. 直接訪問: https://dxnfkfljryacxpzlncem.supabase.co/storage/v1/object/public/tarot-cards/')

    return true

  } catch (error) {
    console.error('❌ 設置過程中發生錯誤:', error.message)
    return false
  }
}

setupCompleteStorage()