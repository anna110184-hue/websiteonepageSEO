import { supabase } from './client.js'

/**
 * 個人化塔羅牌功能管理工具
 * 支援個人解釋、智慧話語、每日靈感等功能
 */

/**
 * 個人化解釋管理
 */
export const personalInterpretations = {

  /**
   * 添加個人化解釋
   * @param {string} cardId - 卡牌ID
   * @param {Object} interpretation - 個人解釋資料
   * @param {string} userId - 用戶ID (可選)
   * @returns {Promise<{data, error}>}
   */
  async addPersonalInterpretation(cardId, interpretation, userId = null) {
    const data = {
      card_id: cardId,
      user_id: userId,
      ...interpretation
    }

    const { data: result, error } = await supabase
      .from('personal_card_interpretations')
      .insert(data)
      .select()

    return { data: result, error }
  },

  /**
   * 獲取用戶的個人解釋
   * @param {string} userId - 用戶ID
   * @param {string} cardId - 卡牌ID (可選)
   * @returns {Promise<{data, error}>}
   */
  async getUserInterpretations(userId, cardId = null) {
    let query = supabase
      .from('personal_card_interpretations')
      .select(`
        *,
        tarot_cards(name_en, name_zh, image_url)
      `)
      .eq('user_id', userId)

    if (cardId) {
      query = query.eq('card_id', cardId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    return { data, error }
  },

  /**
   * 更新個人解釋
   * @param {string} interpretationId - 解釋ID
   * @param {Object} updates - 更新資料
   * @returns {Promise<{data, error}>}
   */
  async updatePersonalInterpretation(interpretationId, updates) {
    const { data, error } = await supabase
      .from('personal_card_interpretations')
      .update(updates)
      .eq('id', interpretationId)
      .select()

    return { data, error }
  }
}

/**
 * 智慧話語管理
 */
export const wisdomCollection = {

  /**
   * 添加智慧話語
   * @param {string} cardId - 卡牌ID
   * @param {Object} wisdomData - 智慧話語資料
   * @returns {Promise<{data, error}>}
   */
  async addWisdom(cardId, wisdomData) {
    const data = {
      card_id: cardId,
      ...wisdomData
    }

    const { data: result, error } = await supabase
      .from('tarot_wisdom_collection')
      .insert(data)
      .select()

    return { data: result, error }
  },

  /**
   * 獲取卡牌的智慧話語
   * @param {string} cardId - 卡牌ID
   * @param {string} interpretationType - 'upright' | 'reversed' | 'general'
   * @returns {Promise<{data, error}>}
   */
  async getCardWisdom(cardId, interpretationType = null) {
    let query = supabase
      .from('tarot_wisdom_collection')
      .select('*')
      .eq('card_id', cardId)

    if (interpretationType) {
      query = query.eq('interpretation_type', interpretationType)
    }

    query = query.order('user_rating', { ascending: false })

    const { data, error } = await query

    return { data, error }
  },

  /**
   * 獲取隨機智慧話語
   * @param {string} wisdomType - 智慧類型
   * @param {number} count - 數量
   * @returns {Promise<{data, error}>}
   */
  async getRandomWisdom(wisdomType = null, count = 1) {
    try {
      let query = supabase
        .from('tarot_wisdom_collection')
        .select(`
          *,
          tarot_cards(name_en, name_zh)
        `)

      if (wisdomType) {
        query = query.eq('wisdom_type', wisdomType)
      }

      // 獲取所有資料然後隨機選擇
      const { data: allWisdom, error } = await query

      if (error) {
        return { data: null, error }
      }

      if (!allWisdom || allWisdom.length === 0) {
        return { data: [], error: null }
      }

      // 隨機選擇
      const shuffled = allWisdom.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, count)

      return { data: selected, error: null }

    } catch (error) {
      return { data: null, error }
    }
  },

  /**
   * 評分智慧話語
   * @param {string} wisdomId - 智慧話語ID
   * @param {number} rating - 評分 (1-5)
   * @returns {Promise<{data, error}>}
   */
  async rateWisdom(wisdomId, rating) {
    const { data, error } = await supabase
      .from('tarot_wisdom_collection')
      .update({ user_rating: rating })
      .eq('id', wisdomId)
      .select()

    return { data, error }
  }
}

/**
 * 每日靈感管理
 */
export const dailyInspiration = {

  /**
   * 創建每日靈感
   * @param {string} cardId - 卡牌ID
   * @param {Object} inspirationData - 靈感資料
   * @param {string} userId - 用戶ID (可選)
   * @returns {Promise<{data, error}>}
   */
  async createDailyInspiration(cardId, inspirationData, userId = null) {
    const data = {
      card_id: cardId,
      user_id: userId,
      ...inspirationData
    }

    const { data: result, error } = await supabase
      .from('daily_card_inspiration')
      .insert(data)
      .select()

    return { data: result, error }
  },

  /**
   * 獲取今日靈感
   * @param {string} userId - 用戶ID (可選)
   * @returns {Promise<{data, error}>}
   */
  async getTodayInspiration(userId = null) {
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('daily_card_inspiration')
      .select(`
        *,
        tarot_cards(name_en, name_zh, image_url, affirmation_upright)
      `)
      .eq('inspiration_date', today)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    query = query.single()

    const { data, error } = await query

    return { data, error }
  },

  /**
   * 獲取用戶的靈感歷史
   * @param {string} userId - 用戶ID
   * @param {number} days - 天數
   * @returns {Promise<{data, error}>}
   */
  async getInspirationHistory(userId, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('daily_card_inspiration')
      .select(`
        *,
        tarot_cards(name_en, name_zh, image_url)
      `)
      .eq('user_id', userId)
      .gte('inspiration_date', startDate.toISOString().split('T')[0])
      .order('inspiration_date', { ascending: false })

    return { data, error }
  },

  /**
   * 更新每日靈感
   * @param {string} inspirationId - 靈感ID
   * @param {Object} updates - 更新資料
   * @returns {Promise<{data, error}>}
   */
  async updateDailyInspiration(inspirationId, updates) {
    const { data, error } = await supabase
      .from('daily_card_inspiration')
      .update(updates)
      .eq('id', inspirationId)
      .select()

    return { data, error }
  }
}

/**
 * 卡片組合解釋
 */
export const cardCombinations = {

  /**
   * 添加卡片組合解釋
   * @param {Array} cardIds - 卡牌ID陣列
   * @param {Object} combinationData - 組合解釋資料
   * @returns {Promise<{data, error}>}
   */
  async addCombination(cardIds, combinationData) {
    const data = {
      card1_id: cardIds[0],
      card2_id: cardIds[1],
      card3_id: cardIds[2] || null,
      ...combinationData
    }

    const { data: result, error } = await supabase
      .from('card_combination_meanings')
      .insert(data)
      .select()

    return { data: result, error }
  },

  /**
   * 查找卡片組合解釋
   * @param {Array} cardIds - 卡牌ID陣列
   * @returns {Promise<{data, error}>}
   */
  async findCombination(cardIds) {
    let query = supabase
      .from('card_combination_meanings')
      .select(`
        *,
        card1:tarot_cards!card1_id(name_en, name_zh),
        card2:tarot_cards!card2_id(name_en, name_zh),
        card3:tarot_cards!card3_id(name_en, name_zh)
      `)

    if (cardIds.length === 2) {
      query = query.or(`and(card1_id.eq.${cardIds[0]},card2_id.eq.${cardIds[1]}),and(card1_id.eq.${cardIds[1]},card2_id.eq.${cardIds[0]})`)
    } else if (cardIds.length === 3) {
      // 三張牌的組合查詢更複雜，簡化處理
      query = query.in('card1_id', cardIds).in('card2_id', cardIds)
    }

    const { data, error } = await query

    return { data, error }
  },

  /**
   * 獲取熱門組合
   * @param {number} limit - 限制數量
   * @returns {Promise<{data, error}>}
   */
  async getPopularCombinations(limit = 10) {
    const { data, error } = await supabase
      .from('card_combination_meanings')
      .select(`
        *,
        card1:tarot_cards!card1_id(name_en, name_zh),
        card2:tarot_cards!card2_id(name_en, name_zh)
      `)
      .order('confidence_level', { ascending: false })
      .limit(limit)

    return { data, error }
  }
}

/**
 * 增強版卡牌管理
 */
export const enhancedCards = {

  /**
   * 更新卡牌的個人化欄位
   * @param {string} cardId - 卡牌ID
   * @param {Object} personalData - 個人化資料
   * @returns {Promise<{data, error}>}
   */
  async updatePersonalFields(cardId, personalData) {
    const { data, error } = await supabase
      .from('tarot_cards')
      .update(personalData)
      .eq('id', cardId)
      .select()

    return { data, error }
  },

  /**
   * 獲取增強版卡牌資料
   * @param {string} cardId - 卡牌ID
   * @returns {Promise<{data, error}>}
   */
  async getEnhancedCard(cardId) {
    const { data, error } = await supabase
      .from('tarot_cards_enhanced')
      .select('*')
      .eq('id', cardId)
      .single()

    return { data, error }
  },

  /**
   * 使用 RPC 函數獲取每日智慧
   * @param {string} cardName - 卡牌名稱 (可選)
   * @returns {Promise<{data, error}>}
   */
  async getDailyWisdom(cardName = null) {
    const { data, error } = await supabase
      .rpc('get_daily_wisdom', { card_name: cardName })

    return { data, error }
  },

  /**
   * 根據能量頻率搜尋卡牌
   * @param {string} frequency - 'high' | 'medium' | 'low'
   * @returns {Promise<{data, error}>}
   */
  async getCardsByEnergyFrequency(frequency) {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .eq('energy_frequency', frequency)

    return { data, error }
  },

  /**
   * 根據脈輪連結搜尋卡牌
   * @param {string} chakra - 脈輪名稱
   * @returns {Promise<{data, error}>}
   */
  async getCardsByChakra(chakra) {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .ilike('chakra_connection', `%${chakra}%`)

    return { data, error }
  }
}

export default {
  personalInterpretations,
  wisdomCollection,
  dailyInspiration,
  cardCombinations,
  enhancedCards
}