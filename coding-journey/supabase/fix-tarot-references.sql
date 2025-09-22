-- 修正塔羅牌表格引用
-- 此文件用於更新所有對塔羅牌表格的引用，使其與現有的 Tarot_card_meaning 表格兼容

-- 更新 get_random_tarot_cards 函數以使用 Tarot_card_meaning 表
DROP FUNCTION IF EXISTS get_random_tarot_cards(INTEGER, BOOLEAN, UUID[]);

CREATE OR REPLACE FUNCTION get_random_tarot_cards(
    card_count INTEGER DEFAULT 1,
    allow_reversed BOOLEAN DEFAULT true,
    exclude_cards UUID[] DEFAULT '{}'
)
RETURNS TABLE (
    id UUID,
    name_en TEXT,
    name_zh TEXT,
    number INTEGER,
    arcana_type TEXT,
    suit TEXT,
    image_url TEXT,
    is_reversed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tc.id,
        tc.name_en,
        tc.name_zh,
        tc.number,
        tc.arcana_type,
        tc.suit,
        tc.image_url,
        (allow_reversed AND random() < 0.3)::BOOLEAN as is_reversed
    FROM Tarot_card_meaning tc
    WHERE tc.id != ALL(exclude_cards)
    ORDER BY random()
    LIMIT card_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 檢查 Tarot_card_meaning 表是否存在，如果不存在則顯示警告
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Tarot_card_meaning') THEN
        RAISE NOTICE 'Warning: Table "Tarot_card_meaning" does not exist. Please ensure it is created before running the main setup script.';
    ELSE
        RAISE NOTICE 'Success: Table "Tarot_card_meaning" found. Ready to proceed with setup.';
    END IF;
END $$;

-- 顯示 Tarot_card_meaning 表格的欄位資訊（用於驗證）
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'Tarot_card_meaning'
ORDER BY ordinal_position;