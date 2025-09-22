#!/usr/bin/env node

// 檢查 Tarot_card_meaning 表格的實際資料
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔍 檢查 Tarot_card_meaning 表格資料...\n')

async function checkTarotData() {
  try {
    // 獲取所有資料
    const { data: allCards, error } = await supabase
      .from('Tarot_card_meaning')
      .select('*')

    if (error) {
      console.error('❌ 無法讀取資料:', error.message)
      return
    }

    console.log(`📊 表格總共有 ${allCards.length} 筆資料`)

    if (allCards.length > 0) {
      console.log('\n📄 範例資料 (前 3 筆):')
      allCards.slice(0, 3).forEach((card, index) => {
        console.log(`\n   ${index + 1}. 卡片資料:`)
        Object.entries(card).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`)
        })
      })

      console.log('\n📋 表格結構:')
      const firstCard = allCards[0]
      Object.keys(firstCard).forEach(column => {
        const value = firstCard[column]
        const type = typeof value
        console.log(`   - ${column}: ${type} (範例: ${value})`)
      })

      // 檢查 ID 範圍
      const ids = allCards.map(card => card.id).sort((a, b) => a - b)
      console.log(`\n🔢 ID 範圍: ${ids[0]} ~ ${ids[ids.length - 1]}`)
      console.log(`📈 ID 類型: ${typeof ids[0]}`)
    }

  } catch (error) {
    console.error('❌ 檢查失敗:', error.message)
  }
}

checkTarotData()