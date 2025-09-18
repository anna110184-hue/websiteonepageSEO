// 塔羅牌資料庫使用範例
import { tarotDatabase, cardMeanings, tarotSpreads, tarotStats } from '../../lib/supabase/tarot-database.js'

console.log('🔮 塔羅牌資料庫使用範例')

// 範例 1: 查詢所有大阿爾克那牌
async function getMajorArcanaExample() {
  console.log('\n📚 範例 1: 獲取大阿爾克那牌')

  try {
    const { data: majorCards, error } = await tarotDatabase.getMajorArcana()

    if (error) {
      console.error('❌ 查詢失敗:', error.message)
      return
    }

    console.log(`✅ 找到 ${majorCards.length} 張大阿爾克那牌:`)
    majorCards.slice(0, 5).forEach(card => {
      console.log(`   🃏 ${card.number}. ${card.name_zh} (${card.name_en})`)
      console.log(`      圖片: ${card.image_url}`)
      console.log(`      關鍵字: ${card.keywords?.join(', ') || '無'}`)
    })

    if (majorCards.length > 5) {
      console.log(`   ... 還有 ${majorCards.length - 5} 張`)
    }

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 2: 搜尋特定卡牌
async function searchCardExample() {
  console.log('\n🔍 範例 2: 搜尋卡牌')

  try {
    const { data: foolCard, error } = await tarotDatabase.getCardByName('愚者')

    if (error) {
      console.error('❌ 搜尋失敗:', error.message)
      return
    }

    if (foolCard) {
      console.log(`✅ 找到卡牌: ${foolCard.name_zh} (${foolCard.name_en})`)
      console.log(`   📄 描述: ${foolCard.arcana_type === 'major' ? '大阿爾克那' : '小阿爾克那'}`)
      console.log(`   🖼️  圖片: ${foolCard.image_url}`)

      // 顯示牌義
      if (foolCard.card_meanings && foolCard.card_meanings.length > 0) {
        console.log(`   📖 牌義 (${foolCard.card_meanings.length} 種):`)
        foolCard.card_meanings.slice(0, 3).forEach(meaning => {
          console.log(`      ${meaning.interpretation_type} | ${meaning.category}:`)
          console.log(`      "${meaning.short_meaning}"`)
        })
      }
    } else {
      console.log('❌ 未找到該卡牌')
    }

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 3: 隨機抽牌
async function randomCardsExample() {
  console.log('\n🎲 範例 3: 隨機抽牌')

  try {
    const { data: randomCards, error } = await tarotDatabase.getRandomCards(3)

    if (error) {
      console.error('❌ 抽牌失敗:', error.message)
      return
    }

    console.log(`✅ 隨機抽到 ${randomCards.length} 張牌:`)
    randomCards.forEach((card, index) => {
      console.log(`   ${index + 1}. 🃏 ${card.name_zh} (${card.name_en})`)
      console.log(`      類型: ${card.arcana_type === 'major' ? '大阿爾克那' : card.suit + ' ' + card.arcana_type}`)

      // 顯示一個簡短牌義
      const generalMeaning = card.card_meanings?.find(m =>
        m.interpretation_type === 'upright' && m.category === 'general'
      )
      if (generalMeaning) {
        console.log(`      牌義: ${generalMeaning.short_meaning}`)
      }
    })

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 4: 查詢小阿爾克那特定花色
async function getMinorArcanaSuitExample() {
  console.log('\n🏆 範例 4: 查詢聖杯花色')

  try {
    const { data: cupsCards, error } = await tarotDatabase.getCardsBySuit('cups')

    if (error) {
      console.error('❌ 查詢失敗:', error.message)
      return
    }

    console.log(`✅ 聖杯花色共 ${cupsCards.length} 張牌:`)

    // 分類顯示
    const numberCards = cupsCards.filter(card => !card.court_card)
    const courtCards = cupsCards.filter(card => card.court_card)

    console.log(`   📊 數字牌 (${numberCards.length} 張):`)
    numberCards.slice(0, 5).forEach(card => {
      console.log(`      ${card.number}. ${card.name_zh}`)
    })

    console.log(`   👑 宮廷牌 (${courtCards.length} 張):`)
    courtCards.forEach(card => {
      console.log(`      ${card.name_zh} (${card.court_card})`)
    })

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 5: 獲取特定牌義
async function getCardMeaningExample() {
  console.log('\n📖 範例 5: 獲取特定牌義')

  try {
    // 先找到愚者牌
    const { data: foolCard, error: cardError } = await tarotDatabase.getCardByName('The Fool')

    if (cardError || !foolCard) {
      console.error('❌ 找不到愚者牌')
      return
    }

    // 獲取愚者牌的正位一般牌義
    const { data: meaning, error: meaningError } = await cardMeanings.getCardMeaning(
      foolCard.id,
      'upright',
      'general'
    )

    if (meaningError) {
      console.error('❌ 獲取牌義失敗:', meaningError.message)
      return
    }

    if (meaning) {
      console.log(`✅ 愚者牌正位一般牌義:`)
      console.log(`   📝 簡短: ${meaning.short_meaning}`)
      console.log(`   📋 詳細: ${meaning.detailed_meaning}`)
      if (meaning.advice) {
        console.log(`   💡 建議: ${meaning.advice}`)
      }
      console.log(`   😊 情感色調: ${meaning.emotional_tone}`)
    } else {
      console.log('❌ 該牌義尚未錄入')
    }

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 6: 資料庫統計
async function getDatabaseStatsExample() {
  console.log('\n📊 範例 6: 資料庫統計')

  try {
    const { data: stats, error } = await tarotStats.getDatabaseStats()

    if (error) {
      console.error('❌ 獲取統計失敗:', error.message)
      return
    }

    console.log('✅ 資料庫統計:')
    console.log(`   🃏 總卡牌數: ${stats.cards.total}`)
    console.log(`      📚 大阿爾克那: ${stats.cards.major_arcana}`)
    console.log(`      🎭 小阿爾克那: ${stats.cards.minor_arcana}`)
    console.log(`   📖 總牌義數: ${stats.meanings}`)
    console.log(`   🔮 牌陣數: ${stats.spreads}`)
    console.log(`   📝 占卜記錄: ${stats.readings}`)

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 範例 7: 關鍵字搜尋
async function searchByKeywordExample() {
  console.log('\n🔎 範例 7: 關鍵字搜尋')

  try {
    const { data: loveCards, error } = await tarotDatabase.searchCards('愛情')

    if (error) {
      console.error('❌ 搜尋失敗:', error.message)
      return
    }

    console.log(`✅ 搜尋 "愛情" 找到 ${loveCards.length} 張相關卡牌:`)
    loveCards.slice(0, 3).forEach(card => {
      console.log(`   💖 ${card.name_zh} (${card.name_en})`)
      console.log(`      關鍵字: ${card.keywords?.join(', ') || '無'}`)
    })

  } catch (err) {
    console.error('❌ 範例執行錯誤:', err.message)
  }
}

// 執行所有範例 (在實際使用時取消註解)
async function runAllExamples() {
  console.log('🚀 開始執行塔羅牌資料庫範例...')

  // 注意: 這些範例需要先完成資料庫設置

  // await getMajorArcanaExample()
  // await searchCardExample()
  // await randomCardsExample()
  // await getMinorArcanaSuitExample()
  // await getCardMeaningExample()
  // await getDatabaseStatsExample()
  // await searchByKeywordExample()

  console.log('\n📋 要執行這些範例，請先:')
  console.log('1. 在 Supabase SQL Editor 執行 create-tarot-database-schema.sql')
  console.log('2. 執行 node scripts/populate-tarot-data.js')
  console.log('3. 執行 node scripts/populate-card-meanings.js')
  console.log('4. 然後取消註解上面的函數調用')
}

runAllExamples()

// 匯出範例函數
export {
  getMajorArcanaExample,
  searchCardExample,
  randomCardsExample,
  getMinorArcanaSuitExample,
  getCardMeaningExample,
  getDatabaseStatsExample,
  searchByKeywordExample
}