# 🔮 塔羅牌應用後端安裝指南

完整的後端安裝步驟，適用於已有 `Tarot_card_meaning` 表格的情況。

## 📋 前置條件檢查

### 1. 確認現有資料表
確保你的 Supabase 項目中已存在以下表格：
- ✅ `Tarot_card_meaning` - 包含所有78張塔羅牌資料

### 2. 必要欄位檢查
`Tarot_card_meaning` 表格應包含以下欄位：
```sql
- id (UUID, Primary Key)
- name_en (TEXT) - 英文名稱
- name_zh (TEXT) - 中文名稱
- number (INTEGER) - 牌號
- arcana_type (TEXT) - 大牌/小牌類型
- suit (TEXT) - 花色 (如果是小牌)
- image_url (TEXT) - 圖片URL
- keywords (TEXT[] 或 TEXT) - 關鍵字
- element (TEXT) - 元素 (可選)
```

## 🚀 安裝步驟

### 步驟 1: 診斷表格名稱和資料類型問題
```sql
-- 在 Supabase SQL Editor 執行
\i supabase/fix-case-sensitive-references.sql
```
這個腳本會：
- 檢查 `Tarot_card_meaning` 表格是否存在（不區分大小寫）
- 顯示實際的表格名稱和結構
- 驗證必要欄位是否存在

```sql
-- 在 Supabase SQL Editor 執行
\i supabase/fix-data-types.sql
```
這個腳本會：
- 檢查 `Tarot_card_meaning` 表中 `id` 欄位的資料類型
- 建議正確的外鍵資料類型 (UUID vs BIGINT)
- 檢查是否有衝突的現有表格

### 步驟 2: 修正表格引用
```sql
-- 在 Supabase SQL Editor 執行
\i supabase/fix-tarot-references.sql
```
這個腳本會：
- 更新 `get_random_tarot_cards` 函數使用正確的表格名稱

### 步驟 3: 創建用戶系統和相關表格
```sql
-- 在 Supabase SQL Editor 執行
\i supabase/setup-tarot-backend.sql
```
這個腳本會創建：
- `user_profiles` - 用戶資料表
- `daily_cards` - 每日卡片記錄
- `readings` - 占卜記錄
- `friendships` - 朋友關係
- `user_favorites` - 用戶收藏
- 所有必要的 RLS 政策
- 資料庫函數和觸發器

### 步驟 4: 部署 Edge Functions
```bash
# 部署每日卡片功能
supabase functions deploy daily-card

# 部署三卡占卜功能
supabase functions deploy three-card-reading
```

### 步驟 5: 測試安裝
```bash
# 安裝測試依賴
npm install @supabase/supabase-js dotenv

# 執行 API 測試
npm run test:api
```

## 🔧 故障排除

### 問題 1: "relation 'tarot_cards' does not exist"
**原因**: 舊版腳本引用了錯誤的表格名稱或大小寫問題
**解決**:
1. 執行 `fix-case-sensitive-references.sql` 檢查表格名稱
2. 執行 `fix-tarot-references.sql` 修正引用

### 問題 2: "foreign key constraint cannot be implemented" 或 "incompatible types: uuid and bigint"
**原因**: `card_id` 和 `Tarot_card_meaning.id` 的資料類型不匹配
**解決**:
1. 執行 `fix-data-types.sql` 檢查資料類型
2. 如果 `Tarot_card_meaning.id` 是 BIGINT，使用更新後的 schema
3. 如果已存在衝突的表格，先刪除後重建：
```sql
DROP TABLE IF EXISTS daily_cards CASCADE;
DROP TABLE IF EXISTS readings CASCADE;
```

### 問題 3: "column does not exist"
**原因**: `Tarot_card_meaning` 表格缺少必要欄位
**解決**: 檢查表格結構，添加缺少的欄位：
```sql
-- 如果缺少 image_url 欄位
ALTER TABLE Tarot_card_meaning ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 如果缺少 keywords 欄位
ALTER TABLE Tarot_card_meaning ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- 如果缺少 element 欄位
ALTER TABLE Tarot_card_meaning ADD COLUMN IF NOT EXISTS element TEXT;
```

### 問題 4: Edge Functions 部署失敗
**原因**: 函數中的表格引用問題
**解決**: 確保 `Tarot_card_meaning` 表格存在且有正確的欄位結構

### 問題 5: API 測試失敗
**原因**: 用戶認證或權限問題
**解決**:
1. 檢查 `.env` 檔案中的 Supabase 憑證
2. 確保 RLS 政策已正確設置
3. 檢查 Edge Functions 是否已部署

## 📊 驗證安裝

### 1. 檢查表格
```sql
-- 確認所有表格都已創建
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'daily_cards', 'readings', 'friendships', 'user_favorites', 'Tarot_card_meaning');
```

### 2. 檢查 RLS 政策
```sql
-- 確認 RLS 政策已啟用
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('user_profiles', 'daily_cards', 'readings', 'friendships', 'user_favorites');
```

### 3. 檢查函數
```sql
-- 確認資料庫函數已創建
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('get_random_tarot_cards', 'update_user_stats', 'calculate_user_streak');
```

### 4. 測試 API 端點
```bash
# 測試每日卡片 API
curl -X GET "https://your-project.supabase.co/functions/v1/daily-card" \
  -H "Authorization: Bearer your-jwt-token"

# 測試三卡占卜 API
curl -X GET "https://your-project.supabase.co/functions/v1/three-card-reading" \
  -H "Authorization: Bearer your-jwt-token"
```

## 🎯 下一步

安裝完成後，你可以：
1. 📱 開始開發前端應用
2. 🔧 自訂 Edge Functions 功能
3. 📊 添加更多分析功能
4. 🎨 整合 AI 解讀功能

## 📞 支援

如果遇到問題：
1. 檢查 Supabase 控制台的日誌
2. 確認所有環境變數已正確設置
3. 驗證表格結構和權限設置
4. 運行測試腳本檢查 API 功能

---

🔮 **準備好享受你的塔羅牌應用了！** ✨