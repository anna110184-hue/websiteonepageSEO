import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 掃描你的塔羅牌圖片收藏...')

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function scanExistingTarotCards() {
  try {
    // 列出所有 buckets
    const { data: buckets, error: bucketsError } = await admin.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ 無法獲取 buckets:', bucketsError.message)
      return
    }

    console.log(`📦 找到 ${buckets.length} 個 buckets:`)
    buckets.forEach(bucket => {
      console.log(`  📁 ${bucket.name} (public: ${bucket.public})`)
    })

    let totalCards = 0
    const allCards = []

    // 檢查每個 bucket
    for (const bucket of buckets) {
      console.log(`\n📂 掃描 '${bucket.name}'...`)

      const { data: rootItems, error: rootError } = await admin.storage
        .from(bucket.name)
        .list('', { limit: 200 })

      if (rootError) {
        console.error(`❌ 無法存取 ${bucket.name}:`, rootError.message)
        continue
      }

      if (rootItems.length === 0) {
        console.log('   📭 空的 bucket')
        continue
      }

      // 檢查根目錄的圖片
      const rootImages = rootItems.filter(item =>
        item.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/)
      )

      if (rootImages.length > 0) {
        console.log(`\n   🃏 根目錄圖片 (${rootImages.length} 張):`)
        rootImages.forEach(image => {
          const { data } = admin.storage.from(bucket.name).getPublicUrl(image.name)
          console.log(`      📄 ${image.name}`)
          console.log(`         ${data.publicUrl}`)
          allCards.push({
            bucket: bucket.name,
            path: image.name,
            name: image.name,
            url: data.publicUrl,
            size: image.metadata?.size || 0
          })
          totalCards++
        })
      }

      // 檢查子資料夾
      const folders = rootItems.filter(item =>
        !item.name.includes('.') && item.name !== '.emptyFolderPlaceholder'
      )

      for (const folder of folders) {
        console.log(`\n   📁 掃描子資料夾: ${folder.name}/`)

        const { data: subItems, error: subError } = await admin.storage
          .from(bucket.name)
          .list(folder.name, { limit: 100 })

        if (subError) {
          console.error(`   ❌ 無法存取 ${folder.name}:`, subError.message)
          continue
        }

        const subImages = subItems.filter(item =>
          item.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/)
        )

        if (subImages.length > 0) {
          console.log(`      🃏 找到 ${subImages.length} 張圖片:`)
          subImages.forEach(image => {
            const fullPath = `${folder.name}/${image.name}`
            const { data } = admin.storage.from(bucket.name).getPublicUrl(fullPath)
            console.log(`         📄 ${image.name}`)
            allCards.push({
              bucket: bucket.name,
              path: fullPath,
              name: image.name,
              folder: folder.name,
              url: data.publicUrl,
              size: image.metadata?.size || 0
            })
            totalCards++
          })
        } else {
          console.log(`      📭 空資料夾`)
        }

        // 檢查更深層的子資料夾
        const subFolders = subItems.filter(item =>
          !item.name.includes('.') && item.name !== '.emptyFolderPlaceholder'
        )

        for (const subFolder of subFolders.slice(0, 10)) { // 限制檢查數量
          const { data: deepItems, error: deepError } = await admin.storage
            .from(bucket.name)
            .list(`${folder.name}/${subFolder.name}`, { limit: 50 })

          if (!deepError && deepItems) {
            const deepImages = deepItems.filter(item =>
              item.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/)
            )

            if (deepImages.length > 0) {
              console.log(`         📁 ${subFolder.name}/ (${deepImages.length} 張):`)
              deepImages.forEach(image => {
                const fullPath = `${folder.name}/${subFolder.name}/${image.name}`
                const { data } = admin.storage.from(bucket.name).getPublicUrl(fullPath)
                console.log(`            📄 ${image.name}`)
                allCards.push({
                  bucket: bucket.name,
                  path: fullPath,
                  name: image.name,
                  folder: `${folder.name}/${subFolder.name}`,
                  url: data.publicUrl,
                  size: image.metadata?.size || 0
                })
                totalCards++
              })
            }
          }
        }
      }
    }

    // 總結統計
    console.log(`\n🎉 掃描完成！`)
    console.log(`📊 統計結果:`)
    console.log(`   總共找到: ${totalCards} 張塔羅牌圖片`)

    // 按 bucket 分組統計
    const cardsByBucket = {}
    allCards.forEach(card => {
      if (!cardsByBucket[card.bucket]) {
        cardsByBucket[card.bucket] = []
      }
      cardsByBucket[card.bucket].push(card)
    })

    Object.entries(cardsByBucket).forEach(([bucket, cards]) => {
      console.log(`   📦 ${bucket}: ${cards.length} 張圖片`)
    })

    // 總檔案大小
    const totalSize = allCards.reduce((sum, card) => sum + (card.size || 0), 0)
    console.log(`   💾 總大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)

    // 儲存清單到檔案
    const cardList = {
      scannedAt: new Date().toISOString(),
      totalCards,
      totalSize,
      cards: allCards
    }

    // 匯出為 JSON
    console.log(`\n📝 已找到的塔羅牌清單:`)
    allCards.slice(0, 10).forEach(card => {
      console.log(`   🃏 ${card.path}`)
    })

    if (allCards.length > 10) {
      console.log(`   ... 還有 ${allCards.length - 10} 張圖片`)
    }

    return cardList

  } catch (error) {
    console.error('❌ 掃描過程發生錯誤:', error.message)
  }
}

scanExistingTarotCards()