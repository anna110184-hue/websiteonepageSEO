// 塔羅牌儲存使用範例
import { tarotStorage, TarotCardTypes, tarotValidation } from '../../lib/supabase/tarot-storage.js'

console.log('🔮 塔羅牌儲存使用範例')

// 範例 1: 獲取塔羅牌圖片 URL
function getCardUrlExamples() {
  console.log('\n📄 範例 1: 獲取卡牌圖片 URL')

  // 大阿爾克那牌
  const foolUrl = tarotStorage.getTarotCardUrl(TarotCardTypes.MAJOR_ARCANA, 'fool.jpg')
  console.log('愚者牌 URL:', foolUrl)

  // 小阿爾克那牌
  const aceOfCupsUrl = tarotStorage.getTarotCardUrl(TarotCardTypes.CUPS, 'ace-of-cups.jpg')
  console.log('聖杯 A URL:', aceOfCupsUrl)

  const kingOfSwordsUrl = tarotStorage.getTarotCardUrl(TarotCardTypes.SWORDS, 'king-of-swords.jpg')
  console.log('寶劍國王 URL:', kingOfSwordsUrl)
}

// 範例 2: 上傳塔羅牌圖片
async function uploadCardExamples() {
  console.log('\n📤 範例 2: 上傳塔羅牌圖片')

  // 創建模擬圖片檔案
  const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD...' // 實際使用時這裡是真實的圖片數據
  const mockFile = new File(['mock image data'], 'fool.jpg', { type: 'image/jpeg' })

  // 驗證檔案
  const validation = tarotValidation.validateImageFile(mockFile)
  if (!validation.valid) {
    console.error('檔案驗證失敗:', validation.errors)
    return
  }

  // 上傳大阿爾克那牌
  try {
    const { data, error } = await tarotStorage.uploadTarotCard(
      TarotCardTypes.MAJOR_ARCANA,
      'fool.jpg',
      mockFile,
      { overwrite: true } // 允許覆寫
    )

    if (error) {
      console.error('上傳失敗:', error.message)
    } else {
      console.log('上傳成功!')
      console.log('檔案路徑:', data.path)
      console.log('公開 URL:', data.publicUrl)
    }
  } catch (err) {
    console.error('上傳過程中發生錯誤:', err.message)
  }
}

// 範例 3: 列出塔羅牌圖片
async function listCardsExamples() {
  console.log('\n📋 範例 3: 列出塔羅牌圖片')

  try {
    // 列出所有大阿爾克那牌
    const { data: majorCards, error: majorError } = await tarotStorage.listTarotCards(
      TarotCardTypes.MAJOR_ARCANA
    )

    if (majorError) {
      console.error('獲取大阿爾克那牌失敗:', majorError.message)
    } else {
      console.log(`找到 ${majorCards.length} 張大阿爾克那牌:`)
      majorCards.forEach(card => {
        console.log(`  📄 ${card.name} - ${card.publicUrl}`)
      })
    }

    // 列出所有聖杯牌
    const { data: cupsCards, error: cupsError } = await tarotStorage.listTarotCards(
      TarotCardTypes.CUPS
    )

    if (cupsError) {
      console.error('獲取聖杯牌失敗:', cupsError.message)
    } else {
      console.log(`找到 ${cupsCards.length} 張聖杯牌:`)
      cupsCards.forEach(card => {
        console.log(`  🏆 ${card.name} - ${card.publicUrl}`)
      })
    }

  } catch (err) {
    console.error('列出卡牌時發生錯誤:', err.message)
  }
}

// 範例 4: 列出所有塔羅牌
async function listAllCardsExample() {
  console.log('\n🃏 範例 4: 列出所有塔羅牌')

  try {
    const { data: allCards, error } = await tarotStorage.listAllTarotCards()

    if (error) {
      console.error('獲取所有卡牌時出現部分錯誤:', error)
    }

    if (allCards && allCards.length > 0) {
      console.log(`總共找到 ${allCards.length} 張塔羅牌:`)

      // 按類型分組顯示
      const cardsByType = allCards.reduce((acc, card) => {
        if (!acc[card.cardType]) {
          acc[card.cardType] = []
        }
        acc[card.cardType].push(card)
        return acc
      }, {})

      Object.entries(cardsByType).forEach(([type, cards]) => {
        console.log(`\n📂 ${type} (${cards.length} 張):`)
        cards.forEach(card => {
          console.log(`  📄 ${card.name}`)
        })
      })
    } else {
      console.log('沒有找到任何塔羅牌圖片')
    }

  } catch (err) {
    console.error('列出所有卡牌時發生錯誤:', err.message)
  }
}

// 範例 5: 批量上傳
async function batchUploadExample() {
  console.log('\n📦 範例 5: 批量上傳塔羅牌')

  const uploads = [
    {
      cardType: TarotCardTypes.MAJOR_ARCANA,
      filename: 'magician.jpg',
      file: new File(['mock data 1'], 'magician.jpg', { type: 'image/jpeg' })
    },
    {
      cardType: TarotCardTypes.CUPS,
      filename: 'two-of-cups.jpg',
      file: new File(['mock data 2'], 'two-of-cups.jpg', { type: 'image/jpeg' })
    },
    {
      cardType: TarotCardTypes.SWORDS,
      filename: 'three-of-swords.jpg',
      file: new File(['mock data 3'], 'three-of-swords.jpg', { type: 'image/jpeg' })
    }
  ]

  try {
    const { data: results, error: batchError } = await tarotStorage.batchUploadTarotCards(uploads)

    if (batchError && batchError.length > 0) {
      console.log('部分上傳失敗:')
      batchError.forEach(err => {
        console.error(`  ❌ ${err.cardType}/${err.filename}: ${err.error.message}`)
      })
    }

    if (results && results.length > 0) {
      console.log('成功上傳:')
      results.forEach(result => {
        console.log(`  ✅ ${result.cardType}/${result.filename}`)
      })
    }

  } catch (err) {
    console.error('批量上傳時發生錯誤:', err.message)
  }
}

// 範例 6: 獲取儲存統計
async function getStorageStatsExample() {
  console.log('\n📊 範例 6: 獲取儲存統計')

  try {
    const { data: stats, error } = await tarotStorage.getStorageStats()

    if (error) {
      console.error('獲取統計失敗:', error.message)
      return
    }

    console.log('儲存統計:')
    console.log(`總檔案數: ${stats.totalFiles}`)
    console.log(`總大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`)

    console.log('\n各類型統計:')
    Object.entries(stats.cardTypes).forEach(([type, typeStats]) => {
      console.log(`  📂 ${type}: ${typeStats.files} 個檔案, ${(typeStats.size / 1024).toFixed(2)} KB`)
    })

  } catch (err) {
    console.error('獲取統計時發生錯誤:', err.message)
  }
}

// 範例 7: 檔案驗證
function validationExamples() {
  console.log('\n✅ 範例 7: 檔案驗證')

  // 驗證檔案
  const validFile = new File(['test'], 'valid-card.jpg', { type: 'image/jpeg' })
  const invalidFile = new File(['test'], 'invalid-card.txt', { type: 'text/plain' })

  const validFileResult = tarotValidation.validateImageFile(validFile)
  const invalidFileResult = tarotValidation.validateImageFile(invalidFile)

  console.log('有效檔案驗證結果:', validFileResult)
  console.log('無效檔案驗證結果:', invalidFileResult)

  // 驗證檔名
  const validFilename = 'ace-of-cups.jpg'
  const invalidFilename = 'invalid<file>name.txt'

  const validFilenameResult = tarotValidation.validateFilename(validFilename)
  const invalidFilenameResult = tarotValidation.validateFilename(invalidFilename)

  console.log('有效檔名驗證結果:', validFilenameResult)
  console.log('無效檔名驗證結果:', invalidFilenameResult)
}

// 執行所有範例 (在實際使用時取消註解)
// getCardUrlExamples()
// uploadCardExamples()
// listCardsExamples()
// listAllCardsExample()
// batchUploadExample()
// getStorageStatsExample()
// validationExamples()

// 匯出範例函數供其他地方使用
export {
  getCardUrlExamples,
  uploadCardExamples,
  listCardsExamples,
  listAllCardsExample,
  batchUploadExample,
  getStorageStatsExample,
  validationExamples
}