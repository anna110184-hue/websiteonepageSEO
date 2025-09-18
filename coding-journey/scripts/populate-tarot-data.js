import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

console.log('📊 填入塔羅牌資料...')

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// 大阿爾克那牌資料
const majorArcanaCards = [
  {
    number: 0,
    name_en: "The Fool",
    name_zh: "愚者",
    image_filename: "00-TheFool.png",
    element: "air",
    keywords: ["新開始", "純真", "冒險", "信念", "潛力"]
  },
  {
    number: 1,
    name_en: "The Magician",
    name_zh: "魔術師",
    image_filename: "01-TheMagician.png",
    element: "air",
    keywords: ["意志力", "技能", "專注", "創造", "行動"]
  },
  {
    number: 2,
    name_en: "The High Priestess",
    name_zh: "女祭司",
    image_filename: "02-TheHighPriestess.png",
    element: "water",
    keywords: ["直覺", "神秘", "潛意識", "智慧", "靈性"]
  },
  {
    number: 3,
    name_en: "The Empress",
    name_zh: "皇后",
    image_filename: "03-TheEmpress.png",
    element: "earth",
    keywords: ["豐饒", "母性", "創造力", "自然", "滋養"]
  },
  {
    number: 4,
    name_en: "The Emperor",
    name_zh: "皇帝",
    image_filename: "04-TheEmperor.png",
    element: "fire",
    keywords: ["權威", "結構", "控制", "領導", "父性"]
  },
  {
    number: 5,
    name_en: "The Hierophant",
    name_zh: "教皇",
    image_filename: "05-TheHierophant.png",
    element: "earth",
    keywords: ["傳統", "靈性導師", "宗教", "教育", "道德"]
  },
  {
    number: 6,
    name_en: "The Lovers",
    name_zh: "戀人",
    image_filename: "06-TheLovers.png",
    element: "air",
    keywords: ["愛情", "選擇", "和諧", "關係", "誘惑"]
  },
  {
    number: 7,
    name_en: "The Chariot",
    name_zh: "戰車",
    image_filename: "07-TheChariot.png",
    element: "water",
    keywords: ["勝利", "意志力", "控制", "決心", "進步"]
  },
  {
    number: 8,
    name_en: "Strength",
    name_zh: "力量",
    image_filename: "08-Strength.png",
    element: "fire",
    keywords: ["內在力量", "勇氣", "耐心", "同情", "自控"]
  },
  {
    number: 9,
    name_en: "The Hermit",
    name_zh: "隱者",
    image_filename: "09-TheHermit.png",
    element: "earth",
    keywords: ["內省", "尋找", "指導", "孤獨", "智慧"]
  },
  {
    number: 10,
    name_en: "Wheel of Fortune",
    name_zh: "命運之輪",
    image_filename: "10-WheelOfFortune.png",
    element: "fire",
    keywords: ["命運", "循環", "機會", "改變", "好運"]
  },
  {
    number: 11,
    name_en: "Justice",
    name_zh: "正義",
    image_filename: "11-Justice.png",
    element: "air",
    keywords: ["正義", "平衡", "真理", "法律", "道德"]
  },
  {
    number: 12,
    name_en: "The Hanged Man",
    name_zh: "倒吊者",
    image_filename: "12-TheHangedMan.png",
    element: "water",
    keywords: ["犧牲", "等待", "放手", "新觀點", "暫停"]
  },
  {
    number: 13,
    name_en: "Death",
    name_zh: "死神",
    image_filename: "13-Death.png",
    element: "water",
    keywords: ["轉變", "結束", "重生", "釋放", "變革"]
  },
  {
    number: 14,
    name_en: "Temperance",
    name_zh: "節制",
    image_filename: "14-Temperance.png",
    element: "fire",
    keywords: ["平衡", "調和", "耐心", "療癒", "節制"]
  },
  {
    number: 15,
    name_en: "The Devil",
    name_zh: "惡魔",
    image_filename: "15-TheDevil.png",
    element: "earth",
    keywords: ["束縛", "誘惑", "物慾", "恐懼", "陰影"]
  },
  {
    number: 16,
    name_en: "The Tower",
    name_zh: "高塔",
    image_filename: "16-TheTower.png",
    element: "fire",
    keywords: ["突變", "解放", "啟示", "災難", "覺醒"]
  },
  {
    number: 17,
    name_en: "The Star",
    name_zh: "星星",
    image_filename: "17-TheStar.png",
    element: "air",
    keywords: ["希望", "靈感", "療癒", "指引", "樂觀"]
  },
  {
    number: 18,
    name_en: "The Moon",
    name_zh: "月亮",
    image_filename: "18-TheMoon.png",
    element: "water",
    keywords: ["幻象", "恐懼", "潛意識", "欺騙", "混亂"]
  },
  {
    number: 19,
    name_en: "The Sun",
    name_zh: "太陽",
    image_filename: "19-TheSun.png",
    element: "fire",
    keywords: ["成功", "喜悅", "活力", "啟發", "積極"]
  },
  {
    number: 20,
    name_en: "Judgement",
    name_zh: "審判",
    image_filename: "20-Judgement.png",
    element: "fire",
    keywords: ["重生", "覺醒", "呼喚", "寬恕", "贖罪"]
  },
  {
    number: 21,
    name_en: "The World",
    name_zh: "世界",
    image_filename: "21-TheWorld.png",
    element: "earth",
    keywords: ["完成", "成就", "圓滿", "旅程結束", "統一"]
  }
]

// 小阿爾克那牌資料生成函數
function generateMinorArcanaCards() {
  const suits = [
    { name: 'cups', name_zh: '聖杯', element: 'water' },
    { name: 'swords', name_zh: '寶劍', element: 'air' },
    { name: 'wands', name_zh: '權杖', element: 'fire' },
    { name: 'pentacles', name_zh: '金幣', element: 'earth' }
  ]

  const numberCards = {
    1: { name_en: "Ace", name_zh: "A" },
    2: { name_en: "Two", name_zh: "二" },
    3: { name_en: "Three", name_zh: "三" },
    4: { name_en: "Four", name_zh: "四" },
    5: { name_en: "Five", name_zh: "五" },
    6: { name_en: "Six", name_zh: "六" },
    7: { name_en: "Seven", name_zh: "七" },
    8: { name_en: "Eight", name_zh: "八" },
    9: { name_en: "Nine", name_zh: "九" },
    10: { name_en: "Ten", name_zh: "十" }
  }

  const courtCards = {
    11: { name_en: "Page", name_zh: "侍者", court_card: "page" },
    12: { name_en: "Knight", name_zh: "騎士", court_card: "knight" },
    13: { name_en: "Queen", name_zh: "皇后", court_card: "queen" },
    14: { name_en: "King", name_zh: "國王", court_card: "king" }
  }

  const cards = []

  suits.forEach(suit => {
    // 數字牌 1-10
    for (let num = 1; num <= 10; num++) {
      cards.push({
        number: num,
        name_en: `${numberCards[num].name_en} of ${suit.name.charAt(0).toUpperCase() + suit.name.slice(1)}`,
        name_zh: `${suit.name_zh}${numberCards[num].name_zh}`,
        suit: suit.name,
        element: suit.element,
        image_filename: `${suit.name.charAt(0).toUpperCase() + suit.name.slice(1)}${num.toString().padStart(2, '0')}.png`,
        keywords: [] // 稍後填入
      })
    }

    // 宮廷牌 11-14
    for (let num = 11; num <= 14; num++) {
      cards.push({
        number: num,
        name_en: `${courtCards[num].name_en} of ${suit.name.charAt(0).toUpperCase() + suit.name.slice(1)}`,
        name_zh: `${suit.name_zh}${courtCards[num].name_zh}`,
        suit: suit.name,
        court_card: courtCards[num].court_card,
        element: suit.element,
        image_filename: `${suit.name.charAt(0).toUpperCase() + suit.name.slice(1)}${num}-${courtCards[num].court_card}.png`,
        keywords: [] // 稍後填入
      })
    }
  })

  return cards
}

async function populateTarotData() {
  try {
    console.log('\n📋 Step 1: 檢查資料庫表格...')

    // 檢查 tarot_cards 表格是否存在
    const { error: checkError } = await admin
      .from('tarot_cards')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('❌ 資料庫表格不存在，請先執行 SQL schema:')
      console.log('   前往 https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem/sql')
      console.log('   執行 create-tarot-database-schema.sql')
      return false
    }

    console.log('✅ 資料庫表格存在')

    console.log('\n🃏 Step 2: 插入大阿爾克那牌...')

    for (const card of majorArcanaCards) {
      const cardData = {
        ...card,
        arcana_type: 'major',
        image_path: `major-arcana/${card.image_filename}`,
        image_url: `https://dxnfkfljryacxpzlncem.supabase.co/storage/v1/object/public/tarot-cards/major-arcana/${card.image_filename}`
      }

      const { error } = await admin
        .from('tarot_cards')
        .insert(cardData)

      if (error) {
        console.error(`❌ 插入 ${card.name_zh} 失敗:`, error.message)
      } else {
        console.log(`✅ 插入 ${card.name_zh}`)
      }
    }

    console.log('\n🎭 Step 3: 插入小阿爾克那牌...')

    const minorCards = generateMinorArcanaCards()

    for (const card of minorCards) {
      const cardData = {
        ...card,
        arcana_type: 'minor',
        image_path: `minor-arcana/${card.suit}/${card.image_filename}`,
        image_url: `https://dxnfkfljryacxpzlncem.supabase.co/storage/v1/object/public/tarot-cards/minor-arcana/${card.suit}/${card.image_filename}`
      }

      const { error } = await admin
        .from('tarot_cards')
        .insert(cardData)

      if (error) {
        console.error(`❌ 插入 ${card.name_zh} 失敗:`, error.message)
      } else {
        console.log(`✅ 插入 ${card.name_zh}`)
      }
    }

    console.log('\n📊 Step 4: 檢查插入結果...')

    const { data: totalCards, error: countError } = await admin
      .from('tarot_cards')
      .select('id')

    if (countError) {
      console.error('❌ 無法檢查插入結果:', countError.message)
    } else {
      console.log(`✅ 總共插入 ${totalCards.length} 張卡牌`)

      // 按類型統計
      const { data: majorCount } = await admin
        .from('tarot_cards')
        .select('id')
        .eq('arcana_type', 'major')

      const { data: minorCount } = await admin
        .from('tarot_cards')
        .select('id')
        .eq('arcana_type', 'minor')

      console.log(`   📚 大阿爾克那: ${majorCount?.length || 0} 張`)
      console.log(`   🎭 小阿爾克那: ${minorCount?.length || 0} 張`)
    }

    console.log('\n🎉 塔羅牌基礎資料插入完成!')
    console.log('\n📝 下一步: 執行 populate-card-meanings.js 來添加牌義')

    return true

  } catch (error) {
    console.error('❌ 填入資料過程發生錯誤:', error.message)
    return false
  }
}

populateTarotData()