import { supabase } from './client.js'

/**
 * 塔羅牌用戶系統管理工具
 * 包含用戶資料、每日卡片、占卜記錄等完整功能
 */

/**
 * 用戶資料管理
 */
export const userProfiles = {

  /**
   * 獲取當前用戶資料
   * @returns {Promise<{data, error}>}
   */
  async getCurrentUserProfile() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { data, error }
  },

  /**
   * 創建或更新用戶資料
   * @param {Object} profileData - 用戶資料
   * @returns {Promise<{data, error}>}
   */
  async upsertUserProfile(profileData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  /**
   * 更新用戶偏好設定
   * @param {Object} preferences - 偏好設定
   * @returns {Promise<{data, error}>}
   */
  async updateUserPreferences(preferences) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const updates = {}
    if (preferences.notifications) {
      updates.notification_settings = preferences.notifications
    }
    if (preferences.privacy) {
      updates.privacy_settings = preferences.privacy
    }
    if (preferences.language) {
      updates.preferred_language = preferences.language
    }
    if (preferences.deck) {
      updates.favorite_deck = preferences.deck
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    return { data, error }
  },

  /**
   * 獲取用戶統計資料
   * @returns {Promise<{data, error}>}
   */
  async getUserStats() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const { data, error } = await supabase
      .from('user_dashboard')
      .select('*')
      .eq('id', user.id)
      .single()

    return { data, error }
  },

  /**
   * 更新用戶統計 (調用資料庫函數)
   * @returns {Promise<{data, error}>}
   */
  async updateUserStats() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const { data, error } = await supabase
      .rpc('update_user_stats', { user_uuid: user.id })

    return { data, error }
  }
}

/**
 * 每日卡片管理
 */
export const dailyCards = {

  /**
   * 檢查今日是否已抽牌
   * @returns {Promise<{data, error}>}
   */
  async checkTodayCard() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_cards')
      .select(`
        *,
        tarot_cards(*)
      `)
      .eq('user_id', user.id)
      .eq('draw_date', today)
      .single()

    return { data, error }
  },

  /**
   * 抽取今日卡片
   * @param {Object} options - 抽牌選項
   * @returns {Promise<{data, error}>}
   */
  async drawTodayCard(options = {}) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    try {
      // 檢查今日是否已抽牌
      const { data: existingCard } = await this.checkTodayCard()
      if (existingCard) {
        return { data: existingCard, error: new Error('今日已抽牌') }
      }

      // 獲取隨機卡片
      const { data: allCards, error: cardsError } = await supabase
        .from('tarot_cards')
        .select('id')

      if (cardsError || !allCards || allCards.length === 0) {
        return { data: null, error: cardsError || new Error('無法獲取卡片') }
      }

      // 隨機選擇卡片
      const randomCard = allCards[Math.floor(Math.random() * allCards.length)]
      const isReversed = options.allowReversed ? Math.random() < 0.3 : false

      // 記錄每日卡片
      const dailyCardData = {
        user_id: user.id,
        card_id: randomCard.id,
        is_reversed: isReversed,
        draw_date: new Date().toISOString().split('T')[0],
        question_asked: options.question || null,
        mood_before: options.moodBefore || null
      }

      const { data: dailyCard, error: insertError } = await supabase
        .from('daily_cards')
        .insert(dailyCardData)
        .select(`
          *,
          tarot_cards(*)
        `)
        .single()

      if (insertError) {
        return { data: null, error: insertError }
      }

      // 更新用戶統計
      await this.updateUserStats()

      return { data: dailyCard, error: null }

    } catch (error) {
      return { data: null, error }
    }
  },

  /**
   * 更新今日卡片反思
   * @param {Object} reflection - 反思內容
   * @returns {Promise<{data, error}>}
   */
  async updateTodayReflection(reflection) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_cards')
      .update({
        personal_reflection: reflection.reflection,
        mood_after: reflection.moodAfter,
        key_insights: reflection.insights || [],
        accuracy_rating: reflection.accuracyRating,
        helpfulness_rating: reflection.helpfulnessRating,
        learned_something_new: reflection.learnedNew || false,
        new_learning_notes: reflection.learningNotes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('draw_date', today)
      .select(`
        *,
        tarot_cards(*)
      `)
      .single()

    return { data, error }
  },

  /**
   * 獲取每日卡片歷史
   * @param {number} days - 天數
   * @returns {Promise<{data, error}>}
   */
  async getDailyCardHistory(days = 30) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('daily_cards')
      .select(`
        *,
        tarot_cards(name_en, name_zh, image_url)
      `)
      .eq('user_id', user.id)
      .gte('draw_date', startDate.toISOString().split('T')[0])
      .order('draw_date', { ascending: false })

    return { data, error }
  },

  /**
   * 計算連續抽牌天數
   * @returns {Promise<{data, error}>}
   */
  async calculateStreak() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const { data, error } = await supabase
      .rpc('calculate_streak', { user_uuid: user.id })

    return { data, error }
  }
}

/**
 * 占卜記錄管理
 */
export const readings = {

  /**
   * 創建新的占卜記錄
   * @param {Object} readingData - 占卜資料
   * @returns {Promise<{data, error}>}
   */
  async createReading(readingData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const reading = {
      user_id: user.id,
      reading_type: readingData.type,
      question: readingData.question,
      question_category: readingData.category || 'general',
      cards_drawn: readingData.cardsDrawn,
      total_cards: readingData.cardsDrawn.length,
      interpretation: readingData.interpretation,
      key_themes: readingData.themes || [],
      overall_energy: readingData.energy,
      advice_given: readingData.advice,
      suggested_actions: readingData.actions || [],
      is_public: readingData.isPublic || false,
      tags: readingData.tags || [],
      deck_used: readingData.deck || 'rider_waite'
    }

    const { data, error } = await supabase
      .from('readings')
      .insert(reading)
      .select()
      .single()

    if (!error) {
      // 更新用戶統計
      await userProfiles.updateUserStats()
    }

    return { data, error }
  },

  /**
   * 獲取用戶的占卜記錄
   * @param {Object} options - 查詢選項
   * @returns {Promise<{data, error}>}
   */
  async getUserReadings(options = {}) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    let query = supabase
      .from('readings')
      .select('*')
      .eq('user_id', user.id)

    if (options.type) {
      query = query.eq('reading_type', options.type)
    }

    if (options.category) {
      query = query.eq('question_category', options.category)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    return { data, error }
  },

  /**
   * 獲取特定占卜記錄
   * @param {string} readingId - 占卜記錄ID
   * @returns {Promise<{data, error}>}
   */
  async getReading(readingId) {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('id', readingId)
      .single()

    return { data, error }
  },

  /**
   * 更新占卜記錄
   * @param {string} readingId - 占卜記錄ID
   * @param {Object} updates - 更新資料
   * @returns {Promise<{data, error}>}
   */
  async updateReading(readingId, updates) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const { data, error } = await supabase
      .from('readings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', readingId)
      .eq('user_id', user.id) // 確保只能更新自己的記錄
      .select()
      .single()

    return { data, error }
  },

  /**
   * 評價占卜記錄
   * @param {string} readingId - 占卜記錄ID
   * @param {Object} ratings - 評分資料
   * @returns {Promise<{data, error}>}
   */
  async rateReading(readingId, ratings) {
    return this.updateReading(readingId, {
      satisfaction_rating: ratings.satisfaction,
      accuracy_rating: ratings.accuracy,
      followed_advice: ratings.followedAdvice,
      outcome_notes: ratings.outcomeNotes
    })
  },

  /**
   * 獲取占卜統計
   * @returns {Promise<{data, error}>}
   */
  async getReadingStatistics() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const { data, error } = await supabase
      .from('reading_statistics')
      .select('*')
      .eq('user_id', user.id)

    return { data, error }
  }
}

/**
 * 學習進度管理
 */
export const learningProgress = {

  /**
   * 獲取用戶學習進度
   * @param {string} contentType - 內容類型
   * @returns {Promise<{data, error}>}
   */
  async getUserProgress(contentType = null) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    let query = supabase
      .from('user_learning_progress')
      .select('*')
      .eq('user_id', user.id)

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    const { data, error } = await query.order('updated_at', { ascending: false })

    return { data, error }
  },

  /**
   * 更新學習進度
   * @param {string} contentType - 內容類型
   * @param {string} contentId - 內容ID
   * @param {Object} progressData - 進度資料
   * @returns {Promise<{data, error}>}
   */
  async updateProgress(contentType, contentId, progressData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const { data, error } = await supabase
      .from('user_learning_progress')
      .upsert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        ...progressData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  }
}

/**
 * 用戶互動管理
 */
export const userInteractions = {

  /**
   * 添加收藏
   * @param {string} targetType - 目標類型
   * @param {string} targetId - 目標ID
   * @param {Object} data - 額外資料
   * @returns {Promise<{data, error}>}
   */
  async addFavorite(targetType, targetId, data = {}) {
    return this.addInteraction('favorite_card', targetType, targetId, data)
  },

  /**
   * 添加互動
   * @param {string} interactionType - 互動類型
   * @param {string} targetType - 目標類型
   * @param {string} targetId - 目標ID
   * @param {Object} data - 互動資料
   * @returns {Promise<{data, error}>}
   */
  async addInteraction(interactionType, targetType, targetId, data = {}) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    const interaction = {
      user_id: user.id,
      interaction_type: interactionType,
      target_type: targetType,
      target_id: targetId,
      interaction_data: data
    }

    const { data: result, error } = await supabase
      .from('user_interactions')
      .insert(interaction)
      .select()
      .single()

    return { data: result, error }
  },

  /**
   * 獲取用戶互動
   * @param {string} interactionType - 互動類型
   * @returns {Promise<{data, error}>}
   */
  async getUserInteractions(interactionType = null) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: authError || new Error('用戶未登入') }
    }

    let query = supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', user.id)

    if (interactionType) {
      query = query.eq('interaction_type', interactionType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    return { data, error }
  }
}

export default {
  userProfiles,
  dailyCards,
  readings,
  learningProgress,
  userInteractions
}