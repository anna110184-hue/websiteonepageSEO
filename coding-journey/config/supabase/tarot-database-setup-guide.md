# 🔮 塔羅牌資料庫設置指南

## 📋 設置步驟

### Step 1: 在 Supabase 創建資料庫表格

1. **前往 SQL Editor**
   - 網址: https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem/sql
   - 登入你的 Supabase 帳號

2. **執行 Schema SQL**
   - 開啟檔案: `scripts/create-tarot-database-schema.sql`
   - 複製全部內容
   - 貼到 SQL Editor
   - 點擊 "Run" 執行

### Step 2: 填入塔羅牌基礎資料

完成 Step 1 後，執行：

```bash
node scripts/populate-tarot-data.js
```

這會插入所有 78 張塔羅牌的基本資訊。

### Step 3: 添加牌義資料

```bash
node scripts/populate-card-meanings.js
```

## 🗄️ 資料庫結構說明

### 1. `tarot_cards` 表 - 塔羅牌基本資訊
```sql
- id: UUID (主鍵)
- name_en: 英文名稱 ("The Fool")
- name_zh: 中文名稱 ("愚者")
- number: 牌號 (0-21大阿爾克那, 1-14小阿爾克那)
- arcana_type: 'major' | 'minor'
- suit: 'cups' | 'swords' | 'wands' | 'pentacles'
- court_card: 'page' | 'knight' | 'queen' | 'king'
- image_filename: 圖片檔名
- image_path: Storage 路徑
- image_url: 公開 URL
- element: 對應元素
- keywords: 關鍵字陣列
```

### 2. `card_meanings` 表 - 牌義詮釋
```sql
- id: UUID (主鍵)
- card_id: 關聯到 tarot_cards
- interpretation_type: 'upright' | 'reversed'
- category: 'general' | 'love' | 'career' | 'health' | 'spiritual' | 'finance'
- short_meaning: 簡短牌義
- detailed_meaning: 詳細解釋
- advice: 建議
- emotional_tone: 情感色調
```

### 3. `tarot_spreads` 表 - 牌陣模式
```sql
- id: UUID (主鍵)
- name_en/name_zh: 牌陣名稱
- description: 描述
- positions: 牌位數量
- layout_data: 牌陣佈局 (JSON)
- difficulty_level: 難度等級 (1-5)
```

### 4. `tarot_readings` 表 - 占卜記錄
```sql
- id: UUID (主鍵)
- user_id: 用戶ID (可選)
- spread_id: 使用的牌陣
- question: 占卜問題
- cards_drawn: 抽到的牌 (JSON)
- interpretation_summary: 整體解讀
```

## 📊 你將會得到的資料

### 🌟 大阿爾克那 (22張)
- 0. 愚者 (The Fool)
- 1. 魔術師 (The Magician)
- 2. 女祭司 (The High Priestess)
- ... 到 21. 世界 (The World)

### 🎭 小阿爾克那 (56張)
每個花色 14 張:
- **🏆 聖杯 (Cups)**: 水元素，情感、愛情、靈性
- **⚔️ 寶劍 (Swords)**: 風元素，思想、溝通、衝突
- **🪄 權杖 (Wands)**: 火元素，行動、創造、能量
- **🪙 金幣 (Pentacles)**: 土元素，物質、財富、實際

每個花色包含:
- 數字牌: A-10 (10張)
- 宮廷牌: 侍者、騎士、皇后、國王 (4張)

## 🎯 牌義類型

每張牌都會有多種詮釋:

### 正逆位
- **正位 (Upright)**: 正面意義
- **逆位 (Reversed)**: 逆位或挑戰意義

### 領域分類
- **一般 (General)**: 基本牌義
- **愛情 (Love)**: 感情關係
- **事業 (Career)**: 工作職場
- **健康 (Health)**: 身心健康
- **靈性 (Spiritual)**: 精神修行
- **財務 (Finance)**: 金錢財富

## 🚀 使用方式

設置完成後，你可以:

1. **查詢特定卡牌**
```javascript
const { data } = await supabase
  .from('tarot_cards')
  .select('*, card_meanings(*)')
  .eq('name_en', 'The Fool')
```

2. **獲取隨機卡牌**
```javascript
const { data } = await supabase.rpc('get_random_cards', { count: 3 })
```

3. **按類型篩選**
```javascript
const { data } = await supabase
  .from('tarot_cards')
  .select('*')
  .eq('arcana_type', 'major')
```

## 🔧 下一步功能

資料庫設置完成後，你可以開發:
- 🎲 隨機抽牌功能
- 🔮 牌陣占卜系統
- 📚 牌義學習工具
- 📱 塔羅日記應用
- 🤖 AI 輔助解讀

## ✅ 驗證清單

設置完成後確認:
- [ ] 4個表格都創建成功
- [ ] 78張卡牌資料都插入
- [ ] 圖片 URL 都可以訪問
- [ ] 牌義資料都完整
- [ ] RLS 政策正確設置

完成後你就有一個完整的塔羅牌資料庫系統了！🎉