/**
 * stages.ts — 型定義 & 定数エクスポート
 *
 * シナリオの中身（テキスト・選択肢・Bot設定）は scenario.ts を編集してください。
 * このファイルはゲームロジック（hook / component）が参照する型と定数を提供します。
 */

import {
  SCENARIO_BOTS,
  SCENARIO_GROUP_NAME,
  SCENARIO_GROUP_MEMBER_COUNT,
  SCENARIO_STAGES,
} from './scenario';

// ============================================================
// ⏱️ タイミング定数（ゲームエンジン設定）
// ============================================================

/** 選択肢の制限時間（ms） */
export const STAGE_TIME_LIMIT_MS = 10_000;

/**
 * ステージ数 — scenario.ts の SCENARIO_STAGES 配列長から自動導出。
 * 手動で変更する必要はありません。
 */
export const TOTAL_STAGES: number = SCENARIO_STAGES.length;

/** ステージカットイン演出の表示時間（ms） */
export const CUTIN_DURATION_MS = 1_200;

// ============================================================
// 📐 型定義
// ============================================================

export interface BotCharacter {
  id: string;
  name: string;
  avatarLabel: string;
  color: string;
}

export interface ChatMessageItem {
  botId: string;
  text: string;
}

/**
 * 選択肢の1項目。
 *
 * type:
 *   'cooperative'  → 協調的な行動（多数派に合わせる・空気を読む）
 *   'independent'  → 独自性のある行動（自分の意見を通す・関わらない）
 *
 * ⚠️ バックエンドの scoreCalculator は type ではなく selectedOptionId の
 *    「1〜cooperativeCount」を協調と判定します。
 *    type はあくまでシナリオライター向けのラベルです。
 */
export interface OptionItem {
  emoji: string;
  label: string;
  type: 'cooperative' | 'independent';
}

export interface StageDefinition {
  stageId: number;
  theme: string;
  dayLabel: string;
  messages: ChatMessageItem[];
  /**
   * 選択肢の配列。個数は自由（2〜6つ程度を推奨）。
   *
   * ⚠️ スコア計算ルール（バックエンドとの取り決め）:
   *   先頭から cooperativeCount 個が「協調」と判定されます。
   *   cooperative な選択肢を必ず先頭にまとめてください。
   */
  options: OptionItem[];
  /**
   * 協調判定する選択肢のカウント（先頭N個）。
   * デフォルトは Math.floor(options.length / 2)。
   * scenario.ts で明示的に指定することを推奨。
   */
  cooperativeCount: number;
  trackTypingIndicator: boolean;
  typingBotId: string | null;
}

// ============================================================
// 📦 シナリオデータ（scenario.ts から読み込み）
// ============================================================

export const BOTS: BotCharacter[] = SCENARIO_BOTS;
export const GROUP_NAME: string = SCENARIO_GROUP_NAME;
export const GROUP_MEMBER_COUNT: number = SCENARIO_GROUP_MEMBER_COUNT;
export const STAGES: StageDefinition[] = SCENARIO_STAGES;
