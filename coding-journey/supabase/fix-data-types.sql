-- 修正資料類型不匹配問題
-- 此腳本解決 UUID vs BIGINT 的外鍵約束問題

-- 首先檢查 Tarot_card_meaning 表的 id 欄位類型
DO $$
DECLARE
    id_data_type TEXT;
    table_name_var TEXT;
BEGIN
    -- 找到實際的表格名稱
    SELECT table_name INTO table_name_var
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND LOWER(table_name) = 'tarot_card_meaning'
    LIMIT 1;

    IF table_name_var IS NULL THEN
        RAISE EXCEPTION 'Table with name similar to "Tarot_card_meaning" not found!';
    END IF;

    -- 檢查 id 欄位的資料類型
    SELECT data_type INTO id_data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = table_name_var
    AND column_name = 'id';

    RAISE NOTICE 'Table: %, ID column data type: %', table_name_var, id_data_type;

    -- 根據資料類型給出建議
    IF id_data_type = 'bigint' THEN
        RAISE NOTICE 'SUCCESS: ID is BIGINT type. The updated schema will work correctly.';
    ELSIF id_data_type = 'uuid' THEN
        RAISE NOTICE 'INFO: ID is UUID type. You may need to use the original UUID schema instead.';
    ELSE
        RAISE NOTICE 'WARNING: ID is % type. Please verify compatibility with foreign key constraints.', id_data_type;
    END IF;
END $$;

-- 顯示建議的 daily_cards 表結構
SELECT
    'Recommended daily_cards.card_id data type based on Tarot_card_meaning.id:' as recommendation,
    CASE
        WHEN data_type = 'bigint' THEN 'BIGINT'
        WHEN data_type = 'uuid' THEN 'UUID'
        ELSE data_type
    END as suggested_type
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.table_name
WHERE t.table_schema = 'public'
AND LOWER(t.table_name) = 'tarot_card_meaning'
AND c.column_name = 'id';

-- 檢查是否存在衝突的表格
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_cards') THEN
        RAISE NOTICE 'WARNING: daily_cards table already exists. You may need to drop it first if changing data types.';

        -- 顯示現有的 card_id 資料類型
        DECLARE
            current_card_id_type TEXT;
        BEGIN
            SELECT data_type INTO current_card_id_type
            FROM information_schema.columns
            WHERE table_name = 'daily_cards'
            AND column_name = 'card_id';

            RAISE NOTICE 'Current daily_cards.card_id type: %', current_card_id_type;
        END;
    ELSE
        RAISE NOTICE 'daily_cards table does not exist yet. Ready to create with correct data types.';
    END IF;
END $$;