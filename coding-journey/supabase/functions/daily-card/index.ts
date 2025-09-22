import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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
    .select(`
      *,
      tarot_cards (
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
    `)
    .eq('user_id', userId)
    .eq('draw_date', today)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Database error: ${error.message}`)
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
    .select(`
      *,
      tarot_cards (
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
    `)
    .single()

  if (insertError) {
    throw new Error(`Failed to save daily card: ${insertError.message}`)
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
    .select(`
      *,
      tarot_cards (
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
    `)
    .single()

  if (error) {
    throw new Error(`Failed to update daily card: ${error.message}`)
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