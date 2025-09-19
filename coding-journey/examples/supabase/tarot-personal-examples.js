// 個人化塔羅牌功能使用範例
import {
  personalInterpretations,
  wisdomCollection,
  dailyInspiration,
  enhancedCards
} from '../../lib/supabase/tarot-personal.js'

console.log('🌟 個人化塔羅牌功能範例')

// 範例 1: 獲取每日智慧
async function getDailyWisdomExample() {
  console.log('\n✨ 範例 1: 獲取每日智慧')

  try {
    const { data: wisdom, error } = await enhancedCards.getDailyWisdom()

    if (error) {
      console.error('❌ 獲取每日智慧失敗:', error.message)
      return
    }

    if (wisdom && wisdom.length > 0) {
      const card = wisdom[0]
      console.log('🔮 今日智慧卡片:')
      console.log(`   🃏 ${card.card_name_zh}`)
      console.log(`   💭 智慧話語: ${card.wisdom_text || '暫無'}`)
      console.log(`   🌟 肯定語句: ${card.affirmation || '暫無'}`)
      console.log(`   🤔 反思問題: ${card.reflection_question || '暫無'}`)
    } else {
      console.log('📭 暫無每日智慧資料')
    }

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 2: 獲取隨機智慧話語
async function getRandomWisdomExample() {
  console.log('\n💫 範例 2: 獲取隨機智慧話語')

  try {
    const { data: wisdomList, error } = await wisdomCollection.getRandomWisdom('affirmation', 3)

    if (error) {
      console.error('❌ 獲取智慧話語失敗:', error.message)
      return
    }

    if (wisdomList && wisdomList.length > 0) {
      console.log(`✅ 找到 ${wisdomList.length} 條智慧話語:`)
      wisdomList.forEach((wisdom, index) => {
        console.log(`   ${index + 1}. 🎭 ${wisdom.tarot_cards?.name_zh || '未知卡片'}`)
        console.log(`      💭 "${wisdom.wisdom_text}"`)
        console.log(`      🏷️  類型: ${wisdom.wisdom_type}`)
      })
    } else {
      console.log('📭 暫無智慧話語資料')
    }

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 3: 添加個人解釋
async function addPersonalInterpretationExample() {
  console.log('\n📝 範例 3: 添加個人解釋')

  try {
    // 這是一個示例，實際使用時需要真實的卡牌ID
    const demoCardId = 'demo-card-id'
    const demoUserId = 'demo-user-id'

    const personalData = {
      personal_meaning: "這張卡片在我生命中代表著新的開始和勇氣。",
      personal_experience: "當我第一次看到這張卡片時，正好是我決定換工作的時候。",
      emotional_response: "感到興奮和一點點緊張，但主要是充滿希望。",
      learning_insights: ["勇氣比完美的計劃更重要", "有時候跳躍比等待更好"],
      life_context: "正在考慮人生重大改變的時期",
      mood_state: "樂觀但謹慎"
    }

    // 注意：這只是示例代碼，實際執行會因為沒有真實ID而失敗
    console.log('📋 示例個人解釋資料:')
    console.log(`   💭 個人意義: ${personalData.personal_meaning}`)
    console.log(`   📖 個人經驗: ${personalData.personal_experience}`)
    console.log(`   💝 情感反應: ${personalData.emotional_response}`)
    console.log(`   🎓 學習洞察: ${personalData.learning_insights.join(', ')}`)

    console.log('\n💡 要執行此功能，請先設置真實的卡牌ID和用戶ID')

    // const { data, error } = await personalInterpretations.addPersonalInterpretation(
    //   demoCardId,
    //   personalData,
    //   demoUserId
    // )

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 4: 獲取今日靈感
async function getTodayInspirationExample() {
  console.log('\n🌅 範例 4: 獲取今日靈感')

  try {
    const { data: inspiration, error } = await dailyInspiration.getTodayInspiration()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('📭 今日尚未設置靈感卡片')
      } else {
        console.error('❌ 獲取今日靈感失敗:', error.message)
      }
      return
    }

    if (inspiration) {
      console.log('🌟 今日靈感:')
      console.log(`   🃏 卡片: ${inspiration.tarot_cards?.name_zh || '未知'}`)
      console.log(`   🌅 晨間反思: ${inspiration.morning_reflection || '暫無'}`)
      console.log(`   🌙 晚間感恩: ${inspiration.evening_gratitude || '暫無'}`)
      console.log(`   🎯 每日意圖: ${inspiration.daily_intention || '暫無'}`)
      console.log(`   🧘 正念時刻: ${inspiration.mindful_moment || '暫無'}`)
    }

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 5: 根據能量頻率搜尋卡牌
async function getCardsByEnergyExample() {
  console.log('\n⚡ 範例 5: 根據能量頻率搜尋卡牌')

  try {
    const { data: highEnergyCards, error } = await enhancedCards.getCardsByEnergyFrequency('high')

    if (error) {
      console.error('❌ 搜尋高能量卡牌失敗:', error.message)
      return
    }

    if (highEnergyCards && highEnergyCards.length > 0) {
      console.log(`✅ 找到 ${highEnergyCards.length} 張高能量卡牌:`)
      highEnergyCards.slice(0, 5).forEach(card => {
        console.log(`   ⚡ ${card.name_zh} (${card.name_en})`)
        console.log(`      🌈 振動顏色: ${card.vibration_color || '未設定'}`)
        console.log(`      🔮 脈輪連結: ${card.chakra_connection || '未設定'}`)
      })

      if (highEnergyCards.length > 5) {
        console.log(`   ... 還有 ${highEnergyCards.length - 5} 張`)
      }
    } else {
      console.log('📭 暫無高能量卡牌資料')
    }

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 6: 創建每日靈感
async function createDailyInspirationExample() {
  console.log('\n🎨 範例 6: 創建每日靈感')

  try {
    // 這是示例代碼，需要真實的卡牌ID
    const demoCardId = 'demo-card-id'

    const inspirationData = {
      morning_reflection: "今天我選擇以開放的心態迎接所有的可能性。",
      evening_gratitude: "感謝今天遇到的每一個學習機會。",
      daily_intention: "我要以愛和善意對待自己和他人。",
      mindful_moment: "當我感到壓力時，我會深呼吸並回到當下。",
      moon_phase: "滿月",
      season: "春天"
    }

    console.log('📋 示例每日靈感資料:')
    console.log(`   🌅 晨間反思: ${inspirationData.morning_reflection}`)
    console.log(`   🌙 晚間感恩: ${inspirationData.evening_gratitude}`)
    console.log(`   🎯 每日意圖: ${inspirationData.daily_intention}`)
    console.log(`   🧘 正念時刻: ${inspirationData.mindful_moment}`)
    console.log(`   🌕 月相: ${inspirationData.moon_phase}`)
    console.log(`   🌸 季節: ${inspirationData.season}`)

    console.log('\n💡 要執行此功能，請先設置真實的卡牌ID')

    // const { data, error } = await dailyInspiration.createDailyInspiration(
    //   demoCardId,
    //   inspirationData
    // )

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 7: 添加智慧話語
async function addWisdomExample() {
  console.log('\n💎 範例 7: 添加智慧話語')

  try {
    const demoCardId = 'demo-card-id'

    const wisdomData = {
      wisdom_text: "真正的智慧來自於接受未知，並在其中找到平靜。",
      wisdom_type: "quote",
      interpretation_type: "upright",
      source_tradition: "現代塔羅",
      wisdom_category: "靈性成長",
      language: "zh"
    }

    console.log('📋 示例智慧話語資料:')
    console.log(`   💭 智慧文字: ${wisdomData.wisdom_text}`)
    console.log(`   🏷️  類型: ${wisdomData.wisdom_type}`)
    console.log(`   📍 詮釋類型: ${wisdomData.interpretation_type}`)
    console.log(`   🌍 來源傳統: ${wisdomData.source_tradition}`)
    console.log(`   📂 分類: ${wisdomData.wisdom_category}`)

    console.log('\n💡 要執行此功能，請先設置真實的卡牌ID')

    // const { data, error } = await wisdomCollection.addWisdom(demoCardId, wisdomData)

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 執行所有範例
async function runPersonalExamples() {
  console.log('🚀 開始執行個人化塔羅牌範例...')

  // 注意: 這些範例需要先完成個人化資料庫設置

  await getDailyWisdomExample()
  await getRandomWisdomExample()
  await addPersonalInterpretationExample()
  await getTodayInspirationExample()
  await getCardsByEnergyExample()
  await createDailyInspirationExample()
  await addWisdomExample()

  console.log('\n📋 要完整使用這些功能，請先:')
  console.log('1. 在 Supabase SQL Editor 執行 create-tarot-database-schema.sql')
  console.log('2. 在 Supabase SQL Editor 執行 enhance-tarot-database-personal.sql')
  console.log('3. 執行 node scripts/populate-tarot-data.js')
  console.log('4. 執行 node scripts/populate-personal-tarot-data.js')
}

runPersonalExamples()

export {
  getDailyWisdomExample,
  getRandomWisdomExample,
  addPersonalInterpretationExample,
  getTodayInspirationExample,
  getCardsByEnergyExample,
  createDailyInspirationExample,
  addWisdomExample
}