-- 1. users テーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    auth_type TEXT NOT NULL DEFAULT 'dummy',
    auth_payload JSONB DEFAULT '{}'::jsonb,
    exp_web INTEGER NOT NULL DEFAULT 0,
    exp_ai INTEGER NOT NULL DEFAULT 0,
    exp_security INTEGER NOT NULL DEFAULT 0,
    exp_infrastructure INTEGER NOT NULL DEFAULT 0,
    exp_design INTEGER NOT NULL DEFAULT 0,
    exp_game INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- GameLogs テーブル
CREATE TABLE game_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type INT NOT NULL CHECK (game_type BETWEEN 1 AND 3),
  raw_data JSONB NOT NULL,
  played_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

-- AnalysisResults テーブル（結果キャッシュ）
CREATE TABLE analysis_results (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- 実測スコア
  score_caution INT NOT NULL CHECK (score_caution BETWEEN 0 AND 100),
  score_calmness INT NOT NULL CHECK (score_calmness BETWEEN 0 AND 100),
  score_logic INT NOT NULL CHECK (score_logic BETWEEN 0 AND 100),
  score_coop INT NOT NULL CHECK (score_coop BETWEEN 0 AND 100),
  score_positive INT NOT NULL CHECK (score_positive BETWEEN 0 AND 100),
  -- MBTI理論値
  mbti_caution INT CHECK (mbti_caution BETWEEN 0 AND 100),
  mbti_calmness INT CHECK (mbti_calmness BETWEEN 0 AND 100),
  mbti_logic INT CHECK (mbti_logic BETWEEN 0 AND 100),
  mbti_coop INT CHECK (mbti_coop BETWEEN 0 AND 100),
  mbti_positive INT CHECK (mbti_positive BETWEEN 0 AND 100),
  -- ギャップ
  gap_caution INT NOT NULL,
  gap_calmness INT NOT NULL,
  gap_logic INT NOT NULL,
  gap_coop INT NOT NULL,
  gap_positive INT NOT NULL,
  -- フィードバック
  feedback_title VARCHAR(255) NOT NULL,
  feedback_description TEXT NOT NULL,
  feedback_gap_point VARCHAR(50) NOT NULL,
  -- その他
  game_contributions JSONB NOT NULL,
  accuracy_score INT NOT NULL CHECK (accuracy_score BETWEEN 0 AND 100),
  phase_summaries JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_game_logs_user_id ON game_logs(user_id);
CREATE INDEX idx_game_logs_game_type ON game_logs(game_type);

-- 2. quizzes テーブル
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    max_points INTEGER NOT NULL CHECK (max_points >= 10 AND max_points <= 100),
    genres JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. questions テーブル
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    order_num INTEGER NOT NULL CHECK (order_num >= 1),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL CHECK (correct_index >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. quiz_results テーブル
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    correct_count INTEGER NOT NULL CHECK (correct_count >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    earned_points INTEGER NOT NULL CHECK (earned_points >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (correct_count <= total_questions),
    UNIQUE(user_id, quiz_id)
);
