import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

console.log('🗄️  設置塔羅牌資料庫...')

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function setupTarotDatabase() {
  try {
    console.log('\n📋 Step 1: 執行資料庫 schema...')

    // 讀取 SQL 檔案
    const sqlSchema = readFileSync('./scripts/create-tarot-database-schema.sql', 'utf8')

    // 分割 SQL 語句 (簡單分割，基於分號)
    const sqlStatements = sqlSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`執行 ${sqlStatements.length} 個 SQL 語句...`)

    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i]
      if (statement.trim()) {
        try {
          const { error } = await admin.from('_').select('*').limit(0) // 測試連線

          // 使用 RPC 執行 SQL (如果支援)
          console.log(`執行語句 ${i + 1}/${sqlStatements.length}...`)

          // 由於無法直接執行 DDL，我們需要手動創建表格
          console.log('⚠️  需要在 Supabase Dashboard 手動執行 SQL')

        } catch (error) {
          console.error(`❌ 語句 ${i + 1} 執行失敗:`, error.message)
        }
      }
    }

    console.log('\n🔍 Step 2: 檢查表格是否存在...')

    // 嘗試檢查表格
    const tables = ['tarot_cards', 'card_meanings', 'tarot_spreads', 'tarot_readings']

    for (const tableName of tables) {
      try {
        const { data, error } = await admin
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`❌ 表格 '${tableName}' 不存在`)
          } else {
            console.log(`⚠️  表格 '${tableName}' 檢查失敗:`, error.message)
          }
        } else {
          console.log(`✅ 表格 '${tableName}' 存在且可訪問`)
        }
      } catch (err) {
        console.log(`❌ 無法檢查表格 '${tableName}':`, err.message)
      }
    }

    console.log('\n📝 由於 Supabase 限制，請手動在 SQL Editor 中執行以下步驟:')
    console.log('1. 前往 https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem/sql')
    console.log('2. 複製 create-tarot-database-schema.sql 的內容')
    console.log('3. 貼上並執行 SQL')
    console.log('4. 然後執行: node scripts/populate-tarot-data.js')

    return false // 表示需要手動執行

  } catch (error) {
    console.error('❌ 設置過程發生錯誤:', error.message)
    return false
  }
}

setupTarotDatabase()