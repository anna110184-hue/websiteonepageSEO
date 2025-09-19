-- 擴展塔羅牌資料庫 - 個人化和智慧型解釋
-- 添加個人解釋、智慧話語和深度洞察欄位

-- 1. 為 tarot_cards 表增加個人化解釋欄位
ALTER TABLE tarot_cards ADD COLUMN IF NOT EXISTS
    personal_upright_meaning TEXT,           -- 個人正位解釋
    personal_reversed_meaning TEXT,          -- 個人逆位解釋
    spiritual_message TEXT,                  -- 靈性訊息
    practical_guidance TEXT,                 -- 實用指導
    emotional_insight TEXT,                  -- 情感洞察
    career_guidance TEXT,                    -- 事業指導
    relationship_insight TEXT;               -- 關係洞察

-- 2. 增加智慧話語相關欄位
ALTER TABLE tarot_cards ADD COLUMN IF NOT EXISTS
    wisdom_words_upright TEXT[],             -- 正位智慧話語陣列
    wisdom_words_reversed TEXT[],            -- 逆位智慧話語陣列
    affirmation_upright TEXT,                -- 正位肯定語句
    affirmation_reversed TEXT,               -- 逆位肯定語句
    reflection_question TEXT;                -- 反思問題

-- 3. 增加更多深度解釋欄位
ALTER TABLE tarot_cards ADD COLUMN IF NOT EXISTS
    shadow_aspect TEXT,                      -- 陰影面向
    light_aspect TEXT,                       -- 光明面向
    life_lesson TEXT,                        -- 人生課題
    chakra_connection VARCHAR(50),           -- 脈輪連結
    numerology_meaning TEXT,                 -- 數字學意義
    mythology_reference TEXT,                -- 神話典故
    personal_growth_message TEXT;            -- 個人成長訊息

-- 4. 增加日常應用欄位
ALTER TABLE tarot_cards ADD COLUMN IF NOT EXISTS
    daily_meditation TEXT,                   -- 每日冥想主題
    journal_prompt TEXT,                     -- 日記引導問題
    action_steps TEXT[],                     -- 行動步驟陣列
    mindfulness_practice TEXT,               -- 正念練習
    creative_expression TEXT;                -- 創意表達建議

-- 5. 增加能量和振動欄位
ALTER TABLE tarot_cards ADD COLUMN IF NOT EXISTS
    energy_frequency VARCHAR(20) CHECK (energy_frequency IN ('high', 'medium', 'low') OR energy_frequency IS NULL),
    vibration_color VARCHAR(30),             -- 振動顏色
    healing_properties TEXT[],               -- 療癒屬性陣列
    manifestation_power INTEGER CHECK (manifestation_power BETWEEN 1 AND 10),
    intuitive_symbols TEXT[];                -- 直覺符號陣列

-- 6. 創建個人化牌義歷史表
CREATE TABLE IF NOT EXISTS personal_card_interpretations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES tarot_cards(id) ON DELETE CASCADE,
    user_id UUID,                            -- 用戶ID (如果有用戶系統)

    -- 個人解釋
    personal_meaning TEXT NOT NULL,
    personal_experience TEXT,                -- 個人經驗
    emotional_response TEXT,                 -- 情感反應
    synchronicity_notes TEXT,                -- 共時性筆記

    -- 學習歷程
    learning_insights TEXT[],                -- 學習洞察
    practice_notes TEXT,                     -- 練習筆記
    interpretation_evolution TEXT,           -- 解釋演變

    -- 時間和情境
    interpretation_date DATE DEFAULT CURRENT_DATE,
    life_context TEXT,                       -- 生活情境
    mood_state VARCHAR(30),                  -- 心情狀態

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 創建智慧話語集合表
CREATE TABLE IF NOT EXISTS tarot_wisdom_collection (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES tarot_cards(id) ON DELETE CASCADE,

    -- 智慧話語內容
    wisdom_text TEXT NOT NULL,
    wisdom_type VARCHAR(30) CHECK (wisdom_type IN ('quote', 'affirmation', 'mantra', 'prayer', 'meditation')),
    interpretation_type VARCHAR(30) CHECK (interpretation_type IN ('upright', 'reversed', 'general')),

    -- 來源和分類
    source_tradition VARCHAR(50),            -- 來源傳統 (西方、東方、現代等)
    wisdom_category VARCHAR(30),             -- 智慧類別
    language VARCHAR(10) DEFAULT 'zh',       -- 語言

    -- 使用和評價
    usage_count INTEGER DEFAULT 0,
    user_rating DECIMAL(3,2),               -- 用戶評分
    is_featured BOOLEAN DEFAULT FALSE,       -- 是否精選

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 創建每日卡片靈感表
CREATE TABLE IF NOT EXISTS daily_card_inspiration (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES tarot_cards(id) ON DELETE CASCADE,

    -- 每日內容
    inspiration_date DATE DEFAULT CURRENT_DATE,
    morning_reflection TEXT,                 -- 晨間反思
    evening_gratitude TEXT,                  -- 晚間感恩
    daily_intention TEXT,                    -- 每日意圖
    mindful_moment TEXT,                     -- 正念時刻

    -- 月相和季節連結
    moon_phase VARCHAR(20),                  -- 月相
    season VARCHAR(20),                      -- 季節
    seasonal_meaning TEXT,                   -- 季節性意義

    -- 個人化標記
    user_id UUID,
    is_personal BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 創建卡片組合解釋表
CREATE TABLE IF NOT EXISTS card_combination_meanings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 卡片組合
    card1_id UUID NOT NULL REFERENCES tarot_cards(id),
    card2_id UUID NOT NULL REFERENCES tarot_cards(id),
    card3_id UUID REFERENCES tarot_cards(id),           -- 第三張卡可選

    -- 組合解釋
    combination_meaning TEXT NOT NULL,
    synergy_description TEXT,                -- 協同效應描述
    combined_energy TEXT,                    -- 結合能量
    relationship_dynamic TEXT,               -- 關係動態

    -- 組合類型
    combination_type VARCHAR(30) CHECK (combination_type IN ('pair', 'trinity', 'opposition', 'complement')),
    spread_context VARCHAR(50),              -- 牌陣情境

    -- 元數據
    interpretation_source VARCHAR(50),       -- 解釋來源
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 增加索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_personal_interpretations_card_user ON personal_card_interpretations(card_id, user_id);
CREATE INDEX IF NOT EXISTS idx_wisdom_collection_card_type ON tarot_wisdom_collection(card_id, interpretation_type);
CREATE INDEX IF NOT EXISTS idx_daily_inspiration_date ON daily_card_inspiration(inspiration_date DESC);
CREATE INDEX IF NOT EXISTS idx_card_combinations ON card_combination_meanings(card1_id, card2_id);

-- 11. 創建觸發器維護更新時間
CREATE TRIGGER update_personal_interpretations_updated_at
    BEFORE UPDATE ON personal_card_interpretations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. 啟用新表的 RLS
ALTER TABLE personal_card_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_wisdom_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_card_inspiration ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_combination_meanings ENABLE ROW LEVEL SECURITY;

-- 13. 創建公開讀取政策
CREATE POLICY "Public can read wisdom collection" ON tarot_wisdom_collection
    FOR SELECT TO public USING (true);

CREATE POLICY "Public can read card combinations" ON card_combination_meanings
    FOR SELECT TO public USING (true);

-- 14. 創建個人化資料政策 (示例)
CREATE POLICY "Users can manage own interpretations" ON personal_card_interpretations
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily inspiration" ON daily_card_inspiration
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 15. 創建增強版視圖
CREATE OR REPLACE VIEW tarot_cards_enhanced AS
SELECT
    tc.*,
    json_agg(DISTINCT cm.*) FILTER (WHERE cm.id IS NOT NULL) AS meanings,
    json_agg(DISTINCT twc.*) FILTER (WHERE twc.id IS NOT NULL) AS wisdom_collection,
    array_agg(DISTINCT twc.wisdom_text) FILTER (WHERE twc.wisdom_text IS NOT NULL) AS all_wisdom_words
FROM tarot_cards tc
LEFT JOIN card_meanings cm ON tc.id = cm.card_id
LEFT JOIN tarot_wisdom_collection twc ON tc.id = twc.card_id
GROUP BY tc.id
ORDER BY
    CASE WHEN tc.arcana_type = 'major' THEN 0 ELSE 1 END,
    tc.number;

-- 16. 創建智慧話語快速查詢函數
CREATE OR REPLACE FUNCTION get_daily_wisdom(card_name TEXT DEFAULT NULL)
RETURNS TABLE (
    card_name_zh TEXT,
    wisdom_text TEXT,
    affirmation TEXT,
    reflection_question TEXT
) AS $$
BEGIN
    IF card_name IS NOT NULL THEN
        RETURN QUERY
        SELECT
            tc.name_zh,
            twc.wisdom_text,
            tc.affirmation_upright,
            tc.reflection_question
        FROM tarot_cards tc
        LEFT JOIN tarot_wisdom_collection twc ON tc.id = twc.card_id
        WHERE tc.name_zh ILIKE '%' || card_name || '%'
           OR tc.name_en ILIKE '%' || card_name || '%'
        ORDER BY RANDOM()
        LIMIT 1;
    ELSE
        RETURN QUERY
        SELECT
            tc.name_zh,
            twc.wisdom_text,
            tc.affirmation_upright,
            tc.reflection_question
        FROM tarot_cards tc
        LEFT JOIN tarot_wisdom_collection twc ON tc.id = twc.card_id
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;