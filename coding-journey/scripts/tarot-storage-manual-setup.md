# 🔮 塔羅牌儲存手動設置指南

由於 RLS (Row Level Security) 限制，需要在 Supabase Dashboard 手動設置 storage bucket。

## 📋 設置步驟

### Step 1: 創建 Storage Bucket

1. 前往你的 [Supabase Dashboard](https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem)
2. 點擊左側菜單的 **Storage**
3. 點擊 **Create bucket** 按鈕
4. 設置以下參數:
   - **Bucket name**: `tarot-cards`
   - **Public bucket**: ✅ 勾選 (設為公開)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`

### Step 2: 設置 Storage Policies

1. 在 Storage 頁面，點擊 **Policies** 標籤
2. 點擊 **New Policy**
3. 選擇 **For full customization**
4. 設置以下政策:

#### 公開讀取政策
```sql
CREATE POLICY "Public read access for tarot cards"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tarot-cards');
```

#### 認證用戶上傳政策 (可選)
```sql
CREATE POLICY "Authenticated users can upload tarot cards"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tarot-cards');
```

### Step 3: 創建資料夾結構

完成上述設置後，執行以下腳本來創建資料夾結構:

```bash
node scripts/create-tarot-folders.js
```

## 🔗 Bucket URL

設置完成後，你的塔羅牌圖片將可通過以下 URL 格式訪問:

```
https://dxnfkfljryacxpzlncem.supabase.co/storage/v1/object/public/tarot-cards/{path}
```

## 📁 資料夾結構

```
tarot-cards/
├── major-arcana/           # 大阿爾克那牌
├── minor-arcana/
│   ├── cups/              # 聖杯牌組
│   ├── swords/            # 寶劍牌組
│   ├── wands/             # 權杖牌組
│   └── pentacles/         # 金幣牌組
```

## 🎯 完成後測試

設置完成後，可以執行測試腳本:

```bash
node scripts/test-tarot-storage.js
```