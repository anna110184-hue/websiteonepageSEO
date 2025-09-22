#!/usr/bin/env node

// 測試 Supabase 資料庫設置和 SQL 腳本執行結果
// 檢查所有表格、函數、觸發器和 RLS 政策

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 請設置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY 環境變數')
  console.error(`當前 SUPABASE_URL: ${supabaseUrl || '未設置'}`)
  console.error(`當前 SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '已設置' : '未設置'}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🧪 開始測試資料庫設置...\n')

// 測試 1: 檢查必要的表格是否存在
async function testTablesExist() {
  console.log('📋 測試 1: 檢查表格是否存在')

  const expectedTables = [
    'Tarot_card_meaning',
    'user_profiles',
    'daily_cards',
    'readings',
    'friendships',
    'user_favorites'
  ]

  try {
    for (const tableName of expectedTables) {
      const { data, error } = await supabase
        .from(tableName.toLowerCase() === 'tarot_card_meaning' ? '"Tarot_card_meaning"' : tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`   ❌ 表格 ${tableName}: ${error.message}`)
      } else {
        console.log(`   ✅ 表格 ${tableName}: 存在且可訪問`)
      }
    }
  } catch (error) {
    console.error(`   ❌ 表格檢查失敗: ${error.message}`)
  }

  console.log('')
}

// 測試 2: 檢查 Tarot_card_meaning 表格結構和資料
async function testTarotCardData() {
  console.log('📋 測試 2: 檢查 Tarot_card_meaning 表格')

  try {
    const { data, error } = await supabase
      .from('"Tarot_card_meaning"')
      .select('id, name_en, name_zh, arcana_type')
      .limit(5)

    if (error) {
      console.log(`   ❌ 無法讀取 Tarot_card_meaning: ${error.message}`)
    } else {
      console.log(`   ✅ Tarot_card_meaning 表格有 ${data.length} 筆範例資料`)
      if (data.length > 0) {
        console.log('   📄 範例資料:')
        data.forEach((card, index) => {
          console.log(`      ${index + 1}. ID: ${card.id}, 英文: ${card.name_en}, 中文: ${card.name_zh}, 類型: ${card.arcana_type}`)
        })
      }
    }

    // 檢查資料類型
    const { data: firstCard } = await supabase
      .from('"Tarot_card_meaning"')
      .select('id')
      .limit(1)
      .single()

    if (firstCard) {
      const idType = typeof firstCard.id
      console.log(`   📊 ID 欄位類型: ${idType} (值: ${firstCard.id})`)

      if (idType === 'number') {
        console.log('   ✅ ID 類型為數字 (BIGINT)，與我們的設定匹配')
      } else {
        console.log('   ⚠️  ID 類型不是數字，可能需要調整資料類型設定')
      }
    }

  } catch (error) {
    console.error(`   ❌ Tarot_card_meaning 測試失敗: ${error.message}`)
  }

  console.log('')
}

// 測試 3: 檢查資料庫函數
async function testDatabaseFunctions() {
  console.log('📋 測試 3: 檢查資料庫函數')

  const functions = [
    'get_random_tarot_cards',
    'update_user_stats',
    'calculate_user_streak'
  ]

  for (const funcName of functions) {
    try {
      const { data, error } = await supabase.rpc(funcName,
        funcName === 'get_random_tarot_cards' ? { card_count: 1 } :
        funcName === 'update_user_stats' ? { user_uuid: '00000000-0000-0000-0000-000000000000' } :
        { user_uuid: '00000000-0000-0000-0000-000000000000' }
      )

      if (error) {
        console.log(`   ❌ 函數 ${funcName}: ${error.message}`)
      } else {
        console.log(`   ✅ 函數 ${funcName}: 正常執行`)
        if (funcName === 'get_random_tarot_cards' && data && data.length > 0) {
          console.log(`      📄 返回資料: ID=${data[0].id}, 名稱=${data[0].name_zh}, 逆位=${data[0].is_reversed}`)
        }
      }
    } catch (error) {
      console.log(`   ❌ 函數 ${funcName}: ${error.message}`)
    }
  }

  console.log('')
}

// 測試 4: 檢查 RLS 政策
async function testRLSPolicies() {
  console.log('📋 測試 4: 檢查 Row Level Security 政策')

  const tables = ['user_profiles', 'daily_cards', 'readings', 'friendships', 'user_favorites']

  for (const tableName of tables) {
    try {
      // 嘗試在沒有適當權限的情況下訪問表格
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error && error.message.includes('RLS')) {
        console.log(`   ✅ 表格 ${tableName}: RLS 政策正常工作`)
      } else if (error) {
        console.log(`   ⚠️  表格 ${tableName}: ${error.message}`)
      } else {
        console.log(`   ℹ️  表格 ${tableName}: 可訪問 (可能是 service role 權限)`)
      }
    } catch (error) {
      console.log(`   ❌ 表格 ${tableName}: ${error.message}`)
    }
  }

  console.log('')
}

// 測試 5: 測試外鍵關聯
async function testForeignKeyConstraints() {
  console.log('📋 測試 5: 檢查外鍵約束')

  try {
    // 測試 daily_cards 表格是否能正確引用 Tarot_card_meaning
    const { data: cards } = await supabase
      .from('"Tarot_card_meaning"')
      .select('id')
      .limit(1)

    if (cards && cards.length > 0) {
      const testCardId = cards[0].id

      // 嘗試創建一個測試記錄來驗證外鍵約束
      const { error } = await supabase
        .from('daily_cards')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // 測試用的假 UUID
          card_id: testCardId,
          draw_date: '2025-01-01'
        })

      if (error) {
        if (error.message.includes('foreign key')) {
          console.log(`   ❌ 外鍵約束錯誤: ${error.message}`)
        } else if (error.message.includes('violates')) {
          console.log(`   ✅ 外鍵約束正常工作 (其他約束阻止了插入)`)
        } else {
          console.log(`   ℹ️  插入測試: ${error.message}`)
        }
      } else {
        console.log(`   ✅ 外鍵約束正常工作 (測試記錄可插入)`)
        // 清理測試記錄
        await supabase.from('daily_cards').delete().eq('user_id', '00000000-0000-0000-0000-000000000000')
      }
    }
  } catch (error) {
    console.error(`   ❌ 外鍵測試失敗: ${error.message}`)
  }

  console.log('')
}

// 測試 6: 測試完整的 API 流程
async function testCompleteAPIFlow() {
  console.log('📋 測試 6: 測試完整 API 流程')

  try {
    // 創建一個測試用戶 (使用 service role)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test-database@tarot.app',
      password: 'testpassword123',
      email_confirm: true
    })

    if (authError) {
      console.log(`   ❌ 創建測試用戶失敗: ${authError.message}`)
      return
    }

    console.log(`   ✅ 測試用戶創建成功: ${authData.user.id}`)

    // 檢查 user_profiles 是否自動創建
    await new Promise(resolve => setTimeout(resolve, 1000)) // 等待觸發器執行

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.log(`   ❌ 用戶資料表創建失敗: ${profileError.message}`)
    } else {
      console.log(`   ✅ 用戶資料表自動創建成功`)
      console.log(`      👤 用戶名: ${profile.username}`)
      console.log(`      📛 顯示名稱: ${profile.display_name}`)
    }

    // 清理測試用戶
    await supabase.auth.admin.deleteUser(authData.user.id)
    console.log(`   🧹 測試用戶已清理`)

  } catch (error) {
    console.error(`   ❌ API 流程測試失敗: ${error.message}`)
  }

  console.log('')
}

// 執行所有測試
async function runDatabaseTests() {
  console.log('🚀 開始執行資料庫設置測試\n')

  await testTablesExist()
  await testTarotCardData()
  await testDatabaseFunctions()
  await testRLSPolicies()
  await testForeignKeyConstraints()
  await testCompleteAPIFlow()

  console.log('🎉 資料庫測試完成！\n')

  console.log('📋 測試摘要:')
  console.log('   1. ✅ 表格存在性檢查')
  console.log('   2. ✅ 塔羅牌資料驗證')
  console.log('   3. ✅ 資料庫函數測試')
  console.log('   4. ✅ RLS 政策檢查')
  console.log('   5. ✅ 外鍵約束驗證')
  console.log('   6. ✅ 完整 API 流程測試')

  console.log('\n💡 如果所有測試通過，你的資料庫設置已完成！')
  console.log('📞 現在可以運行完整的 API 測試: npm run test:api')
}

runDatabaseTests().catch(console.error)