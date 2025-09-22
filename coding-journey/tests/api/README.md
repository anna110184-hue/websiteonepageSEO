# 🧪 塔羅牌應用 API 測試指南

完整的 API 端點測試套件，涵蓋每日卡片和三卡占卜功能。

## 🚀 快速開始

### 前置條件

1. **環境變數設置**
   ```bash
   # .env 檔案內容
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

2. **資料庫設置**
   ```sql
   -- 在 Supabase SQL Editor 執行
   執行: supabase/setup-tarot-backend.sql
   ```

3. **Edge Functions 部署**
   - daily-card 函數已部署
   - three-card-reading 函數已部署

### 執行測試

```bash
# 執行所有測試
npm run test:api
# 或
node tests/api/run-all-tests.js

# 執行個別測試
node tests/api/test-daily-card-api.js
node tests/api/test-three-card-reading-api.js
```

## 📋 測試內容

### 🗓️ 每日卡片 API 測試

**檔案**: `test-daily-card-api.js`

**測試項目**:
1. **GET /daily-card** - 檢查今日是否已抽牌
2. **POST /daily-card** - 抽取每日卡片
3. **PUT /daily-card** - 更新每日反思
4. **重複抽牌防護** - 驗證每日限制

**測試資料**:
```javascript
{
  question: "今天我需要關注什麼？",
  mood_before: "期待且好奇",
  life_situation: "正在學習新技能"
}
```

### 🔮 三卡占卜 API 測試

**檔案**: `test-three-card-reading-api.js`

**測試項目**:
1. **POST /three-card-reading** - 創建三卡占卜
2. **GET /three-card-reading** - 獲取占卜記錄列表
3. **GET /three-card-reading?id=xxx** - 獲取特定占卜
4. **PUT /three-card-reading** - 更新占卜記錄
5. **多主題測試** - 不同問題類別

**占卜位置**:
- **過去** (past): 過去的影響與根源
- **現在** (present): 當前的狀況與挑戰
- **未來** (future): 未來的趨勢與可能性

## 🔧 測試設置

### 自動用戶創建

測試腳本會自動處理用戶認證:
```javascript
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'testpassword123'
```

首次執行會:
1. 註冊測試用戶
2. 自動登入獲取 JWT
3. 使用 JWT 進行 API 測試

### 錯誤處理

測試包含完整的錯誤處理:
- 網路連接錯誤
- 認證失敗
- API 回應錯誤
- 資料驗證錯誤

## 📊 預期結果

### 成功回應格式

**每日卡片**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "card_id": "uuid",
    "is_reversed": false,
    "draw_date": "2024-01-01",
    "question_asked": "今天我需要關注什麼？",
    "tarot_cards": {
      "name_zh": "愚者",
      "name_en": "The Fool",
      "arcana_type": "major"
    }
  },
  "message": "Daily card drawn successfully"
}
```

**三卡占卜**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reading_type": "three_card_spread",
    "question": "我的事業發展方向如何？",
    "cards_drawn": [
      {
        "position": "past",
        "position_meaning": "過去的影響與根源",
        "is_reversed": false,
        "card_data": { ... }
      }
    ]
  }
}
```

## 🛠️ 故障排除

### 常見問題

1. **認證失敗**
   ```
   ❌ 錯誤: Invalid or expired token
   ```
   **解決**: 檢查 SUPABASE_ANON_KEY 是否正確

2. **資料庫錯誤**
   ```
   ❌ 錯誤: relation "daily_cards" does not exist
   ```
   **解決**: 執行 setup-tarot-backend.sql

3. **Edge Function 錯誤**
   ```
   ❌ 錯誤: Function not found
   ```
   **解決**: 確認 Edge Functions 已部署

4. **CORS 錯誤**
   ```
   ❌ 錯誤: CORS policy
   ```
   **解決**: 檢查 corsHeaders 設定

### 詳細除錯

啟用詳細日誌:
```bash
DEBUG=* node tests/api/test-daily-card-api.js
```

## 📈 測試報告

執行後會顯示:
- ✅ 成功的測試項目
- ❌ 失敗的測試項目
- 📊 API 回應狀態碼
- 📄 回應內容範例
- 💡 故障排除建議

## 🔗 相關檔案

- `supabase/setup-tarot-backend.sql` - 資料庫 schema
- `supabase/functions/daily-card/index.ts` - 每日卡片函數
- `supabase/functions/three-card-reading/index.ts` - 三卡占卜函數
- `supabase/functions/_shared/cors.ts` - CORS 設定

## 🎯 持續整合

可整合到 CI/CD 流程:
```yaml
# GitHub Actions 範例
- name: Run API Tests
  run: |
    npm install
    node tests/api/run-all-tests.js
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```