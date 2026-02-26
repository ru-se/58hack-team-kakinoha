/**
 * stages.ts — 型定義 & 定数エクスポート
 *
 * シナリオの中身（テキスト・選択肢・Bot設定）は scenario.ts を編集してください。
 * このファイルはゲームロジック（hook / component）が参照する型と定数を提供します。
 */

// ============================================================
// ⏱️ タイミング定数（ゲームエンジン設定）
// ============================================================

/** 選択肢の制限時間（ms） */
export const STAGE_TIME_LIMIT_MS = 10_000;

/** ステージ数（SCENARIO_STAGES の配列長と必ず一致させること） */
export const TOTAL_STAGES = 5;

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

export interface OptionItem {
  emoji: string;
  label: string;
}

export interface StageDefinition {
  stageId: number;
  theme: string;
  dayLabel: string;
  messages: ChatMessageItem[];
  options: OptionItem[];
  trackTypingIndicator: boolean;
  typingBotId: string | null;
}

// ============================================================
// 📦 シナリオデータ（scenario.ts から読み込み）
// ============================================================
import {
  SCENARIO_BOTS,
  SCENARIO_GROUP_NAME,
  SCENARIO_GROUP_MEMBER_COUNT,
  SCENARIO_STAGES,
} from './scenario';

export const BOTS: BotCharacter[] = SCENARIO_BOTS;
export const GROUP_NAME: string = SCENARIO_GROUP_NAME;
export const GROUP_MEMBER_COUNT: number = SCENARIO_GROUP_MEMBER_COUNT;
export const STAGES: StageDefinition[] = SCENARIO_STAGES;
