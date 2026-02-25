// ========================================
// 5軸スコア（DiagnosisScores）
// ========================================

export interface DiagnosisScores {
  caution: number;
  calmness: number;
  logic: number;
  cooperativeness: number;
  positivity: number;
}

// ========================================
// 診断フィードバック（DiagnosisFeedback）
// ========================================

export interface DiagnosisFeedback {
  title: string;
  description: string;
  gap_point: string;
}

// ========================================
// 詳細画面用: 特性スコア・メトリクス
// ========================================

export interface FeatureScore {
  axis: string;
  name: string;
  score: number;
}

export type MetricCategory =
  | 'scroll'
  | 'time'
  | 'mouse'
  | 'input'
  | 'voice'
  | 'logic'
  | 'social';

export interface Metric {
  label: string;
  user: number;
  average: number;
  category: MetricCategory;
}

export interface GameDetail {
  title: string;
  feature_scores: FeatureScore[];
  metrics: Metric[];
}

// ========================================
// 各ゲームの行動要約（phase_summaries）
// ========================================

export interface PhaseSummaries {
  phase_1: string;
  phase_2: string;
  phase_3: string;
}

// ========================================
// 診断結果レスポンス（ResultResponse）
// ========================================

export interface ResultDetails {
  game_1: GameDetail;
  game_2: GameDetail;
  game_3: GameDetail;
}

export interface ResultResponse {
  user_id: string;
  self_mbti: string | null;
  mbti_scores: DiagnosisScores | null;
  scores: DiagnosisScores;
  baseline_scores: DiagnosisScores;
  gaps: DiagnosisScores;
  game_breakdown: Record<string, Partial<DiagnosisScores>>;
  feedback: DiagnosisFeedback;
  accuracy_score: number;
  phase_summaries: PhaseSummaries;
  details: ResultDetails;
}
