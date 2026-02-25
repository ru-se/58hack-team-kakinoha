// ========================================
// Game 共通型
// ========================================

export interface SubmitGameRequest {
  user_id: string;
  game_type: 1 | 2 | 3;
  data: Record<string, unknown>;
}

export interface SubmitGameResponse {
  status: 'success' | 'error';
  message: string;
}

// ========================================
// Game 1: 利用規約ゲーム
// ========================================

export interface ScrollEvent {
  position: number;
  timestamp: number;
}

export interface CheckboxState {
  checked: boolean;
  changed: boolean;
}

export interface PopupStats {
  timeToClose: number;
  clickCount: number;
  // ポップアップ表示中のマウス余剰移動距離（px）。総移動距離 − 最短直線距離
  mouseJitter: number;
}

export interface Game1Data {
  totalTime: number;
  finalAction: 'agree' | 'disagree';
  reachedBottom: boolean;
  scrollEvents: ScrollEvent[];
  hiddenInput: string | null;
  checkboxStates: {
    readConfirm: CheckboxState;
    mailMagazine: CheckboxState;
    thirdPartyShare: CheckboxState;
  };
  popupStats: PopupStats;
  // 「同意する」ボタンにホバーしてからクリックするまでの時間（ms）
  agreeButtonHoverTimeMs: number;
}

// ========================================
// Game 2: カスタマーサポートチャット
// ========================================

export interface Game2Turn {
  turnIndex: number;
  inputMethod: 'voice' | 'text';
  reactionTimeMs: number | null;
  speechDurationMs: number | null;
  silenceDurationMs: number | null;
  volumeDb: number | null;
  transcribedText: string;
}

export interface TextInputMetrics {
  typingIntervalVariance: number;
}

export interface Game2Data {
  inputMethod: 'voice' | 'text';
  turnCount: number;
  turns: Game2Turn[];
  textInputMetrics: TextInputMetrics | null;
}

// Game 2: AI返答生成API (POST /api/voice/respond)
export interface VoiceRespondRequest {
  user_id: string;
  message: string;
  conversation_history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface VoiceRespondResponse {
  response: string;
  emotion: string;
  confidence: number;
}

// ========================================
// Game 3: グループチャット（空気読み）
// ========================================

export interface Game3StageLog {
  stageId: number;
  selectedOptionId: number | null;
  reactionTimeMs: number;
  isTimeout: boolean;
}

export interface Game3Data {
  tutorialViewTime: number;
  stages: Game3StageLog[];
  /** 全ステージ通じた選択肢ホバー回数の合計 */
  hoveredOptions: number;
  /** ステージ3の「○○が返信中」表示〜ユーザー操作までの時間(ms) */
  typingIndicatorReactTimeMs: number | null;
}
