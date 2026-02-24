-- Users テーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  self_mbti VARCHAR(10),
  baseline_caution INT NOT NULL CHECK (baseline_caution BETWEEN 0 AND 100),
  baseline_calmness INT NOT NULL CHECK (baseline_calmness BETWEEN 0 AND 100),
  baseline_logic INT NOT NULL CHECK (baseline_logic BETWEEN 0 AND 100),
  baseline_coop INT NOT NULL CHECK (baseline_coop BETWEEN 0 AND 100),
  baseline_positive INT NOT NULL CHECK (baseline_positive BETWEEN 0 AND 100),
  created_at TIMESTAMP DEFAULT NOW()
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
