import { supabase } from './client.js'

/**
 * 塔羅牌資料庫操作工具
 * 提供完整的塔羅牌資料管理功能
 */

/**
 * 塔羅牌查詢和管理工具
 */
export const tarotDatabase = {

  /**
   * 獲取所有塔羅牌
   * @param {Object} options - 查詢選項
   * @returns {Promise<{data, error}>}
   */
  async getAllCards(options = {}) {
    let query = supabase
      .from('tarot_cards')
      .select(`
        *,
        card_meanings(*)
      `)

    // 應用篩選
    if (options.arcana_type) {
      query = query.eq('arcana_type', options.arcana_type)
    }

    if (options.suit) {
      query = query.eq('suit', options.suit)
    }

    if (options.include_meanings === false) {
      query = supabase.from('tarot_cards').select('*')
    }

    // 排序
    query = query.order('arcana_type', { ascending: true })
      .order('number', { ascending: true })

    const { data, error } = await query

    return { data, error }
  },

  /**
   * 根據名稱獲取特定卡牌
   * @param {string} name - 卡牌名稱 (英文或中文)
   * @returns {Promise<{data, error}>}
   */
  async getCardByName(name) {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select(`
        *,
        card_meanings(*)
      `)
      .or(`name_en.ilike.%${name}%,name_zh.ilike.%${name}%`)
      .single()

    return { data, error }
  },

  /**
   * 根據ID獲取特定卡牌
   * @param {string} cardId - 卡牌ID
   * @returns {Promise<{data, error}>}
   */
  async getCardById(cardId) {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select(`
        *,
        card_meanings(*)
      `)
      .eq('id', cardId)
      .single()

    return { data, error }
  },

  /**
   * 獲取隨機卡牌
   * @param {number} count - 要抽取的卡牌數量
   * @param {Object} options - 選項
   * @returns {Promise<{data, error}>}
   */
  async getRandomCards(count = 1, options = {}) {
    try {
      // 先獲取所有符合條件的卡牌ID
      let query = supabase
        .from('tarot_cards')
        .select('id')

      if (options.arcana_type) {
        query = query.eq('arcana_type', options.arcana_type)
      }

      if (options.suit) {
        query = query.eq('suit', options.suit)
      }

      const { data: cardIds, error: idsError } = await query

      if (idsError) {
        return { data: null, error: idsError }
      }

      // 隨機選擇卡牌ID
      const shuffled = cardIds.sort(() => 0.5 - Math.random())
      const selectedIds = shuffled.slice(0, count).map(card => card.id)

      // 獲取完整的卡牌資料
      const { data, error } = await supabase
        .from('tarot_cards')
        .select(`
          *,
          card_meanings(*)
        `)
        .in('id', selectedIds)

      return { data, error }

    } catch (error) {
      return { data: null, error }
    }
  },

  /**
   * 搜尋卡牌
   * @param {string} searchTerm - 搜尋詞
   * @param {Object} options - 搜尋選項
   * @returns {Promise<{data, error}>}
   */
  async searchCards(searchTerm, options = {}) {
    let query = supabase
      .from('tarot_cards')
      .select(`
        *,
        card_meanings(*)
      `)

    // 搜尋條件
    const searchConditions = [
      `name_en.ilike.%${searchTerm}%`,
      `name_zh.ilike.%${searchTerm}%`,
      `keywords.cs.{${searchTerm}}`
    ]

    query = query.or(searchConditions.join(','))

    // 應用額外篩選
    if (options.arcana_type) {
      query = query.eq('arcana_type', options.arcana_type)
    }

    if (options.suit) {
      query = query.eq('suit', options.suit)
    }

    const { data, error } = await query

    return { data, error }
  },

  /**
   * 獲取大阿爾克那牌
   * @returns {Promise<{data, error}>}
   */
  async getMajorArcana() {
    return this.getAllCards({ arcana_type: 'major' })
  },

  /**
   * 獲取小阿爾克那牌
   * @param {string} suit - 花色 (可選)
   * @returns {Promise<{data, error}>}
   */
  async getMinorArcana(suit = null) {
    const options = { arcana_type: 'minor' }
    if (suit) options.suit = suit

    return this.getAllCards(options)
  },

  /**
   * 獲取特定花色的牌
   * @param {string} suit - 花色
   * @returns {Promise<{data, error}>}
   */
  async getCardsBySuit(suit) {
    return this.getAllCards({ suit })
  },

  /**
   * 獲取宮廷牌
   * @param {string} suit - 花色 (可選)
   * @returns {Promise<{data, error}>}
   */
  async getCourtCards(suit = null) {
    let query = supabase
      .from('tarot_cards')
      .select(`
        *,
        card_meanings(*)
      `)
      .not('court_card', 'is', null)

    if (suit) {
      query = query.eq('suit', suit)
    }

    const { data, error } = await query

    return { data, error }
  }
}

/**
 * 牌義管理工具
 */
export const cardMeanings = {

  /**
   * 獲取卡牌的特定牌義
   * @param {string} cardId - 卡牌ID
   * @param {string} interpretationType - 'upright' | 'reversed'
   * @param {string} category - 牌義類別
   * @returns {Promise<{data, error}>}
   */
  async getCardMeaning(cardId, interpretationType = 'upright', category = 'general') {
    const { data, error } = await supabase
      .from('card_meanings')
      .select('*')
      .eq('card_id', cardId)
      .eq('interpretation_type', interpretationType)
      .eq('category', category)
      .single()

    return { data, error }
  },

  /**
   * 獲取卡牌的所有牌義
   * @param {string} cardId - 卡牌ID
   * @returns {Promise<{data, error}>}
   */
  async getAllMeaningsForCard(cardId) {
    const { data, error } = await supabase
      .from('card_meanings')
      .select('*')
      .eq('card_id', cardId)
      .order('interpretation_type')
      .order('category')

    return { data, error }
  },

  /**
   * 添加新的牌義
   * @param {Object} meaningData - 牌義資料
   * @returns {Promise<{data, error}>}
   */
  async addCardMeaning(meaningData) {
    const { data, error } = await supabase
      .from('card_meanings')
      .insert(meaningData)
      .select()

    return { data, error }
  },

  /**
   * 更新牌義
   * @param {string} meaningId - 牌義ID
   * @param {Object} updates - 更新資料
   * @returns {Promise<{data, error}>}
   */
  async updateCardMeaning(meaningId, updates) {
    const { data, error } = await supabase
      .from('card_meanings')
      .update(updates)
      .eq('id', meaningId)
      .select()

    return { data, error }
  }
}

/**
 * 牌陣管理工具
 */
export const tarotSpreads = {

  /**
   * 獲取所有牌陣
   * @returns {Promise<{data, error}>}
   */
  async getAllSpreads() {
    const { data, error } = await supabase
      .from('tarot_spreads')
      .select('*')
      .order('difficulty_level')
      .order('positions')

    return { data, error }
  },

  /**
   * 根據難度獲取牌陣
   * @param {number} difficulty - 難度等級 (1-5)
   * @returns {Promise<{data, error}>}
   */
  async getSpreadsByDifficulty(difficulty) {
    const { data, error } = await supabase
      .from('tarot_spreads')
      .select('*')
      .eq('difficulty_level', difficulty)
      .order('positions')

    return { data, error }
  },

  /**
   * 根據牌位數量獲取牌陣
   * @param {number} positions - 牌位數量
   * @returns {Promise<{data, error}>}
   */
  async getSpreadsByPositions(positions) {
    const { data, error } = await supabase
      .from('tarot_spreads')
      .select('*')
      .eq('positions', positions)

    return { data, error }
  }
}

/**
 * 占卜記錄工具
 */
export const tarotReadings = {

  /**
   * 創建新的占卜記錄
   * @param {Object} readingData - 占卜資料
   * @returns {Promise<{data, error}>}
   */
  async createReading(readingData) {
    const { data, error } = await supabase
      .from('tarot_readings')
      .insert(readingData)
      .select()

    return { data, error }
  },

  /**
   * 獲取占卜記錄
   * @param {string} readingId - 占卜記錄ID
   * @returns {Promise<{data, error}>}
   */
  async getReading(readingId) {
    const { data, error } = await supabase
      .from('tarot_readings')
      .select(`
        *,
        tarot_spreads(*)
      `)
      .eq('id', readingId)
      .single()

    return { data, error }
  },

  /**
   * 獲取用戶的占卜記錄
   * @param {string} userId - 用戶ID
   * @param {number} limit - 限制數量
   * @returns {Promise<{data, error}>}
   */
  async getUserReadings(userId, limit = 10) {
    const { data, error } = await supabase
      .from('tarot_readings')
      .select(`
        *,
        tarot_spreads(name_en, name_zh)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  }
}

/**
 * 統計和分析工具
 */
export const tarotStats = {

  /**
   * 獲取資料庫統計
   * @returns {Promise<{data, error}>}
   */
  async getDatabaseStats() {
    try {
      // 獲取各種統計數據
      const [
        totalCards,
        majorCards,
        minorCards,
        totalMeanings,
        totalSpreads,
        totalReadings
      ] = await Promise.all([
        supabase.from('tarot_cards').select('id', { count: 'exact', head: true }),
        supabase.from('tarot_cards').select('id', { count: 'exact', head: true }).eq('arcana_type', 'major'),
        supabase.from('tarot_cards').select('id', { count: 'exact', head: true }).eq('arcana_type', 'minor'),
        supabase.from('card_meanings').select('id', { count: 'exact', head: true }),
        supabase.from('tarot_spreads').select('id', { count: 'exact', head: true }),
        supabase.from('tarot_readings').select('id', { count: 'exact', head: true })
      ])

      const stats = {
        cards: {
          total: totalCards.count || 0,
          major_arcana: majorCards.count || 0,
          minor_arcana: minorCards.count || 0
        },
        meanings: totalMeanings.count || 0,
        spreads: totalSpreads.count || 0,
        readings: totalReadings.count || 0
      }

      return { data: stats, error: null }

    } catch (error) {
      return { data: null, error }
    }
  }
}

export default {
  tarotDatabase,
  cardMeanings,
  tarotSpreads,
  tarotReadings,
  tarotStats
}