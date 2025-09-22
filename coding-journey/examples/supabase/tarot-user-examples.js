// 塔羅牌用戶系統使用範例
import {
  userProfiles,
  dailyCards,
  readings,
  learningProgress,
  userInteractions
} from '../../lib/supabase/tarot-user-system.js'

console.log('👤 塔羅牌用戶系統範例')

// 範例 1: 用戶資料管理
async function userProfileExample() {
  console.log('\n👤 範例 1: 用戶資料管理')

  try {
    // 獲取當前用戶資料
    const { data: profile, error: profileError } = await userProfiles.getCurrentUserProfile()

    if (profileError) {
      if (profileError.message.includes('用戶未登入')) {
        console.log('⚠️  需要用戶登入才能使用此功能')
        return
      }
      console.error('❌ 獲取用戶資料失敗:', profileError.message)
      return
    }

    if (profile) {
      console.log('✅ 用戶資料:')
      console.log(`   👤 用戶名: ${profile.username || '未設定'}`)
      console.log(`   📛 顯示名稱: ${profile.display_name || '未設定'}`)
      console.log(`   🎭 會員類型: ${profile.member_type}`)
      console.log(`   📊 總占卜次數: ${profile.total_readings}`)
      console.log(`   🗓️  每日卡片數: ${profile.total_daily_cards}`)
      console.log(`   🔥 連續天數: ${profile.streak_days}`)
      console.log(`   🎓 學習等級: ${profile.learning_level}`)
    } else {
      console.log('📭 用戶資料不存在，可能需要創建')
    }

    // 示例：更新用戶偏好
    console.log('\n📝 示例：更新用戶偏好設定')
    const examplePreferences = {
      notifications: {
        daily_reminder: true,
        weekly_summary: true,
        reading_insights: false
      },
      privacy: {
        show_profile: true,
        share_readings: false
      },
      language: 'zh',
      deck: 'rider_waite'
    }

    console.log('📋 示例偏好設定:')
    console.log(`   🔔 通知設定: ${JSON.stringify(examplePreferences.notifications)}`)
    console.log(`   🔒 隱私設定: ${JSON.stringify(examplePreferences.privacy)}`)
    console.log(`   🌍 語言: ${examplePreferences.language}`)
    console.log(`   🃏 偏好牌組: ${examplePreferences.deck}`)

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 2: 每日卡片系統
async function dailyCardExample() {
  console.log('\n🗓️  範例 2: 每日卡片系統')

  try {
    // 檢查今日是否已抽牌
    const { data: todayCard, error: checkError } = await dailyCards.checkTodayCard()

    if (checkError && !checkError.message.includes('No rows')) {
      console.error('❌ 檢查今日卡片失敗:', checkError.message)
      return
    }

    if (todayCard) {
      console.log('✅ 今日已抽牌:')
      console.log(`   🃏 卡片: ${todayCard.tarot_cards?.name_zh} (${todayCard.tarot_cards?.name_en})`)
      console.log(`   🔄 逆位: ${todayCard.is_reversed ? '是' : '否'}`)
      console.log(`   📅 日期: ${todayCard.draw_date}`)
      console.log(`   💭 反思: ${todayCard.personal_reflection || '尚未填寫'}`)
    } else {
      console.log('📭 今日尚未抽牌')
      console.log('💡 可以調用 dailyCards.drawTodayCard() 來抽取今日卡片')
    }

    // 示例：抽牌選項
    console.log('\n🎲 示例：抽牌設定')
    const drawOptions = {
      allowReversed: true,
      question: '今天我需要關注什麼？',
      moodBefore: '平靜但充滿期待'
    }

    console.log('📋 抽牌選項:')
    console.log(`   🔄 允許逆位: ${drawOptions.allowReversed}`)
    console.log(`   ❓ 問題: ${drawOptions.question}`)
    console.log(`   😊 抽牌前心情: ${drawOptions.moodBefore}`)

    // 示例：反思內容
    console.log('\n📝 示例：每日反思')
    const reflectionExample = {
      reflection: '今天這張卡片提醒我要保持開放的心態，勇敢面對未知的挑戰。',
      moodAfter: '充滿希望和勇氣',
      insights: ['勇氣比完美的計劃更重要', '相信直覺的指引'],
      accuracyRating: 4,
      helpfulnessRating: 5,
      learnedNew: true,
      learningNotes: '第一次理解到愚者牌的深層含義'
    }

    console.log('💭 反思內容:')
    console.log(`   📖 反思: ${reflectionExample.reflection}`)
    console.log(`   😊 抽牌後心情: ${reflectionExample.moodAfter}`)
    console.log(`   💡 洞察: ${reflectionExample.insights.join(', ')}`)
    console.log(`   ⭐ 準確度評分: ${reflectionExample.accuracyRating}/5`)
    console.log(`   🎯 幫助度評分: ${reflectionExample.helpfulnessRating}/5`)

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 3: 占卜記錄系統
async function readingExample() {
  console.log('\n🔮 範例 3: 占卜記錄系統')

  try {
    // 示例：創建占卜記錄
    console.log('📝 示例：占卜記錄資料')
    const exampleReading = {
      type: 'three_card_spread',
      question: '我的事業發展方向如何？',
      category: 'career',
      cardsDrawn: [
        {
          card_id: 'card-uuid-1',
          position: 'past',
          is_reversed: false,
          position_meaning: '過去的影響'
        },
        {
          card_id: 'card-uuid-2',
          position: 'present',
          is_reversed: true,
          position_meaning: '現在的狀況'
        },
        {
          card_id: 'card-uuid-3',
          position: 'future',
          is_reversed: false,
          position_meaning: '未來的趨勢'
        }
      ],
      interpretation: '整體來看，你的事業正處於轉換期...',
      themes: ['變化', '機會', '成長'],
      energy: '積極向上但需要耐心',
      advice: '保持開放的心態，抓住即將到來的機會',
      actions: ['更新履歷', '建立人脈', '學習新技能'],
      isPublic: false,
      tags: ['事業', '成長', '轉變'],
      deck: 'rider_waite'
    }

    console.log('🔮 占卜記錄詳細:')
    console.log(`   📋 類型: ${exampleReading.type}`)
    console.log(`   ❓ 問題: ${exampleReading.question}`)
    console.log(`   📂 類別: ${exampleReading.category}`)
    console.log(`   🃏 抽牌數: ${exampleReading.cardsDrawn.length}`)
    console.log(`   📖 解釋: ${exampleReading.interpretation}`)
    console.log(`   🎭 主題: ${exampleReading.themes.join(', ')}`)
    console.log(`   ⚡ 整體能量: ${exampleReading.energy}`)
    console.log(`   💡 建議: ${exampleReading.advice}`)
    console.log(`   📋 行動步驟: ${exampleReading.actions.join(', ')}`)

    // 示例：評價占卜
    console.log('\n⭐ 示例：占卜評價')
    const ratingExample = {
      satisfaction: 4,
      accuracy: 5,
      followedAdvice: true,
      outcomeNotes: '按照建議行動後，確實獲得了新的工作機會'
    }

    console.log('📊 評價內容:')
    console.log(`   😊 滿意度: ${ratingExample.satisfaction}/5`)
    console.log(`   🎯 準確度: ${ratingExample.accuracy}/5`)
    console.log(`   ✅ 是否遵循建議: ${ratingExample.followedAdvice ? '是' : '否'}`)
    console.log(`   📝 結果筆記: ${ratingExample.outcomeNotes}`)

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 4: 學習進度追踪
async function learningProgressExample() {
  console.log('\n📚 範例 4: 學習進度追踪')

  try {
    // 示例：學習進度資料
    console.log('📖 示例：學習進度記錄')
    const progressExamples = [
      {
        contentType: 'card_meaning',
        contentId: 'the_fool',
        progressData: {
          status: 'completed',
          progress_percentage: 100,
          study_time_minutes: 45,
          practice_count: 3,
          quiz_scores: [80, 90, 95],
          personal_notes: '愚者牌代表新開始，我深刻理解了它的意義',
          difficulty_rating: 2
        }
      },
      {
        contentType: 'spread_technique',
        contentId: 'three_card_spread',
        progressData: {
          status: 'in_progress',
          progress_percentage: 75,
          study_time_minutes: 120,
          practice_count: 8,
          personal_notes: '三牌陣的解讀技巧正在提升中',
          difficulty_rating: 3
        }
      }
    ]

    progressExamples.forEach((example, index) => {
      console.log(`\n📘 學習項目 ${index + 1}:`)
      console.log(`   📂 內容類型: ${example.contentType}`)
      console.log(`   🎯 內容ID: ${example.contentId}`)
      console.log(`   📊 狀態: ${example.progressData.status}`)
      console.log(`   📈 進度: ${example.progressData.progress_percentage}%`)
      console.log(`   ⏰ 學習時間: ${example.progressData.study_time_minutes} 分鐘`)
      console.log(`   🔄 練習次數: ${example.progressData.practice_count}`)
      if (example.progressData.quiz_scores) {
        console.log(`   📝 測驗分數: ${example.progressData.quiz_scores.join(', ')}`)
      }
      console.log(`   💭 個人筆記: ${example.progressData.personal_notes}`)
      console.log(`   ⭐ 難度評分: ${example.progressData.difficulty_rating}/5`)
    })

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 5: 用戶互動功能
async function userInteractionExample() {
  console.log('\n❤️  範例 5: 用戶互動功能')

  try {
    // 示例：收藏功能
    console.log('⭐ 示例：收藏卡片')
    const favoriteExample = {
      targetType: 'tarot_card',
      targetId: 'the-fool-card-id',
      data: {
        reason: '這張卡片對我的人生轉折很有意義',
        personal_meaning: '代表勇敢踏出舒適圈',
        favorite_date: new Date().toISOString()
      }
    }

    console.log('📋 收藏資料:')
    console.log(`   🎯 目標類型: ${favoriteExample.targetType}`)
    console.log(`   🆔 目標ID: ${favoriteExample.targetId}`)
    console.log(`   💭 收藏原因: ${favoriteExample.data.reason}`)
    console.log(`   🎭 個人意義: ${favoriteExample.data.personal_meaning}`)

    // 示例：其他互動類型
    console.log('\n🔄 其他互動類型示例:')
    const interactionTypes = [
      { type: 'bookmark_reading', description: '書籤占卜記錄' },
      { type: 'like_interpretation', description: '喜歡某個解釋' },
      { type: 'share_reading', description: '分享占卜結果' }
    ]

    interactionTypes.forEach(interaction => {
      console.log(`   ${interaction.type}: ${interaction.description}`)
    })

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 6: 統計和分析
async function statisticsExample() {
  console.log('\n📊 範例 6: 統計和分析')

  try {
    console.log('📈 用戶統計項目:')
    console.log('   👤 基本統計:')
    console.log('     - 總占卜次數')
    console.log('     - 每日卡片總數')
    console.log('     - 連續抽牌天數')
    console.log('     - 最長連續記錄')

    console.log('\n   🎯 占卜分析:')
    console.log('     - 各類型占卜數量')
    console.log('     - 滿意度平均分')
    console.log('     - 準確度平均分')
    console.log('     - 建議遵循率')

    console.log('\n   📚 學習分析:')
    console.log('     - 已完成課程數')
    console.log('     - 總學習時間')
    console.log('     - 練習次數統計')
    console.log('     - 收藏卡片數量')

    console.log('\n   📅 時間分析:')
    console.log('     - 最近30天活動')
    console.log('     - 月度占卜趨勢')
    console.log('     - 學習時間分布')
    console.log('     - 最活躍時段')

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 執行所有範例
async function runUserSystemExamples() {
  console.log('🚀 開始執行用戶系統範例...')

  await userProfileExample()
  await dailyCardExample()
  await readingExample()
  await learningProgressExample()
  await userInteractionExample()
  await statisticsExample()

  console.log('\n📋 要完整使用這些功能，請先:')
  console.log('1. 在 Supabase SQL Editor 執行 create-tarot-database-schema.sql')
  console.log('2. 在 Supabase SQL Editor 執行 enhance-tarot-database-personal.sql')
  console.log('3. 在 Supabase SQL Editor 執行 create-user-system.sql')
  console.log('4. 設置 Supabase Auth 用戶認證')
  console.log('5. 填入基礎塔羅牌資料')

  console.log('\n💡 用戶系統功能包括:')
  console.log('   👤 完整用戶資料管理')
  console.log('   🗓️  每日卡片抽取系統')
  console.log('   🔮 占卜記錄和歷史')
  console.log('   📚 學習進度追踪')
  console.log('   ❤️  用戶互動功能')
  console.log('   📊 統計和分析工具')
}

runUserSystemExamples()

export {
  userProfileExample,
  dailyCardExample,
  readingExample,
  learningProgressExample,
  userInteractionExample,
  statisticsExample
}