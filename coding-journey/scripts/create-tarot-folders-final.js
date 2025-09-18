import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

console.log('📁 創建塔羅牌資料夾結構 (使用圖片格式)...')

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

async function createFoldersWithImages() {
  try {
    // 創建 1x1 透明 PNG 作為資料夾佔位符
    const createTransparentPNG = () => {
      // 最小的透明 PNG (1x1 pixel)
      const pngData = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ])
      return new Blob([pngData], { type: 'image/png' })
    }

    const folders = [
      'major-arcana/.placeholder.png',
      'minor-arcana/cups/.placeholder.png',
      'minor-arcana/swords/.placeholder.png',
      'minor-arcana/wands/.placeholder.png',
      'minor-arcana/pentacles/.placeholder.png'
    ]

    const placeholderImage = createTransparentPNG()

    for (const folderPath of folders) {
      const { error: uploadError } = await supabaseAdmin.storage
        .from('tarot-cards')
        .upload(folderPath, placeholderImage, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        if (uploadError.message.includes('already exists')) {
          console.log(`✅ 資料夾 ${folderPath.replace('/.placeholder.png', '')} 已存在`)
        } else {
          console.error(`❌ 創建資料夾 ${folderPath} 失敗:`, uploadError.message)
        }
      } else {
        console.log(`✅ 創建資料夾: ${folderPath.replace('/.placeholder.png', '')}`)
      }
    }

    console.log('\n🔍 驗證資料夾結構...')

    // 列出根目錄
    const { data: rootItems, error: rootError } = await supabaseAdmin.storage
      .from('tarot-cards')
      .list('', { limit: 100 })

    if (!rootError && rootItems) {
      console.log('\n📂 根目錄:')
      rootItems.forEach(item => {
        console.log(`   📁 ${item.name}`)
      })
    }

    // 列出 minor-arcana 子目錄
    const { data: minorItems, error: minorError } = await supabaseAdmin.storage
      .from('tarot-cards')
      .list('minor-arcana', { limit: 100 })

    if (!minorError && minorItems) {
      console.log('\n📂 minor-arcana 子目錄:')
      minorItems.forEach(item => {
        console.log(`   📁 minor-arcana/${item.name}`)
      })
    }

    console.log('\n🎯 測試 URL 生成...')

    // 測試每個資料夾的 URL
    const testPaths = [
      'major-arcana/fool.jpg',
      'minor-arcana/cups/ace-of-cups.jpg',
      'minor-arcana/swords/king-of-swords.jpg',
      'minor-arcana/wands/ace-of-wands.jpg',
      'minor-arcana/pentacles/ten-of-pentacles.jpg'
    ]

    testPaths.forEach(path => {
      const { data } = supabaseAdmin.storage
        .from('tarot-cards')
        .getPublicUrl(path)

      console.log(`📄 ${path}`)
      console.log(`   URL: ${data.publicUrl}`)
    })

    console.log('\n🎉 資料夾結構創建完成!')
    console.log('\n📋 可用的資料夾路徑:')
    console.log('   📁 major-arcana/          - 22 張大阿爾克那牌')
    console.log('   📁 minor-arcana/cups/     - 14 張聖杯牌')
    console.log('   📁 minor-arcana/swords/   - 14 張寶劍牌')
    console.log('   📁 minor-arcana/wands/    - 14 張權杖牌')
    console.log('   📁 minor-arcana/pentacles/ - 14 張金幣牌')

    return true

  } catch (error) {
    console.error('❌ 創建資料夾時發生錯誤:', error.message)
    return false
  }
}

createFoldersWithImages()