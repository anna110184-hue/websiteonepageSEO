import { supabase } from '../lib/supabase/client.js'

console.log('📁 創建塔羅牌資料夾結構...')

async function createTarotFolders() {
  try {
    // 創建資料夾結構（通過上傳空文件來創建資料夾）
    const folders = [
      'major-arcana/.gitkeep',
      'minor-arcana/cups/.gitkeep',
      'minor-arcana/swords/.gitkeep',
      'minor-arcana/wands/.gitkeep',
      'minor-arcana/pentacles/.gitkeep'
    ]

    const emptyFile = new Blob(['# 此文件用於創建資料夾結構'], { type: 'text/plain' })

    console.log('正在創建資料夾...')

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

    // 驗證資料夾結構
    console.log('\n🔍 驗證資料夾結構...')

    const { data: files, error: listError } = await supabase.storage
      .from('tarot-cards')
      .list('', { limit: 100 })

    if (listError) {
      console.error('❌ 無法列出檔案:', listError.message)
      return false
    }

    if (files && files.length > 0) {
      console.log('\n📂 已創建的資料夾:')
      files.forEach(file => {
        console.log(`   📁 ${file.name}`)
      })

      // 檢查 minor-arcana 子資料夾
      const { data: minorFiles, error: minorError } = await supabase.storage
        .from('tarot-cards')
        .list('minor-arcana', { limit: 100 })

      if (!minorError && minorFiles) {
        console.log('\n📂 minor-arcana 子資料夾:')
        minorFiles.forEach(file => {
          console.log(`   📁 minor-arcana/${file.name}`)
        })
      }
    }

    console.log('\n🎉 資料夾結構創建完成!')

    return true

  } catch (error) {
    console.error('❌ 創建資料夾時發生錯誤:', error.message)
    return false
  }
}

// 執行函數
createTarotFolders()