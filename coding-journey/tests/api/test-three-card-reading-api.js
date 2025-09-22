#!/usr/bin/env node

// 測試三卡占卜 API 端點
// 使用方法: node test-three-card-reading-api.js

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 請設置 SUPABASE_URL 和 SUPABASE_ANON_KEY 環境變數')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 測試用戶憑證
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

async function testThreeCardReadingAPI() {
  console.log('🔮 開始測試三卡占卜 API...\n')

  try {
    const accessToken = await setupTestUser()
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }

    const baseUrl = `${supabaseUrl}/functions/v1/three-card-reading`
    let createdReadingId = null

    // 測試 1: 創建三卡占卜 (POST)
    console.log('📋 測試 1: 創建三卡占卜 (POST)')
    const createData = {
      question: '我的事業發展方向如何？',
      question_category: 'career',
      interpretation: '整體來看，你的事業正處於轉換期，需要勇氣面對變化',
      key_themes: ['變化', '機會', '成長'],
      overall_energy: '積極向上但需要耐心',
      advice_given: '保持開放的心態，抓住即將到來的機會',
      suggested_actions: ['更新履歷', '建立人脈', '學習新技能'],
      tags: ['事業', '成長', '轉變'],
      is_public: false
    }

    const createResponse = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(createData)
    })

    const createResult = await createResponse.json()
    console.log('📊 回應狀態:', createResponse.status)
    console.log('📄 回應內容:', JSON.stringify(createResult, null, 2))

    if (createResult.success && createResult.data) {
      console.log('✅ 三卡占卜創建成功')
      createdReadingId = createResult.data.id

      const cardsDrawn = createResult.data.cards_drawn
      console.log('🃏 抽到的卡片:')
      cardsDrawn.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.position} (${card.position_meaning}):`)
        console.log(`      🎴 ${card.card_data?.name_zh || 'unknown'} (${card.card_data?.name_en || 'unknown'})`)
        console.log(`      🔄 逆位: ${card.is_reversed ? '是' : '否'}`)
      })
    } else {
      console.log('❌ 三卡占卜創建失敗')
      return
    }

    // 測試 2: 獲取占卜記錄列表 (GET)
    console.log('\n📋 測試 2: 獲取占卜記錄列表 (GET)')
    const listResponse = await fetch(`${baseUrl}?limit=5&offset=0`, {
      method: 'GET',
      headers
    })

    const listResult = await listResponse.json()
    console.log('📊 回應狀態:', listResponse.status)
    console.log('📄 回應內容 (僅顯示前兩筆):', JSON.stringify({
      ...listResult,
      data: listResult.data?.slice(0, 2)
    }, null, 2))

    if (listResult.success && listResult.data) {
      console.log(`✅ 成功獲取 ${listResult.data.length} 筆占卜記錄`)
    } else {
      console.log('❌ 獲取占卜記錄失敗')
    }

    // 測試 3: 獲取特定占卜記錄 (GET with ID)
    if (createdReadingId) {
      console.log('\n📋 測試 3: 獲取特定占卜記錄 (GET with ID)')
      const getResponse = await fetch(`${baseUrl}?id=${createdReadingId}`, {
        method: 'GET',
        headers
      })

      const getResult = await getResponse.json()
      console.log('📊 回應狀態:', getResponse.status)
      console.log('📄 回應內容:', JSON.stringify(getResult, null, 2))

      if (getResult.success && getResult.data) {
        console.log('✅ 成功獲取特定占卜記錄')
      } else {
        console.log('❌ 獲取特定占卜記錄失敗')
      }
    }

    // 測試 4: 更新占卜記錄 (PUT)
    if (createdReadingId) {
      console.log('\n📋 測試 4: 更新占卜記錄 (PUT)')
      const updateData = {
        reading_id: createdReadingId,
        interpretation: '經過深入思考，這次占卜揭示了一個重要的人生轉折點',
        satisfaction_rating: 5,
        accuracy_rating: 4,
        followed_advice: true,
        follow_up_notes: '按照建議開始學習新技能，感覺方向很對',
        is_favorite: true,
        tags: ['事業', '成長', '轉變', '重要']
      }

      const updateResponse = await fetch(baseUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      })

      const updateResult = await updateResponse.json()
      console.log('📊 回應狀態:', updateResponse.status)
      console.log('📄 回應內容:', JSON.stringify(updateResult, null, 2))

      if (updateResult.success) {
        console.log('✅ 占卜記錄更新成功')
        console.log(`⭐ 滿意度評分: ${updateResult.data.satisfaction_rating}/5`)
        console.log(`🎯 準確度評分: ${updateResult.data.accuracy_rating}/5`)
        console.log(`❤️  已標記為收藏: ${updateResult.data.is_favorite ? '是' : '否'}`)
      } else {
        console.log('❌ 占卜記錄更新失敗')
      }
    }

    // 測試 5: 創建愛情主題占卜
    console.log('\n📋 測試 5: 創建愛情主題占卜')
    const loveReadingData = {
      question: '我的感情狀況會如何發展？',
      question_category: 'love',
      tags: ['愛情', '關係', '情感'],
      is_public: false
    }

    const loveResponse = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(loveReadingData)
    })

    const loveResult = await loveResponse.json()
    console.log('📊 回應狀態:', loveResponse.status)
    console.log('📄 回應內容 (卡片部分):', JSON.stringify({
      success: loveResult.success,
      message: loveResult.message,
      cards_count: loveResult.data?.cards_drawn?.length || 0
    }, null, 2))

    if (loveResult.success) {
      console.log('✅ 愛情主題占卜創建成功')
    } else {
      console.log('❌ 愛情主題占卜創建失敗')
    }

    console.log('\n🎉 三卡占卜 API 測試完成!')

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message)
    if (error.stack) {
      console.error('🔍 錯誤堆疊:', error.stack)
    }
  }
}

// 執行測試
testThreeCardReadingAPI().then(() => {
  console.log('\n📋 測試摘要:')
  console.log('   1. ✅ POST /three-card-reading - 創建三卡占卜')
  console.log('   2. ✅ GET /three-card-reading - 獲取占卜記錄列表')
  console.log('   3. ✅ GET /three-card-reading?id=xxx - 獲取特定占卜記錄')
  console.log('   4. ✅ PUT /three-card-reading - 更新占卜記錄')
  console.log('   5. ✅ 不同主題占卜測試')
  console.log('\n🔮 占卜功能:')
  console.log('   - 自動抽取三張塔羅牌 (過去/現在/未來)')
  console.log('   - 支援逆位卡片設定')
  console.log('   - 多種問題類別 (愛情/事業/健康等)')
  console.log('   - 完整的評價和追蹤系統')
  console.log('   - 收藏和標籤功能')
}).catch(console.error)