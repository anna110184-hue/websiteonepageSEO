import { supabase } from './client.js'

/**
 * 塔羅牌儲存管理工具
 * 提供上傳、獲取和管理塔羅牌圖片的功能
 */

// 塔羅牌類型常數
export const TarotCardTypes = {
  MAJOR_ARCANA: 'major-arcana',
  CUPS: 'minor-arcana/cups',
  SWORDS: 'minor-arcana/swords',
  WANDS: 'minor-arcana/wands',
  PENTACLES: 'minor-arcana/pentacles'
}

// 支援的圖片格式
export const SupportedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

/**
 * 塔羅牌儲存輔助工具
 */
export const tarotStorage = {

  /**
   * 獲取塔羅牌圖片的公開 URL
   * @param {string} cardType - 卡牌類型 (使用 TarotCardTypes 常數)
   * @param {string} filename - 檔案名稱
   * @returns {string} 公開 URL
   */
  getTarotCardUrl(cardType, filename) {
    const path = `${cardType}/${filename}`
    const { data } = supabase.storage
      .from('tarot-cards')
      .getPublicUrl(path)

    return data.publicUrl
  },

  /**
   * 上傳塔羅牌圖片
   * @param {string} cardType - 卡牌類型
   * @param {string} filename - 檔案名稱
   * @param {File|Blob} file - 圖片檔案
   * @param {Object} options - 上傳選項
   * @returns {Promise<{data, error}>}
   */
  async uploadTarotCard(cardType, filename, file, options = {}) {
    // 驗證檔案類型
    if (!SupportedImageTypes.includes(file.type)) {
      return {
        data: null,
        error: {
          message: `不支援的檔案類型: ${file.type}。支援的格式: ${SupportedImageTypes.join(', ')}`
        }
      }
    }

    // 驗證卡牌類型
    if (!Object.values(TarotCardTypes).includes(cardType)) {
      return {
        data: null,
        error: {
          message: `無效的卡牌類型: ${cardType}`
        }
      }
    }

    const path = `${cardType}/${filename}`

    const { data, error } = await supabase.storage
      .from('tarot-cards')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: options.overwrite || false,
        ...options
      })

    if (error) {
      return { data: null, error }
    }

    // 返回上傳結果和公開 URL
    return {
      data: {
        ...data,
        publicUrl: this.getTarotCardUrl(cardType, filename)
      },
      error: null
    }
  },

  /**
   * 列出指定類型的所有塔羅牌圖片
   * @param {string} cardType - 卡牌類型
   * @param {Object} options - 查詢選項
   * @returns {Promise<{data, error}>}
   */
  async listTarotCards(cardType, options = {}) {
    const { data, error } = await supabase.storage
      .from('tarot-cards')
      .list(cardType, {
        limit: options.limit || 100,
        offset: options.offset || 0,
        sortBy: { column: 'name', order: 'asc' },
        ...options
      })

    if (error) {
      return { data: null, error }
    }

    // 為每個檔案添加公開 URL
    const filesWithUrls = data
      ?.filter(file => file.name !== '.gitkeep') // 過濾掉資料夾佔位檔案
      ?.map(file => ({
        ...file,
        publicUrl: this.getTarotCardUrl(cardType, file.name),
        cardType,
        fullPath: `${cardType}/${file.name}`
      }))

    return {
      data: filesWithUrls || [],
      error: null
    }
  },

  /**
   * 列出所有塔羅牌圖片（所有類型）
   * @param {Object} options - 查詢選項
   * @returns {Promise<{data, error}>}
   */
  async listAllTarotCards(options = {}) {
    const results = []
    const errors = []

    for (const cardType of Object.values(TarotCardTypes)) {
      const { data, error } = await this.listTarotCards(cardType, options)

      if (error) {
        errors.push({ cardType, error })
      } else {
        results.push(...data)
      }
    }

    return {
      data: results,
      error: errors.length > 0 ? errors : null
    }
  },

  /**
   * 刪除塔羅牌圖片
   * @param {string} cardType - 卡牌類型
   * @param {string} filename - 檔案名稱
   * @returns {Promise<{data, error}>}
   */
  async deleteTarotCard(cardType, filename) {
    const path = `${cardType}/${filename}`

    const { data, error } = await supabase.storage
      .from('tarot-cards')
      .remove([path])

    return { data, error }
  },

  /**
   * 獲取儲存使用統計
   * @returns {Promise<{data, error}>}
   */
  async getStorageStats() {
    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        cardTypes: {}
      }

      for (const cardType of Object.values(TarotCardTypes)) {
        const { data, error } = await this.listTarotCards(cardType)

        if (!error && data) {
          const typeFiles = data.length
          const typeSize = data.reduce((total, file) => total + (file.metadata?.size || 0), 0)

          stats.cardTypes[cardType] = {
            files: typeFiles,
            size: typeSize
          }

          stats.totalFiles += typeFiles
          stats.totalSize += typeSize
        }
      }

      return {
        data: stats,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error
      }
    }
  },

  /**
   * 批量上傳塔羅牌圖片
   * @param {Array} uploads - 上傳項目陣列 [{cardType, filename, file}]
   * @param {Object} options - 上傳選項
   * @returns {Promise<{data, error}>}
   */
  async batchUploadTarotCards(uploads, options = {}) {
    const results = []
    const errors = []

    for (const upload of uploads) {
      const { cardType, filename, file } = upload
      const { data, error } = await this.uploadTarotCard(cardType, filename, file, options)

      if (error) {
        errors.push({ cardType, filename, error })
      } else {
        results.push({ cardType, filename, data })
      }
    }

    return {
      data: results,
      error: errors.length > 0 ? errors : null
    }
  }
}

/**
 * 塔羅牌圖片驗證工具
 */
export const tarotValidation = {

  /**
   * 驗證圖片檔案
   * @param {File} file - 圖片檔案
   * @param {Object} options - 驗證選項
   * @returns {Object} 驗證結果
   */
  validateImageFile(file, options = {}) {
    const maxSize = options.maxSize || 5 * 1024 * 1024 // 5MB
    const minSize = options.minSize || 1024 // 1KB

    const errors = []

    // 檢查檔案類型
    if (!SupportedImageTypes.includes(file.type)) {
      errors.push(`不支援的檔案類型: ${file.type}`)
    }

    // 檢查檔案大小
    if (file.size > maxSize) {
      errors.push(`檔案過大: ${(file.size / 1024 / 1024).toFixed(2)}MB (最大 ${(maxSize / 1024 / 1024).toFixed(2)}MB)`)
    }

    if (file.size < minSize) {
      errors.push(`檔案過小: ${file.size} bytes (最小 ${minSize} bytes)`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  /**
   * 驗證檔名
   * @param {string} filename - 檔案名稱
   * @returns {Object} 驗證結果
   */
  validateFilename(filename) {
    const errors = []

    // 檢查檔名長度
    if (filename.length < 1) {
      errors.push('檔名不能為空')
    }

    if (filename.length > 100) {
      errors.push('檔名過長 (最大 100 字元)')
    }

    // 檢查不允許的字元
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(filename)) {
      errors.push('檔名包含不允許的字元')
    }

    // 檢查副檔名
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const hasValidExtension = validExtensions.some(ext =>
      filename.toLowerCase().endsWith(ext)
    )

    if (!hasValidExtension) {
      errors.push('檔名必須有有效的副檔名 (.jpg, .jpeg, .png, .webp)')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default tarotStorage