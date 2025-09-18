-- 塔羅牌資料庫結構設計
-- 創建完整的塔羅牌牌義和詮釋系統

-- 1. 塔羅牌基本資訊表
CREATE TABLE IF NOT EXISTS tarot_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 基本資訊
    name_en VARCHAR(100) NOT NULL,           -- 英文名稱 (e.g., "The Fool")
    name_zh VARCHAR(100) NOT NULL,           -- 中文名稱 (e.g., "愚者")
    number INTEGER,                          -- 牌號 (0-21 for major, 1-14 for minor)

    -- 分類
    arcana_type VARCHAR(20) NOT NULL CHECK (arcana_type IN ('major', 'minor')),
    suit VARCHAR(20) CHECK (suit IN ('cups', 'swords', 'wands', 'pentacles') OR suit IS NULL),
    court_card VARCHAR(20) CHECK (court_card IN ('page', 'knight', 'queen', 'king') OR court_card IS NULL),

    -- 圖片資訊
    image_filename VARCHAR(255) NOT NULL,    -- 對應的圖片檔名
    image_path VARCHAR(500) NOT NULL,        -- 完整的 storage 路徑
    image_url TEXT,                          -- 公開 URL (可快取)

    -- 符號學和元素
    element VARCHAR(20) CHECK (element IN ('fire', 'water', 'air', 'earth') OR element IS NULL),
    planet VARCHAR(30),                      -- 對應星球
    zodiac_sign VARCHAR(30),                 -- 對應星座
    keywords TEXT[],                         -- 關鍵字陣列

    -- 時間戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 牌義詮釋表 (支援多種詮釋風格)
CREATE TABLE IF NOT EXISTS card_meanings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES tarot_cards(id) ON DELETE CASCADE,

    -- 詮釋類型
    interpretation_type VARCHAR(30) NOT NULL CHECK (
        interpretation_type IN ('upright', 'reversed')
    ),

    -- 詮釋領域
    category VARCHAR(30) NOT NULL CHECK (
        category IN ('general', 'love', 'career', 'health', 'spiritual', 'finance')
    ),

    -- 詮釋內容
    short_meaning TEXT NOT NULL,             -- 簡短牌義 (1-2句)
    detailed_meaning TEXT NOT NULL,          -- 詳細解釋
    advice TEXT,                            -- 建議
    warning TEXT,                           -- 警示 (如果有)

    -- 情境應用
    situation_keywords TEXT[],               -- 情境關鍵字
    emotional_tone VARCHAR(20) CHECK (      -- 情感色調
        emotional_tone IN ('positive', 'negative', 'neutral', 'mixed')
    ),

    -- 時間戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 牌陣模式表
CREATE TABLE IF NOT EXISTS tarot_spreads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name_en VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    positions INTEGER NOT NULL,              -- 牌位數量
    layout_data JSONB NOT NULL,             -- 牌陣佈局資料
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 占卜記錄表
CREATE TABLE IF NOT EXISTS tarot_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 基本資訊
    user_id UUID,                           -- 如果有用戶系統
    spread_id UUID REFERENCES tarot_spreads(id),
    question TEXT,                          -- 占卜問題

    -- 抽牌記錄
    cards_drawn JSONB NOT NULL,             -- 抽到的牌和位置
    interpretation_summary TEXT,            -- 整體解讀

    -- 設定
    reading_type VARCHAR(30) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 創建索引提升查詢效能
CREATE INDEX IF NOT EXISTS idx_tarot_cards_arcana_suit ON tarot_cards(arcana_type, suit);
CREATE INDEX IF NOT EXISTS idx_tarot_cards_name ON tarot_cards(name_en, name_zh);
CREATE INDEX IF NOT EXISTS idx_card_meanings_card_type ON card_meanings(card_id, interpretation_type, category);
CREATE INDEX IF NOT EXISTS idx_tarot_readings_created ON tarot_readings(created_at DESC);

-- 6. 創建更新時間戳觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tarot_cards_updated_at BEFORE UPDATE ON tarot_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_meanings_updated_at BEFORE UPDATE ON card_meanings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 啟用 Row Level Security (RLS)
ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_meanings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_spreads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;

-- 8. 創建基本政策 (公開讀取)
CREATE POLICY "Public can read tarot cards" ON tarot_cards
    FOR SELECT TO public USING (true);

CREATE POLICY "Public can read card meanings" ON card_meanings
    FOR SELECT TO public USING (true);

CREATE POLICY "Public can read tarot spreads" ON tarot_spreads
    FOR SELECT TO public USING (true);

-- 9. 創建視圖方便查詢
CREATE OR REPLACE VIEW tarot_cards_with_meanings AS
SELECT
    tc.id,
    tc.name_en,
    tc.name_zh,
    tc.number,
    tc.arcana_type,
    tc.suit,
    tc.court_card,
    tc.image_filename,
    tc.image_url,
    tc.element,
    tc.keywords,
    json_agg(
        json_build_object(
            'type', cm.interpretation_type,
            'category', cm.category,
            'short_meaning', cm.short_meaning,
            'detailed_meaning', cm.detailed_meaning,
            'advice', cm.advice,
            'emotional_tone', cm.emotional_tone
        )
    ) AS meanings
FROM tarot_cards tc
LEFT JOIN card_meanings cm ON tc.id = cm.card_id
GROUP BY tc.id, tc.name_en, tc.name_zh, tc.number, tc.arcana_type,
         tc.suit, tc.court_card, tc.image_filename, tc.image_url,
         tc.element, tc.keywords
ORDER BY
    CASE WHEN tc.arcana_type = 'major' THEN 0 ELSE 1 END,
    tc.number;