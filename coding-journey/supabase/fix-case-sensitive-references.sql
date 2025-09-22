-- 修正大小寫敏感的表格名稱引用
-- 此腳本專門處理 "Tarot_card_meaning" 表格的大小寫問題

-- 首先檢查表格是否存在（不區分大小寫的檢查）
DO $$
DECLARE
    table_exists BOOLEAN := FALSE;
    actual_table_name TEXT;
BEGIN
    -- 檢查所有可能的表格名稱變體
    SELECT table_name INTO actual_table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND LOWER(table_name) = 'tarot_card_meaning'
    LIMIT 1;

    IF actual_table_name IS NOT NULL THEN
        table_exists := TRUE;
        RAISE NOTICE 'Found table: "%"', actual_table_name;
    END IF;

    IF NOT table_exists THEN
        RAISE EXCEPTION 'No table found with name similar to "Tarot_card_meaning". Please check the exact table name in your database.';
    END IF;
END $$;

-- 顯示實際的表格名稱和結構
SELECT
    table_name as "實際表格名稱",
    column_name as "欄位名稱",
    data_type as "資料類型",
    is_nullable as "可為空值"
FROM information_schema.columns
WHERE table_schema = 'public'
AND LOWER(table_name) = 'tarot_card_meaning'
ORDER BY table_name, ordinal_position;

-- 檢查是否有 id 欄位 (必要的主鍵)
DO $$
DECLARE
    has_id_column BOOLEAN := FALSE;
    table_name_var TEXT;
BEGIN
    SELECT table_name INTO table_name_var
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND LOWER(table_name) = 'tarot_card_meaning'
    LIMIT 1;

    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = table_name_var
        AND column_name = 'id'
    ) INTO has_id_column;

    IF NOT has_id_column THEN
        RAISE EXCEPTION 'Table "%" does not have an "id" column which is required for foreign key references.', table_name_var;
    ELSE
        RAISE NOTICE 'Table "%" has required "id" column.', table_name_var;
    END IF;
END $$;

-- 測試 get_random_tarot_cards 函數（如果存在）
DO $$
DECLARE
    func_exists BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_name = 'get_random_tarot_cards'
    ) INTO func_exists;

    IF func_exists THEN
        RAISE NOTICE 'Function get_random_tarot_cards exists. Testing...';
        -- 測試函數調用
        PERFORM get_random_tarot_cards(1, true, '{}');
        RAISE NOTICE 'Function test successful!';
    ELSE
        RAISE NOTICE 'Function get_random_tarot_cards does not exist yet. Will be created by main setup script.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Function test failed: %. This will be fixed by the main setup script.', SQLERRM;
END $$;