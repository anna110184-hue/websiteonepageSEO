-- 塔羅牌用戶系統和占卜記錄
-- 完整的用戶管理、每日卡片、占卜歷史系統

-- 1. 用戶資料表 (擴展 Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,

    -- 基本資料
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,

    -- 個人資訊
    birth_date DATE,
    zodiac_sign TEXT,
    favorite_deck TEXT DEFAULT 'rider_waite',

    -- 會員和統計
    member_type TEXT DEFAULT 'free' CHECK (member_type IN ('free', 'premium', 'lifetime')),
    total_readings INTEGER DEFAULT 0,
    total_daily_cards INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,

    -- 偏好設定
    preferred_language TEXT DEFAULT 'zh',
    notification_settings JSONB DEFAULT '{"daily_reminder": true, "weekly_summary": false}',
    privacy_settings JSONB DEFAULT '{"show_profile": true, "share_readings": false}',

    -- 學習進度
    learning_level TEXT DEFAULT 'beginner' CHECK (learning_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    completed_lessons TEXT[] DEFAULT '{}',
    favorite_cards UUID[] DEFAULT '{}',

    -- 時間戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 每日卡片記錄表
CREATE TABLE IF NOT EXISTS daily_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES tarot_cards(id),

    -- 抽牌設定
    is_reversed BOOLEAN DEFAULT false,
    draw_date DATE DEFAULT CURRENT_DATE,

    -- 用戶反思和記錄
    personal_reflection TEXT,
    mood_before TEXT,
    mood_after TEXT,
    key_insights TEXT[],

    -- 評分和追踪
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
    helpfulness_rating INTEGER CHECK (helpfulness_rating BETWEEN 1 AND 5),

    -- 情境資訊
    life_situation TEXT,
    question_asked TEXT,
    synchronicity_notes TEXT,

    -- 學習記錄
    learned_something_new BOOLEAN DEFAULT false,
    new_learning_notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 確保每天只能抽一張
    UNIQUE(user_id, draw_date)
);

-- 3. 占卜記錄表 (擴展版)
CREATE TABLE IF NOT EXISTS readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 占卜基本資訊
    reading_type TEXT NOT NULL CHECK (reading_type IN (
        'daily_card', 'three_card_spread', 'celtic_cross', 'relationship_spread',
        'career_spread', 'yes_no', 'custom_spread'
    )),
    spread_id UUID REFERENCES tarot_spreads(id),

    -- 問題和情境
    question TEXT,
    question_category TEXT CHECK (question_category IN (
        'general', 'love', 'career', 'health', 'spiritual', 'finance', 'family'
    )),
    life_context TEXT,

    -- 抽牌結果
    cards_drawn JSONB NOT NULL, -- [{card_id, position, is_reversed, position_meaning}]
    total_cards INTEGER NOT NULL,

    -- 解釋和洞察
    interpretation TEXT,
    ai_interpretation TEXT, -- AI 輔助解釋
    key_themes TEXT[],
    overall_energy TEXT,

    -- 建議和行動
    advice_given TEXT,
    suggested_actions TEXT[],
    follow_up_date DATE,

    -- 評價和追踪
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
    followed_advice BOOLEAN,
    outcome_notes TEXT,

    -- 分享和隱私
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',

    -- 元數據
    reading_duration_minutes INTEGER,
    deck_used TEXT DEFAULT 'rider_waite',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 用戶學習進度表
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 學習內容
    content_type TEXT NOT NULL CHECK (content_type IN (
        'card_meaning', 'spread_technique', 'reading_skill', 'symbol_interpretation'
    )),
    content_id TEXT NOT NULL, -- 學習內容的標識

    -- 進度追踪
    status TEXT DEFAULT 'not_started' CHECK (status IN (
        'not_started', 'in_progress', 'completed', 'mastered'
    )),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),

    -- 學習記錄
    study_time_minutes INTEGER DEFAULT 0,
    practice_count INTEGER DEFAULT 0,
    quiz_scores INTEGER[] DEFAULT '{}',
    last_practiced_at TIMESTAMP WITH TIME ZONE,

    -- 筆記和心得
    personal_notes TEXT,
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, content_type, content_id)
);

-- 5. 用戶互動表 (收藏、評論等)
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 互動類型和目標
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'favorite_card', 'bookmark_reading', 'like_interpretation', 'share_reading'
    )),
    target_type TEXT NOT NULL CHECK (target_type IN (
        'tarot_card', 'reading', 'interpretation', 'spread'
    )),
    target_id UUID NOT NULL,

    -- 互動數據
    interaction_data JSONB,
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_member_type ON user_profiles(member_type);

CREATE INDEX IF NOT EXISTS idx_daily_cards_user_date ON daily_cards(user_id, draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_cards_card_id ON daily_cards(card_id);

CREATE INDEX IF NOT EXISTS idx_readings_user_type ON readings(user_id, reading_type);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_question_category ON readings(question_category);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_content ON user_learning_progress(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_type ON user_interactions(user_id, interaction_type);

-- 7. 創建更新時間戳觸發器
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_cards_updated_at
    BEFORE UPDATE ON daily_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_readings_updated_at
    BEFORE UPDATE ON readings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
    BEFORE UPDATE ON user_learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 啟用 Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- 9. 創建安全政策
-- 用戶資料政策
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 公開資料可見 (如果用戶設定為公開)
CREATE POLICY "Public profiles are viewable" ON user_profiles
    FOR SELECT USING (
        (privacy_settings->>'show_profile')::boolean = true
    );

-- 每日卡片政策
CREATE POLICY "Users can manage their own daily cards" ON daily_cards
    FOR ALL USING (auth.uid() = user_id);

-- 占卜記錄政策
CREATE POLICY "Users can manage their own readings" ON readings
    FOR ALL USING (auth.uid() = user_id);

-- 公開占卜記錄可見
CREATE POLICY "Public readings are viewable" ON readings
    FOR SELECT USING (is_public = true);

-- 學習進度政策
CREATE POLICY "Users can manage their own learning progress" ON user_learning_progress
    FOR ALL USING (auth.uid() = user_id);

-- 用戶互動政策
CREATE POLICY "Users can manage their own interactions" ON user_interactions
    FOR ALL USING (auth.uid() = user_id);

-- 10. 創建有用的視圖
CREATE OR REPLACE VIEW user_dashboard AS
SELECT
    up.id,
    up.username,
    up.display_name,
    up.avatar_url,
    up.member_type,
    up.total_readings,
    up.total_daily_cards,
    up.streak_days,
    up.learning_level,

    -- 最近活動
    (SELECT draw_date FROM daily_cards dc WHERE dc.user_id = up.id ORDER BY draw_date DESC LIMIT 1) as last_daily_card_date,
    (SELECT created_at FROM readings r WHERE r.user_id = up.id ORDER BY created_at DESC LIMIT 1) as last_reading_date,

    -- 統計
    (SELECT COUNT(*) FROM daily_cards dc WHERE dc.user_id = up.id AND dc.draw_date >= CURRENT_DATE - INTERVAL '30 days') as daily_cards_last_30_days,
    (SELECT COUNT(*) FROM readings r WHERE r.user_id = up.id AND r.created_at >= CURRENT_DATE - INTERVAL '30 days') as readings_last_30_days,

    up.created_at,
    up.last_active_at
FROM user_profiles up;

-- 11. 創建統計函數
CREATE OR REPLACE FUNCTION update_user_stats(user_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        total_readings = (
            SELECT COUNT(*) FROM readings WHERE user_id = user_uuid
        ),
        total_daily_cards = (
            SELECT COUNT(*) FROM daily_cards WHERE user_id = user_uuid
        ),
        last_active_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 12. 創建每日連續記錄計算函數
CREATE OR REPLACE FUNCTION calculate_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    has_card BOOLEAN;
BEGIN
    -- 檢查今天是否已抽牌
    SELECT EXISTS(SELECT 1 FROM daily_cards WHERE user_id = user_uuid AND draw_date = check_date) INTO has_card;

    IF NOT has_card THEN
        check_date := check_date - INTERVAL '1 day';
    END IF;

    -- 向前計算連續天數
    WHILE TRUE LOOP
        SELECT EXISTS(SELECT 1 FROM daily_cards WHERE user_id = user_uuid AND draw_date = check_date) INTO has_card;

        IF has_card THEN
            current_streak := current_streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    -- 更新用戶的連續記錄
    UPDATE user_profiles
    SET
        streak_days = current_streak,
        longest_streak = GREATEST(longest_streak, current_streak)
    WHERE id = user_uuid;

    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- 13. 創建占卜類型統計視圖
CREATE OR REPLACE VIEW reading_statistics AS
SELECT
    user_id,
    reading_type,
    COUNT(*) as total_count,
    AVG(satisfaction_rating) as avg_satisfaction,
    AVG(accuracy_rating) as avg_accuracy,
    COUNT(*) FILTER (WHERE followed_advice = true) as advice_followed_count,
    MAX(created_at) as last_reading_date
FROM readings
GROUP BY user_id, reading_type;

-- 14. 自動創建用戶資料觸發器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO user_profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Tarot User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建觸發器 (當新用戶註冊時自動創建 profile)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();