import { supabase } from '../lib/supabase/client.js'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 檢查 Supabase Storage (包含 S3 配置)...')

async function checkStorageWithS3() {
  try {
    console.log('🔗 配置資訊:')
    console.log(`   Supabase URL: ${process.env.SUPABASE_URL}`)
    console.log(`   Anon Key: ${process.env.SUPABASE_ANON_KEY ? '✅ 已設定' : '❌ 未設定'}`)
    console.log(`   S3 Access Key: ${process.env.S3_ACCESS_KEY ? '✅ 已設定' : '❌ 未設定'}`)

    // 測試基本 Storage 連線
    console.log('\n📦 測試 Storage 連線...')

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Storage 連線失敗:', bucketsError.message)

      // 嘗試不同的方法
      console.log('\n🔄 嘗試其他方法檢查 Storage...')

      // 檢查是否有 service role key 需求
      if (bucketsError.message.includes('JWT') || bucketsError.message.includes('unauthorized')) {
        console.log('💡 可能需要 Service Role Key 來管理 buckets')
        console.log('   在 Supabase Dashboard → Settings → API 可以找到 service_role key')
        return false
      }

      return false
    }

    console.log(`✅ Storage 連線成功！找到 ${buckets.length} 個 buckets`)

    if (buckets.length === 0) {
      console.log('\n📝 沒有找到任何 buckets，但連線正常')
      console.log('💡 可以嘗試手動創建 bucket')
    } else {
      console.log('\n📁 現有 buckets:')
      buckets.forEach(bucket => {
        console.log(`   📦 ${bucket.name}`)
        console.log(`      - 公開: ${bucket.public}`)
        console.log(`      - 建立時間: ${bucket.created_at}`)
        console.log(`      - 更新時間: ${bucket.updated_at}`)
      })
    }

    // 檢查是否有 tarot-cards bucket
    const tarotBucket = buckets.find(b => b.name === 'tarot-cards')

    if (tarotBucket) {
      console.log('\n🎯 找到 tarot-cards bucket!')
      console.log(`   公開訪問: ${tarotBucket.public}`)

      // 測試上傳功能
      console.log('\n🧪 測試上傳功能...')

      const testFile = new Blob(['Test file content'], { type: 'text/plain' })
      const testPath = 'test-file.txt'

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tarot-cards')
        .upload(testPath, testFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('❌ 上傳測試失敗:', uploadError.message)
        if (uploadError.message.includes('policy')) {
          console.log('💡 需要設置 Storage Policies')
        }
      } else {
        console.log('✅ 上傳測試成功!')

        // 取得公開 URL
        const { data: urlData } = supabase.storage
          .from('tarot-cards')
          .getPublicUrl(testPath)

        console.log(`📄 測試檔案 URL: ${urlData.publicUrl}`)

        // 清理測試檔案
        await supabase.storage.from('tarot-cards').remove([testPath])
        console.log('🧹 測試檔案已清理')
      }
    } else {
      console.log('\n❌ 沒有找到 tarot-cards bucket')

      // 嘗試創建 bucket
      console.log('\n🛠️  嘗試創建 tarot-cards bucket...')

      const { data: createData, error: createError } = await supabase.storage.createBucket('tarot-cards', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      })

      if (createError) {
        console.error('❌ 無法創建 bucket:', createError.message)
        if (createError.message.includes('policy') || createError.message.includes('permission')) {
          console.log('💡 可能需要管理員權限或 service role key')
        }
      } else {
        console.log('✅ 成功創建 tarot-cards bucket!')
      }
    }

    return true

  } catch (error) {
    console.error('❌ 檢查過程發生錯誤:', error.message)
    return false
  }
}

checkStorageWithS3()