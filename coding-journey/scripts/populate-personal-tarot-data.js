import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔮 填入個人化塔羅牌資料...')

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// 主要大阿爾克那牌的個人化資料
const majorArcanaPersonalData = {
  "The Fool": {
    personal_upright_meaning: "擁抱未知的勇氣，相信內心的直覺，準備踏上新的人生旅程。",
    personal_reversed_meaning: "過度謹慎可能錯失機會，需要重新找回初心和冒險精神。",
    spiritual_message: "信任宇宙的安排，每一步都是靈魂成長的必經之路。",
    practical_guidance: "放下過度的計劃，允許自己在生活中保持開放和好奇。",
    emotional_insight: "內心的純真和喜悅是最強大的力量，不要害怕展現真實的自己。",
    wisdom_words_upright: ["勇敢踏出第一步", "相信內在智慧", "擁抱未知的美好", "保持初學者心態"],
    wisdom_words_reversed: ["停下來重新思考", "找回內在信任", "釋放恐懼", "重新連結直覺"],
    affirmation_upright: "我勇敢地擁抱生命中的每一個新開始。",
    affirmation_reversed: "我重新找回對生命的信任和勇氣。",
    reflection_question: "我現在準備好踏出什麼樣的新步伐？",
    energy_frequency: "high",
    vibration_color: "彩虹光",
    chakra_connection: "頂輪",
    daily_meditation: "今天我允許自己以初學者的心態面對一切新體驗。",
    journal_prompt: "回想一次勇敢嘗試新事物的經歷，那時的感受是什麼？"
  },

  "The Magician": {
    personal_upright_meaning: "擁有創造現實的力量，將意圖轉化為實際行動的時刻。",
    personal_reversed_meaning: "力量被誤用或缺乏專注，需要重新校準目標和意圖。",
    spiritual_message: "你是自己生命的魔法師，具備改變現實的神聖力量。",
    practical_guidance: "明確設定目標，運用所有可用資源來實現願景。",
    emotional_insight: "自信和決心是實現夢想的關鍵，相信自己的能力。",
    wisdom_words_upright: ["意志創造現實", "專注帶來力量", "我具備一切所需", "行動勝過空想"],
    wisdom_words_reversed: ["重新聚焦意圖", "檢視動機純淨度", "避免操控他人", "回歸內在力量"],
    affirmation_upright: "我擁有創造美好現實的一切力量。",
    affirmation_reversed: "我重新校準我的意圖，回歸真正的力量。",
    reflection_question: "我想要在生命中創造什麼？我擁有哪些資源？",
    energy_frequency: "high",
    vibration_color: "金黃色",
    chakra_connection: "太陽神經叢",
    daily_meditation: "我是自己生命的創造者，今天我將意圖轉化為行動。",
    journal_prompt: "列出三個我想要實現的目標，以及我現在可以採取的行動步驟。"
  },

  "The High Priestess": {
    personal_upright_meaning: "聆聽內在聲音，信任直覺，探索潛意識的智慧寶藏。",
    personal_reversed_meaning: "與直覺失去連結，需要重新建立內在的寧靜和覺察。",
    spiritual_message: "智慧來自於內在的靜默，在寧靜中找到所有答案。",
    practical_guidance: "在做決定前先靜心聆聽，直覺往往比理性更準確。",
    emotional_insight: "感受和情緒是重要的指引，學會解讀內心的語言。",
    wisdom_words_upright: ["靜默中有答案", "直覺是神聖指引", "信任內在知曉", "智慧來自內在"],
    wisdom_words_reversed: ["重建內在連結", "放慢腳步聆聽", "釋放心理噪音", "回歸寧靜中心"],
    affirmation_upright: "我信任內在的智慧，它總是為我指引正確的方向。",
    affirmation_reversed: "我重新與內在的直覺建立連結。",
    reflection_question: "我的內在聲音想要告訴我什麼？",
    energy_frequency: "medium",
    vibration_color: "銀白色",
    chakra_connection: "第三眼輪",
    daily_meditation: "今天我會在安靜中聆聽內在智慧的聲音。",
    journal_prompt: "描述一次你跟隨直覺做決定的經歷，結果如何？"
  }
}

// 智慧話語集合
const wisdomQuotes = [
  {
    cardName: "The Fool",
    quotes: [
      { text: "每一個專家都曾經是初學者。", type: "quote", category: "成長" },
      { text: "我勇敢地走向未知，因為那裡有無限可能。", type: "affirmation", category: "勇氣" },
      { text: "在每個結束中都有新的開始。", type: "meditation", category: "轉變" }
    ]
  },
  {
    cardName: "The Magician",
    quotes: [
      { text: "你擁有改變現實的力量，關鍵在於如何運用。", type: "quote", category: "力量" },
      { text: "我將清晰的意圖轉化為具體的行動。", type: "affirmation", category: "創造" },
      { text: "專注是最強大的魔法。", type: "mantra", category: "專注" }
    ]
  }
]

async function populatePersonalData() {
  try {
    console.log('\n📋 Step 1: 檢查增強資料庫結構...')

    // 檢查是否已經添加了個人化欄位
    const { data: sampleCard, error: checkError } = await admin
      .from('tarot_cards')
      .select('personal_upright_meaning')
      .limit(1)

    if (checkError && checkError.code === '42703') {
      console.error('❌ 個人化欄位不存在，請先執行:')
      console.log('   在 Supabase SQL Editor 執行 enhance-tarot-database-personal.sql')
      return false
    }

    console.log('✅ 資料庫結構檢查完成')

    console.log('\n🃏 Step 2: 更新大阿爾克那牌個人化資料...')

    for (const [cardName, personalData] of Object.entries(majorArcanaPersonalData)) {
      try {
        // 先找到卡牌
        const { data: card, error: cardError } = await admin
          .from('tarot_cards')
          .select('id, name_en')
          .eq('name_en', cardName)
          .single()

        if (cardError || !card) {
          console.log(`⚠️  找不到卡牌: ${cardName}`)
          continue
        }

        // 更新個人化資料
        const { error: updateError } = await admin
          .from('tarot_cards')
          .update(personalData)
          .eq('id', card.id)

        if (updateError) {
          console.error(`❌ 更新 ${cardName} 失敗:`, updateError.message)
        } else {
          console.log(`✅ 更新 ${cardName} 個人化資料`)
        }

      } catch (err) {
        console.error(`❌ 處理 ${cardName} 時發生錯誤:`, err.message)
      }
    }

    console.log('\n💬 Step 3: 添加智慧話語集合...')

    for (const cardWisdom of wisdomQuotes) {
      try {
        // 找到卡牌
        const { data: card, error: cardError } = await admin
          .from('tarot_cards')
          .select('id')
          .eq('name_en', cardWisdom.cardName)
          .single()

        if (cardError || !card) {
          console.log(`⚠️  找不到卡牌: ${cardWisdom.cardName}`)
          continue
        }

        // 添加智慧話語
        for (const quote of cardWisdom.quotes) {
          const wisdomData = {
            card_id: card.id,
            wisdom_text: quote.text,
            wisdom_type: quote.type,
            interpretation_type: 'general',
            wisdom_category: quote.category,
            language: 'zh',
            is_featured: true
          }

          const { error: wisdomError } = await admin
            .from('tarot_wisdom_collection')
            .insert(wisdomData)

          if (wisdomError) {
            console.error(`❌ 添加智慧話語失敗:`, wisdomError.message)
          } else {
            console.log(`✅ 添加智慧話語: ${quote.text.substring(0, 30)}...`)
          }
        }

      } catch (err) {
        console.error(`❌ 處理智慧話語時發生錯誤:`, err.message)
      }
    }

    console.log('\n📊 Step 4: 創建示例每日靈感...')

    const today = new Date().toISOString().split('T')[0]

    // 隨機選擇一張大阿爾克那牌作為今日卡片
    const { data: randomCard, error: randomError } = await admin
      .from('tarot_cards')
      .select('id, name_zh, name_en')
      .eq('arcana_type', 'major')
      .limit(1)

    if (!randomError && randomCard && randomCard.length > 0) {
      const card = randomCard[0]

      const dailyInspirationData = {
        card_id: card.id,
        inspiration_date: today,
        morning_reflection: `今日卡片 ${card.name_zh} 提醒我們要保持開放的心態，迎接新的可能性。`,
        evening_gratitude: `感謝今天 ${card.name_zh} 帶給我的洞察和指引。`,
        daily_intention: `今天我要以 ${card.name_zh} 的智慧來面對生活中的挑戰。`,
        mindful_moment: `當感到困惑時，我會想起 ${card.name_zh} 的教導。`,
        moon_phase: "新月",
        season: "春天",
        is_personal: false
      }

      const { error: inspirationError } = await admin
        .from('daily_card_inspiration')
        .insert(dailyInspirationData)

      if (inspirationError) {
        console.error('❌ 創建每日靈感失敗:', inspirationError.message)
      } else {
        console.log(`✅ 創建今日靈感卡片: ${card.name_zh}`)
      }
    }

    console.log('\n🎉 個人化塔羅牌資料填入完成!')
    console.log('\n📝 已添加的功能:')
    console.log('   ✅ 個人化解釋欄位')
    console.log('   ✅ 智慧話語集合')
    console.log('   ✅ 每日靈感系統')
    console.log('   ✅ 能量頻率和脈輪連結')
    console.log('   ✅ 冥想和反思問題')

    console.log('\n🚀 現在你可以使用:')
    console.log('   - personalInterpretations.* 管理個人解釋')
    console.log('   - wisdomCollection.* 管理智慧話語')
    console.log('   - dailyInspiration.* 管理每日靈感')
    console.log('   - enhancedCards.* 使用增強功能')

    return true

  } catch (error) {
    console.error('❌ 填入個人化資料過程發生錯誤:', error.message)
    return false
  }
}

populatePersonalData()