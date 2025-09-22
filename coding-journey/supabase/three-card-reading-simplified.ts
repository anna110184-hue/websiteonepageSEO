// three-card-reading Edge Function - 複製此完整程式碼到 Supabase Dashboard
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Invalid or expired token')

    const { method } = req

    switch (method) {
      case 'GET':
        return await handleGetReadings(supabase, user.id, req)
      case 'POST':
        const body = await req.json()
        return await handleCreateReading(supabase, user.id, body)
      case 'PUT':
        const updateBody = await req.json()
        return await handleUpdateReading(supabase, user.id, updateBody)
      default:
        throw new Error(`Method ${method} not allowed`)
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleGetReadings(supabase: any, userId: string, req: Request) {
  const url = new URL(req.url)
  const readingId = url.searchParams.get('id')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('readings')
    .select('*, cards_drawn')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (readingId) {
    query = query.eq('id', readingId).single()
    const { data: reading, error } = await query
    if (error) throw new Error(`Database error: ${error.message}`)

    return new Response(
      JSON.stringify({
        success: true,
        data: reading,
        message: 'Reading retrieved successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else {
    query = query.range(offset, offset + limit - 1)
    const { data: readings, error, count } = await query
    if (error) throw new Error(`Database error: ${error.message}`)

    return new Response(
      JSON.stringify({
        success: true,
        data: readings,
        count: count,
        message: 'Readings retrieved successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleCreateReading(supabase: any, userId: string, body: any) {
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('allow_reversed_cards')
    .eq('id', userId)
    .single()

  const allowReversed = userProfile?.allow_reversed_cards ?? true
  const excludeCards = body.exclude_cards || []

  const { data: randomCards, error: randomError } = await supabase
    .rpc('get_random_tarot_cards', {
      card_count: 3,
      allow_reversed: allowReversed,
      exclude_cards: excludeCards
    })

  if (randomError || !randomCards || randomCards.length !== 3) {
    throw new Error('Failed to get three random cards')
  }

  const positions = ['past', 'present', 'future']
  const positionMeanings = {
    past: '過去的影響與根源',
    present: '當前的狀況與挑戰',
    future: '未來的趨勢與可能性'
  }

  const cardsDrawn = randomCards.map((card: any, index: number) => ({
    card_id: card.id,
    position: positions[index],
    position_meaning: positionMeanings[positions[index] as keyof typeof positionMeanings],
    is_reversed: card.is_reversed,
    card_data: {
      name_en: card.name_en,
      name_zh: card.name_zh,
      number: card.number,
      arcana_type: card.arcana_type,
      suit: card.suit,
      image_url: card.image_url
    }
  }))

  const readingData = {
    user_id: userId,
    reading_type: 'three_card_spread',
    question: body.question || '',
    question_category: body.question_category || 'general',
    cards_drawn: cardsDrawn,
    total_cards: 3,
    interpretation: body.interpretation || null,
    key_themes: body.key_themes || [],
    overall_energy: body.overall_energy || null,
    advice_given: body.advice_given || null,
    suggested_actions: body.suggested_actions || [],
    is_public: body.is_public || false,
    tags: body.tags || [],
    deck_used: body.deck_used || 'rider_waite'
  }

  const { data: reading, error: insertError } = await supabase
    .from('readings')
    .insert(readingData)
    .select()
    .single()

  if (insertError) {
    throw new Error(`Failed to create reading: ${insertError.message}`)
  }

  await supabase.rpc('update_user_stats', { user_uuid: userId })

  return new Response(
    JSON.stringify({
      success: true,
      data: { ...reading, cards_drawn: cardsDrawn },
      message: 'Three card reading created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateReading(supabase: any, userId: string, body: any) {
  const { reading_id, ...updates } = body
  if (!reading_id) throw new Error('Reading ID is required')

  const updateData: any = {}
  if (updates.interpretation !== undefined) updateData.interpretation = updates.interpretation
  if (updates.key_themes !== undefined) updateData.key_themes = updates.key_themes
  if (updates.overall_energy !== undefined) updateData.overall_energy = updates.overall_energy
  if (updates.advice_given !== undefined) updateData.advice_given = updates.advice_given
  if (updates.suggested_actions !== undefined) updateData.suggested_actions = updates.suggested_actions
  if (updates.satisfaction_rating !== undefined) updateData.satisfaction_rating = updates.satisfaction_rating
  if (updates.accuracy_rating !== undefined) updateData.accuracy_rating = updates.accuracy_rating
  if (updates.followed_advice !== undefined) updateData.followed_advice = updates.followed_advice
  if (updates.follow_up_notes !== undefined) updateData.follow_up_notes = updates.follow_up_notes
  if (updates.follow_up_date !== undefined) updateData.follow_up_date = updates.follow_up_date
  if (updates.is_public !== undefined) updateData.is_public = updates.is_public
  if (updates.is_favorite !== undefined) updateData.is_favorite = updates.is_favorite
  if (updates.tags !== undefined) updateData.tags = updates.tags

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update')
  }

  const { data: updatedReading, error } = await supabase
    .from('readings')
    .update(updateData)
    .eq('id', reading_id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update reading: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: updatedReading,
      message: 'Reading updated successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}