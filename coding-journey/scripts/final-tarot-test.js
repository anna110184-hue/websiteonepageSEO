import { tarotStorage, TarotCardTypes } from '../lib/supabase/tarot-storage.js'

console.log('🧪 最終塔羅牌儲存功能測試...')

async function finalTest() {
  try {
    console.log('\n📄 Test 1: URL 生成測試')

    // 測試 URL 生成
    const foolUrl = tarotStorage.getTarotCardUrl(TarotCardTypes.MAJOR_ARCANA, 'fool.jpg')
    const aceOfCupsUrl = tarotStorage.getTarotCardUrl(TarotCardTypes.CUPS, 'ace-of-cups.jpg')

    console.log('✅ 愚者牌 URL:', foolUrl)
    console.log('✅ 聖杯 A URL:', aceOfCupsUrl)

    console.log('\n📋 Test 2: 列出資料夾內容')

    // 測試列出資料夾
    const { data: majorCards, error: majorError } = await tarotStorage.listTarotCards(TarotCardTypes.MAJOR_ARCANA)

    if (majorError) {
      console.error('❌ 列出大阿爾克那失敗:', majorError.message)
    } else {
      console.log(`✅ 大阿爾克那資料夾: ${majorCards.length} 個項目`)
      majorCards.forEach(card => {
        console.log(`   📄 ${card.name}`)
      })
    }

    console.log('\n🃏 Test 3: 列出所有塔羅牌')

    const { data: allCards, error: allError } = await tarotStorage.listAllTarotCards()

    if (allError) {
      console.error('❌ 列出所有卡牌失敗:', allError)
    } else {
      console.log(`✅ 總共找到 ${allCards.length} 個項目`)

      // 按類型分組
      const cardsByType = allCards.reduce((acc, card) => {
        if (!acc[card.cardType]) {
          acc[card.cardType] = []
        }
        acc[card.cardType].push(card)
        return acc
      }, {})

      Object.entries(cardsByType).forEach(([type, cards]) => {
        console.log(`   📂 ${type}: ${cards.length} 個項目`)
      })
    }

    console.log('\n📊 Test 4: 儲存統計')

    const { data: stats, error: statsError } = await tarotStorage.getStorageStats()

    if (statsError) {
      console.error('❌ 獲取統計失敗:', statsError)
    } else {
      console.log('✅ 儲存統計:')
      console.log(`   總檔案數: ${stats.totalFiles}`)
      console.log(`   總大小: ${(stats.totalSize / 1024).toFixed(2)} KB`)

      Object.entries(stats.cardTypes).forEach(([type, typeStats]) => {
        console.log(`   📂 ${type}: ${typeStats.files} 個檔案`)
      })
    }

    console.log('\n🎉 所有測試完成!')
    console.log('\n📝 系統已就緒，你現在可以:')
    console.log('   1. 使用 tarotStorage 函數管理塔羅牌圖片')
    console.log('   2. 上傳圖片到對應的資料夾')
    console.log('   3. 獲取公開的圖片 URL')
    console.log('   4. 直接訪問: https://dxnfkfljryacxpzlncem.supabase.co/storage/v1/object/public/tarot-cards/')

    return true

  } catch (error) {
    console.error('❌ 測試過程發生錯誤:', error.message)
    return false
  }
}

finalTest()