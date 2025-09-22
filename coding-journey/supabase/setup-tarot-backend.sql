-- 塔羅牌App完整後端設置
-- 創建用戶系統、占卜記錄和安全政策
-- 注意：假設已存在 Tarot_card_meaning 表格包含所有塔羅牌資料

-- 1. 用戶資料表 (擴展auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,

    -- 基本資料
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,

    -- 個人資訊
    birth_date DATE,
    zodiac_sign TEXT CHECK (zodiac_sign IN (
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    )),

    -- 會員和統計
    member_type TEXT DEFAULT 'free' CHECK (member_type IN ('free', 'premium', 'lifetime')),
    total_readings INTEGER DEFAULT 0,
    total_daily_cards INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,

    -- 偏好設定
    preferred_language TEXT DEFAULT 'zh' CHECK (preferred_language IN ('zh', 'en')),
    allow_reversed_cards BOOLEAN DEFAULT true,
    favorite_deck TEXT DEFAULT 'rider_waite',

    -- 通知設定
    daily_reminder_enabled BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '09:00:00',

    -- 隱私設定
    profile_public BOOLEAN DEFAULT false,
    allow_friend_requests BOOLEAN DEFAULT true,

    -- 時間戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 每日卡片記錄表
CREATE TABLE IF NOT EXISTS daily_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES "Tarot_card_meaning"(id) NOT NULL,

    -- 抽牌資訊
    is_reversed BOOLEAN DEFAULT false,
    draw_date DATE DEFAULT CURRENT_DATE,
    draw_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 問題和情境
    question_asked TEXT,
    mood_before TEXT,
    life_situation TEXT,

    -- 反思和洞察
    personal_reflection TEXT,
    mood_after TEXT,
    key_insights TEXT[],

    -- 評分
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
    helpfulness_rating INTEGER CHECK (helpfulness_rating BETWEEN 1 AND 5),

    -- 學習記錄
    learned_something_new BOOLEAN DEFAULT false,
    new_learning_notes TEXT,
    synchronicity_notes TEXT,

    -- 社交功能
    is_shared BOOLEAN DEFAULT false,
    share_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 確保每人每天只能抽一張
    UNIQUE(user_id, draw_date)
);

-- 3. 占卜記錄表
CREATE TABLE IF NOT EXISTS readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- 占卜基本資訊
    reading_type TEXT NOT NULL CHECK (reading_type IN (
        'daily_card', 'three_card_spread', 'celtic_cross',
        'relationship_spread', 'career_spread', 'yes_no', 'custom'
    )),

    -- 問題和情境
    question TEXT NOT NULL,
    question_category TEXT DEFAULT 'general' CHECK (question_category IN (
        'general', 'love', 'career', 'health', 'spiritual', 'finance', 'family'
    )),

    -- 抽牌結果 (JSON格式)
    cards_drawn JSONB NOT NULL,
    -- JSON格式: [{"card_id": "uuid", "position": 1, "is_reversed": false, "position_meaning": "past"}]

    total_cards INTEGER NOT NULL DEFAULT 1,

    -- 解釋和洞察
    interpretation TEXT,
    key_themes TEXT[],
    overall_energy TEXT,

    -- 建議和行動
    advice_given TEXT,
    suggested_actions TEXT[],

    -- 評價和追踪
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),

    -- 後續追踪
    followed_advice BOOLEAN,
    follow_up_notes TEXT,
    follow_up_date DATE,

    -- 分享和標記
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    tags TEXT[],

    -- 技術資訊
    deck_used TEXT DEFAULT 'rider_waite',
    reading_duration_seconds INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 朋友關係表
CREATE TABLE IF NOT EXISTS friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- 5. 收藏記錄表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- 收藏目標
    target_type TEXT NOT NULL CHECK (target_type IN ('card', 'reading', 'interpretation')),
    target_id UUID NOT NULL,

    -- 收藏資訊
    personal_note TEXT,
    is_private BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, target_type, target_id)
);

-- 6. 創建索引以提升效能
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_member_type ON user_profiles(member_type);

CREATE INDEX IF NOT EXISTS idx_daily_cards_user_date ON daily_cards(user_id, draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_cards_card_id ON daily_cards(card_id);

CREATE INDEX IF NOT EXISTS idx_readings_user_created ON readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_type_category ON readings(reading_type, question_category);
CREATE INDEX IF NOT EXISTS idx_readings_public ON readings(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

CREATE INDEX IF NOT EXISTS idx_favorites_user_type ON user_favorites(user_id, target_type);

-- 7. 創建更新時間戳函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 創建更新觸發器
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_cards_updated_at
    BEFORE UPDATE ON daily_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_readings_updated_at
    BEFORE UPDATE ON readings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. 啟用Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 10. 創建RLS政策

-- user_profiles 政策
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 公開資料可見政策
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (profile_public = true);

-- daily_cards 政策
CREATE POLICY "Users can manage their own daily cards" ON daily_cards
    FOR ALL USING (auth.uid() = user_id);

-- readings 政策
CREATE POLICY "Users can manage their own readings" ON readings
    FOR ALL USING (auth.uid() = user_id);

-- 公開占卜可見政策
CREATE POLICY "Public readings are viewable by everyone" ON readings
    FOR SELECT USING (is_public = true);

-- friendships 政策
CREATE POLICY "Users can view friendships they are part of" ON friendships
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they are part of" ON friendships
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- user_favorites 政策
CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- 11. 創建有用的函數

-- 更新用戶統計
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 計算連續天數
CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
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
            current_streak := current_streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    -- 更新用戶記錄
    UPDATE user_profiles
    SET
        current_streak = current_streak,
        longest_streak = GREATEST(longest_streak, current_streak)
    WHERE id = user_uuid;

    RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 獲取隨機塔羅牌
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
    FROM "Tarot_card_meaning" tc
    WHERE tc.id != ALL(exclude_cards)
    ORDER BY random()
    LIMIT card_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 創建視圖方便查詢

-- 用戶儀表板視圖
CREATE OR REPLACE VIEW user_dashboard AS
SELECT
    up.id,
    up.username,
    up.display_name,
    up.avatar_url,
    up.member_type,
    up.total_readings,
    up.total_daily_cards,
    up.current_streak,
    up.longest_streak,

    -- 最近活動
    (SELECT draw_date FROM daily_cards dc WHERE dc.user_id = up.id ORDER BY draw_date DESC LIMIT 1) as last_daily_card_date,
    (SELECT created_at FROM readings r WHERE r.user_id = up.id ORDER BY created_at DESC LIMIT 1) as last_reading_date,

    -- 30天統計
    (SELECT COUNT(*) FROM daily_cards dc WHERE dc.user_id = up.id AND dc.draw_date >= CURRENT_DATE - INTERVAL '30 days') as daily_cards_last_30_days,
    (SELECT COUNT(*) FROM readings r WHERE r.user_id = up.id AND r.created_at >= CURRENT_DATE - INTERVAL '30 days') as readings_last_30_days,

    up.created_at,
    up.last_active_at
FROM user_profiles up;

-- 13. 自動創建用戶資料觸發器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO user_profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            'user_' || substr(NEW.id::text, 1, 8)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            NEW.raw_user_meta_data->>'full_name',
            'Tarot User'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建觸發器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();