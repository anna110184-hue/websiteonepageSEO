-- 修正函數以匹配實際的 Tarot_card_meaning 表格結構
-- 基於實際欄位: id, card_name, card_answer, upright_meaning, reversed_meaning, wisdom_word, personal_message, card_chinese_name

-- 刪除舊的函數
DROP FUNCTION IF EXISTS get_random_tarot_cards(INTEGER, BOOLEAN, BIGINT[]);

-- 創建新的函數，使用實際的表格結構
CREATE OR REPLACE FUNCTION get_random_tarot_cards(
    card_count INTEGER DEFAULT 1,
    allow_reversed BOOLEAN DEFAULT true,
    exclude_cards BIGINT[] DEFAULT '{}'
)
RETURNS TABLE (
    id BIGINT,
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
        tc.card_name as name_en,
        tc.card_chinese_name as name_zh,
        0 as number,  -- 暫時設為 0，因為原表格沒有這個欄位
        'unknown' as arcana_type,  -- 暫時設為 unknown
        '' as suit,  -- 暫時設為空字串
        '' as image_url,  -- 暫時設為空字串
        (allow_reversed AND random() < 0.3)::BOOLEAN as is_reversed
    FROM Tarot_card_meaning tc
    WHERE tc.id != ALL(exclude_cards)
    ORDER BY random()
    LIMIT card_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 修正 calculate_user_streak 函數中的 current_streak 歧義問題
DROP FUNCTION IF EXISTS calculate_user_streak(UUID);

CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    has_card BOOLEAN;
BEGIN
    -- 檢查今天是否有卡片
    SELECT EXISTS(
        SELECT 1 FROM daily_cards
        WHERE user_id = user_uuid AND draw_date = check_date
    ) INTO has_card;

    -- 如果今天沒有，從昨天開始檢查
    IF NOT has_card THEN
        check_date := check_date - INTERVAL '1 day';
    END IF;

    -- 計算連續天數
    WHILE TRUE LOOP
        SELECT EXISTS(
            SELECT 1 FROM daily_cards
            WHERE user_id = user_uuid AND draw_date = check_date
        ) INTO has_card;

        IF has_card THEN
            streak_count := streak_count + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    -- 更新用戶記錄（修正變數名稱衝突）
    UPDATE user_profiles
    SET
        current_streak = streak_count,
        longest_streak = GREATEST(longest_streak, streak_count)
    WHERE id = user_uuid;

    RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 測試新函數
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- 測試 get_random_tarot_cards 函數
    SELECT * INTO test_result FROM get_random_tarot_cards(1, true, '{}') LIMIT 1;

    IF test_result.id IS NOT NULL THEN
        RAISE NOTICE 'SUCCESS: get_random_tarot_cards function working. Card ID: %, Name: %',
                     test_result.id, test_result.name_zh;
    ELSE
        RAISE NOTICE 'ERROR: get_random_tarot_cards function returned no results';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR testing function: %', SQLERRM;
END $$;

-- 顯示 Tarot_card_meaning 表格的詳細結構
SELECT
    'Tarot_card_meaning table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'Tarot_card_meaning'
  AND table_schema = 'public'
ORDER BY ordinal_position;