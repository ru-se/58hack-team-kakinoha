// ========================================
// API Request/Response型
// ========================================

export interface BaselineScores {
  caution: number; // 0-100
  calmness: number;
  logic: number;
  cooperativeness: number;
  positivity: number;
}

export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export interface BaselineAnswers {
  q1_caution: AnswerOption;
  q2_calmness: AnswerOption;
  q3_logic: AnswerOption;
  q4_cooperativeness: AnswerOption;
  q5_positivity: AnswerOption;
}

export interface RegisterRequest {
  mbti?: string | null; // オプショナル
  baseline_answers: BaselineAnswers; // 必須
}

export interface RegisterResponse {
  user_id: string; // UUID
  status: "success";
}

export type GameType = 1 | 2 | 3;

export interface SubmitGameRequest {
  user_id: string;
  game_type: GameType;
  data: Record<string, any>;
}

export interface SubmitGameResponse {
  status: "success" | "error";
  message: string;
}

export interface DiagnosisFeedback {
  title: string;
  description: string;
  gap_point: string;
}

export interface GameBreakdown {
  game_1?: Partial<BaselineScores>;
  game_2?: Partial<BaselineScores>;
  game_3?: Partial<BaselineScores>;
}

export interface PhaseSummaries {
  phase_1: string; // 利用規約での行動サマリー
  phase_2: string; // カスタマーサポートでの行動サマリー
  phase_3: string; // グループチャットでの行動サマリー
}

export interface ResultResponse {
  user_id: string;
  self_mbti: string | null;
  mbti_scores: BaselineScores | null; // MBTI理論値スコア（スキップ時はnull）
  scores: BaselineScores; // 実測スコア
  baseline_scores: BaselineScores; // 自己申告スコア
  gaps: BaselineScores; // 差分
  game_breakdown: GameBreakdown;
  feedback: DiagnosisFeedback;
  accuracy_score: number; // 自己認識精度（0-100）
  phase_summaries: PhaseSummaries; // 各フェーズの振り返りテキスト
  details: any; // 各ゲームごとの詳細メトリクスと特徴スコア
}

export interface ApiError {
  status: "error";
  error: string;
  message: string;
}

// ========================================
// DB型定義
// ========================================

export interface User {
  id: string;
  self_mbti: string | null;
  baseline_caution: number;
  baseline_calmness: number;
  baseline_logic: number;
  baseline_coop: number;
  baseline_positive: number;
  created_at: string;
}

export interface GameLog {
  id: number;
  user_id: string;
  game_type: number;
  raw_data: any;
  played_at: string;
}

// ========================================
// Enum
// ========================================

export const GAME_TYPES = {
  TERMS_GAME: 1,
  AI_CHAT: 2,
  GROUP_CHAT: 3,
} as const;

export const SCORE_KEYS = {
  CAUTION: 'caution',
  CALMNESS: 'calmness',
  LOGIC: 'logic',
  COOPERATIVENESS: 'cooperativeness',
  POSITIVITY: 'positivity',
} as const;

export type ScoreKey = typeof SCORE_KEYS[keyof typeof SCORE_KEYS];
