# 🚀 Edge Functions 手動部署指南

由於 Supabase CLI 安裝問題，這裡提供透過 Supabase Dashboard 手動部署 Edge Functions 的方法。

## 📋 方法一：Supabase Dashboard 部署

### 步驟 1: 進入 Supabase Dashboard
1. 前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登入你的帳號
3. 選擇專案: `dxnfkfljryacxpzlncem`

### 步驟 2: 創建 daily-card Edge Function
1. 點選左側選單 **"Edge Functions"**
2. 點擊 **"Create a new function"**
3. 設定：
   - **Function name**: `daily-card`
   - **Template**: 選擇 **"HTTP Request"**
4. 將以下程式碼複製貼入編輯器：

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid or expired token')
    }

    // Parse request
    const { method } = req
    const url = new URL(req.url)

    switch (method) {
      case 'GET':
        return await handleGetDailyCard(supabase, user.id)
      case 'POST':
        const body = await req.json()
        return await handleDrawDailyCard(supabase, user.id, body)
      case 'PUT':
        const updateBody = await req.json()
        return await handleUpdateDailyCard(supabase, user.id, updateBody)
      default:
        throw new Error(`Method ${method} not allowed`)
    }

  } catch (error) {
    console.error('Daily card function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// 獲取今日卡片
async function handleGetDailyCard(supabase: any, userId: string) {
  const today = new Date().toISOString().split('T')[0]

  // 檢查今日是否已抽牌
  const { data: dailyCard, error } = await supabase
    .from('daily_cards')
    .select(\`
      *,
      "Tarot_card_meaning" (
        id,
        name_en,
        name_zh,
        number,
        arcana_type,
        suit,
        image_url,
        keywords,
        element
      )
    \`)
    .eq('user_id', userId)
    .eq('draw_date', today)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(\`Database error: \${error.message}\`)
  }

  // 如果沒有今日卡片，返回空結果
  if (!dailyCard) {
    return new Response(
      JSON.stringify({
        success: true,
        data: null,
        message: 'No daily card drawn today'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: dailyCard,
      message: 'Daily card retrieved successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// 抽取今日卡片
async function handleDrawDailyCard(supabase: any, userId: string, body: any) {
  const today = new Date().toISOString().split('T')[0]

  // 檢查今日是否已抽牌
  const { data: existing } = await supabase
    .from('daily_cards')
    .select('id')
    .eq('user_id', userId)
    .eq('draw_date', today)
    .single()

  if (existing) {
    throw new Error('Daily card already drawn today')
  }

  // 獲取用戶偏好設定
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('allow_reversed_cards')
    .eq('id', userId)
    .single()

  const allowReversed = userProfile?.allow_reversed_cards ?? true

  // 使用資料庫函數獲取隨機卡片
  const { data: randomCards, error: randomError } = await supabase
    .rpc('get_random_tarot_cards', {
      card_count: 1,
      allow_reversed: allowReversed,
      exclude_cards: []
    })

  if (randomError || !randomCards || randomCards.length === 0) {
    throw new Error('Failed to get random card')
  }

  const selectedCard = randomCards[0]

  // 創建每日卡片記錄
  const dailyCardData = {
    user_id: userId,
    card_id: selectedCard.id,
    is_reversed: selectedCard.is_reversed,
    draw_date: today,
    question_asked: body.question || null,
    mood_before: body.mood_before || null,
    life_situation: body.life_situation || null
  }

  const { data: dailyCard, error: insertError } = await supabase
    .from('daily_cards')
    .insert(dailyCardData)
    .select(\`
      *,
      "Tarot_card_meaning" (
        id,
        name_en,
        name_zh,
        number,
        arcana_type,
        suit,
        image_url,
        keywords,
        element
      )
    \`)
    .single()

  if (insertError) {
    throw new Error(\`Failed to save daily card: \${insertError.message}\`)
  }

  // 更新用戶統計
  await supabase.rpc('update_user_stats', { user_uuid: userId })
  await supabase.rpc('calculate_user_streak', { user_uuid: userId })

  return new Response(
    JSON.stringify({
      success: true,
      data: dailyCard,
      message: 'Daily card drawn successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// 更新今日卡片反思
async function handleUpdateDailyCard(supabase: any, userId: string, body: any) {
  const today = new Date().toISOString().split('T')[0]

  const updates: any = {}

  if (body.personal_reflection !== undefined) {
    updates.personal_reflection = body.personal_reflection
  }
  if (body.mood_after !== undefined) {
    updates.mood_after = body.mood_after
  }
  if (body.key_insights !== undefined) {
    updates.key_insights = body.key_insights
  }
  if (body.accuracy_rating !== undefined) {
    updates.accuracy_rating = body.accuracy_rating
  }
  if (body.helpfulness_rating !== undefined) {
    updates.helpfulness_rating = body.helpfulness_rating
  }
  if (body.learned_something_new !== undefined) {
    updates.learned_something_new = body.learned_something_new
  }
  if (body.new_learning_notes !== undefined) {
    updates.new_learning_notes = body.new_learning_notes
  }
  if (body.synchronicity_notes !== undefined) {
    updates.synchronicity_notes = body.synchronicity_notes
  }
  if (body.is_shared !== undefined) {
    updates.is_shared = body.is_shared
  }
  if (body.share_message !== undefined) {
    updates.share_message = body.share_message
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No valid fields to update')
  }

  const { data: updatedCard, error } = await supabase
    .from('daily_cards')
    .update(updates)
    .eq('user_id', userId)
    .eq('draw_date', today)
    .select(\`
      *,
      "Tarot_card_meaning" (
        id,
        name_en,
        name_zh,
        number,
        arcana_type,
        suit,
        image_url,
        keywords,
        element
      )
    \`)
    .single()

  if (error) {
    throw new Error(\`Failed to update daily card: \${error.message}\`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedCard,
      message: 'Daily card updated successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
```

5. 點擊 **"Deploy function"**

### 步驟 3: 創建 three-card-reading Edge Function
1. 再次點擊 **"Create a new function"**
2. 設定：
   - **Function name**: `three-card-reading`
   - **Template**: 選擇 **"HTTP Request"**
3. 將 `three-card-reading/index.ts` 的完整內容複製貼入

## 📋 方法二：ZIP 檔案上傳 (如果支援)

如果 Dashboard 支援 ZIP 上傳：

1. 壓縮 Edge Functions 資料夾：
```bash
cd supabase/functions
zip -r daily-card.zip daily-card/
zip -r three-card-reading.zip three-card-reading/
```

2. 在 Dashboard 中選擇 **"Upload ZIP"** 選項

## 🧪 測試部署

部署完成後，你的 Edge Functions 網址會是：

- **daily-card**: `https://dxnfkfljryacxpzlncem.supabase.co/functions/v1/daily-card`
- **three-card-reading**: `https://dxnfkfljryacxpzlncem.supabase.co/functions/v1/three-card-reading`

### 測試步驟：
1. 使用我們準備好的測試腳本：
```bash
npm run test:api
```

2. 或手動測試：
```bash
curl -X GET "https://dxnfkfljryacxpzlncem.supabase.co/functions/v1/daily-card" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 故障排除

### 常見問題：

1. **"Missing Authorization header"**
   - 確保在 headers 中包含 JWT token

2. **"CORS error"**
   - 確保 corsHeaders 設定正確

3. **"Database error"**
   - 確保已執行所有 SQL setup 腳本

4. **"Function not found"**
   - 檢查函數名稱拼寫
   - 確認部署狀態

## 📞 後續支援

部署完成後，你的塔羅牌應用就有完整的 API 端點了！

如果遇到問題：
1. 檢查 Supabase Dashboard 中的 Edge Functions 日誌
2. 確認環境變數設定
3. 運行 API 測試腳本驗證功能