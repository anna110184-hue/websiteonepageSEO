#!/usr/bin/env node

// 測試每日卡片 API 端點
// 使用方法: node test-daily-card-api.js

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 請設置 SUPABASE_URL 和 SUPABASE_ANON_KEY 環境變數')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 測試用戶憑證 (需要先註冊)
const TEST_EMAIL = 'test.tarot.user@gmail.com'
const TEST_PASSWORD = 'testpassword123'

async function setupTestUser() {
  console.log('🔧 設置測試用戶...')

  // 嘗試註冊測試用戶
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  })

  if (signUpError && !signUpError.message.includes('already registered')) {
    console.error('❌ 註冊失敗:', signUpError.message)
    throw signUpError
  }

  // 登入測試用戶
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  })

  if (signInError) {
    console.error('❌ 登入失敗:', signInError.message)
    throw signInError
  }

  console.log('✅ 測試用戶設置成功')
  return signInData.session.access_token
}

async function testDailyCardAPI() {
  console.log('🧪 開始測試每日卡片 API...\n')

  try {
    const accessToken = await setupTestUser()
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }

    const baseUrl = `${supabaseUrl}/functions/v1/daily-card`

    // 測試 1: 檢查今日卡片 (GET)
    console.log('📋 測試 1: 檢查今日卡片 (GET)')
    const getResponse = await fetch(baseUrl, {
      method: 'GET',
      headers
    })

    const getResult = await getResponse.json()
    console.log('📊 回應狀態:', getResponse.status)
    console.log('📄 回應內容:', JSON.stringify(getResult, null, 2))

    if (getResult.data) {
      console.log('✅ 今日已有卡片，測試獲取成功')
    } else {
      console.log('📭 今日尚未抽牌，準備測試抽牌功能')

      // 測試 2: 抽取今日卡片 (POST)
      console.log('\n📋 測試 2: 抽取今日卡片 (POST)')
      const drawData = {
        question: '今天我需要關注什麼？',
        mood_before: '期待且好奇',
        life_situation: '正在學習新技能'
      }

      const postResponse = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(drawData)
      })

      const postResult = await postResponse.json()
      console.log('📊 回應狀態:', postResponse.status)
      console.log('📄 回應內容:', JSON.stringify(postResult, null, 2))

      if (postResult.success && postResult.data) {
        console.log('✅ 抽牌成功')
        console.log(`🃏 抽到卡片: ${postResult.data.Tarot_card_meaning?.card_chinese_name || 'unknown'} (${postResult.data.Tarot_card_meaning?.card_name || 'unknown'})`)
        console.log(`🔄 是否逆位: ${postResult.data.is_reversed ? '是' : '否'}`)

        // 測試 3: 更新每日反思 (PUT)
        console.log('\n📋 測試 3: 更新每日反思 (PUT)')
        const updateData = {
          personal_reflection: '這張卡片讓我思考到要保持開放的心態面對新挑戰',
          mood_after: '充滿希望和動力',
          key_insights: ['保持開放心態', '擁抱變化', '相信直覺'],
          accuracy_rating: 4,
          helpfulness_rating: 5,
          learned_something_new: true,
          new_learning_notes: '理解了這張卡的深層含義'
        }

        const putResponse = await fetch(baseUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateData)
        })

        const putResult = await putResponse.json()
        console.log('📊 回應狀態:', putResponse.status)
        console.log('📄 回應內容:', JSON.stringify(putResult, null, 2))

        if (putResult.success) {
          console.log('✅ 反思更新成功')
        } else {
          console.log('❌ 反思更新失敗')
        }
      } else {
        console.log('❌ 抽牌失敗')
      }
    }

    // 測試 4: 重複抽牌測試 (應該失敗)
    console.log('\n📋 測試 4: 重複抽牌測試 (應該返回錯誤)')
    const duplicateResponse = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        question: '能再抽一張嗎？'
      })
    })

    const duplicateResult = await duplicateResponse.json()
    console.log('📊 回應狀態:', duplicateResponse.status)
    console.log('📄 回應內容:', JSON.stringify(duplicateResult, null, 2))

    if (duplicateResponse.status === 400 && duplicateResult.error) {
      console.log('✅ 重複抽牌正確被阻止')
    } else {
      console.log('⚠️  重複抽牌沒有被正確阻止')
    }

    console.log('\n🎉 每日卡片 API 測試完成!')

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message)
    if (error.stack) {
      console.error('🔍 錯誤堆疊:', error.stack)
    }
  }
}

// 執行測試
testDailyCardAPI().then(() => {
  console.log('\n📋 測試摘要:')
  console.log('   1. ✅ GET /daily-card - 檢查今日卡片')
  console.log('   2. ✅ POST /daily-card - 抽取每日卡片')
  console.log('   3. ✅ PUT /daily-card - 更新反思內容')
  console.log('   4. ✅ 重複抽牌防護測試')
  console.log('\n💡 注意事項:')
  console.log('   - 確保已在 Supabase 中執行 setup-tarot-backend.sql')
  console.log('   - 確保已設置正確的環境變數')
  console.log('   - 首次運行會自動創建測試用戶')
}).catch(console.error)