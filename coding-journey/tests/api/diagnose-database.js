#!/usr/bin/env node

// 診斷 Supabase 資料庫實際狀況
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔍 診斷資料庫實際狀況...\n')

// 查看所有公共表格
async function listAllTables() {
  console.log('📋 1. 列出所有公共表格:')

  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (error) {
      console.log(`   ❌ 無法查詢系統表格: ${error.message}`)
      return []
    }

    if (data && data.length > 0) {
      console.log('   📄 找到的表格:')
      data.forEach(table => {
        console.log(`      - ${table.table_name}`)
      })
      return data.map(table => table.table_name)
    } else {
      console.log('   📭 沒有找到任何表格')
      return []
    }
  } catch (error) {
    console.log(`   ❌ 查詢失敗: ${error.message}`)
    return []
  }
}

// 直接嘗試不同的表格名稱變體
async function testTableVariants() {
  console.log('\n📋 2. 測試塔羅牌表格名稱變體:')

  const variants = [
    'tarot_card_meaning',
    'Tarot_card_meaning',
    '"Tarot_card_meaning"',
    'tarot_cards',
    'Tarot_Cards',
    'tarot_meanings'
  ]

  for (const variant of variants) {
    try {
      const { data, error } = await supabase
        .from(variant)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`   ❌ ${variant}: ${error.message}`)
      } else {
        console.log(`   ✅ ${variant}: 存在且可訪問`)
        if (data && data.length > 0) {
          console.log(`      📄 範例資料:`, Object.keys(data[0]))
        }
      }
    } catch (error) {
      console.log(`   ❌ ${variant}: ${error.message}`)
    }
  }
}

// 檢查已創建的函數
async function listFunctions() {
  console.log('\n📋 3. 檢查已創建的函數:')

  try {
    const { data, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public')
      .eq('routine_type', 'FUNCTION')

    if (error) {
      console.log(`   ❌ 無法查詢函數: ${error.message}`)
    } else if (data && data.length > 0) {
      console.log('   📄 找到的函數:')
      data.forEach(func => {
        console.log(`      - ${func.routine_name} (${func.routine_type})`)
      })
    } else {
      console.log('   📭 沒有找到自定義函數')
    }
  } catch (error) {
    console.log(`   ❌ 查詢失敗: ${error.message}`)
  }
}

// 檢查 RLS 設定
async function checkRLS() {
  console.log('\n📋 4. 檢查 RLS 設定:')

  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')

    if (error) {
      console.log(`   ❌ 無法查詢 RLS 設定: ${error.message}`)
    } else if (data && data.length > 0) {
      console.log('   📄 表格 RLS 狀態:')
      data.forEach(table => {
        console.log(`      - ${table.tablename}: ${table.rowsecurity ? '已啟用' : '未啟用'}`)
      })
    }
  } catch (error) {
    console.log(`   ❌ 查詢失敗: ${error.message}`)
  }
}

// 嘗試手動測試 get_random_tarot_cards 函數
async function testRandomCardsFunction() {
  console.log('\n📋 5. 手動測試 get_random_tarot_cards 函數:')

  try {
    // 嘗試不同的參數組合
    const { data, error } = await supabase.rpc('get_random_tarot_cards', {
      card_count: 1,
      allow_reversed: true,
      exclude_cards: []
    })

    if (error) {
      console.log(`   ❌ 函數執行失敗: ${error.message}`)
      console.log(`   💡 這可能表示塔羅牌表格名稱或結構有問題`)
    } else {
      console.log(`   ✅ 函數執行成功`)
      if (data && data.length > 0) {
        console.log(`   📄 返回資料:`, data[0])
      }
    }
  } catch (error) {
    console.log(`   ❌ 函數測試失敗: ${error.message}`)
  }
}

async function runDiagnosis() {
  console.log('🚀 開始資料庫診斷\n')

  const tables = await listAllTables()
  await testTableVariants()
  await listFunctions()
  await checkRLS()
  await testRandomCardsFunction()

  console.log('\n🎯 診斷總結:')
  console.log('   💡 請檢查上述輸出，找出：')
  console.log('      1. 塔羅牌表格的實際名稱')
  console.log('      2. 是否所有必要的函數都已創建')
  console.log('      3. RLS 政策是否正確啟用')
  console.log('      4. 外鍵關係是否正確設置')
}

runDiagnosis().catch(console.error)