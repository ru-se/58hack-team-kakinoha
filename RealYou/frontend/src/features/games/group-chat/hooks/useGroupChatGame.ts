'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game3Data, Game3StageLog } from '@/features/games/types';
import {
  BOTS,
  STAGES,
  STAGE_TIME_LIMIT_MS,
  TOTAL_STAGES,
  CUTIN_DURATION_MS,
  GROUP_NAME,
  GROUP_MEMBER_COUNT,
} from '../data/stages';
import type { StageDefinition } from '../data/stages';

/** Botメッセージを1件ずつ表示する間隔 */
const MESSAGE_REVEAL_DELAY_MS = 800;
/** 「○○が返信中...」を表示してから選択肢を出すまでの待機時間 */
const TYPING_INDICATOR_DURATION_MS = 1500;

/**
 * ゲームの進行状態。
 *
 * tutorial      → チュートリアルオーバーレイ表示中
 * stage-cutin   → ステージ切替カットイン演出（「場面1」等を1.2秒表示）
 * chat-playing  → Botメッセージを順次チャットに追加中
 * waiting-input → 選択肢表示中、ユーザーの入力待ち（10秒タイマー稼働）
 * submitting    → 全ステージ完了、Game3Dataを組み立ててonCompleteに渡す
 * completed     → 送信完了、次の画面への遷移待ち
 */
export type GamePhase =
  | 'tutorial'
  | 'stage-cutin'
  | 'chat-playing'
  | 'waiting-input'
  | 'submitting'
  | 'completed';

/** チャットタイムラインに表示する1件のBotメッセージ */
export interface TimelineMessage {
  type: 'bot';
  botId: string;
  text: string;
}

/** チャットタイムラインに表示する1件のユーザーメッセージ */
export interface UserTimelineMessage {
  type: 'user';
  text: string;
}

/** 日付等の区切り線メッセージ */
export interface SeparatorTimelineMessage {
  type: 'separator';
  label: string;
}

export type ChatMessage =
  | TimelineMessage
  | UserTimelineMessage
  | SeparatorTimelineMessage;

/**
 * Game 3（空気読みグループチャット）全体のステート管理フック。
 *
 * 以下のフローを制御する:
 *   tutorial → stage-cutin → chat-playing → waiting-input
 *     ↑ (5ステージ繰り返し)                       ↓
 *     └────────── stage-cutin ←────────────────────┘
 *   → submitting → completed
 */
export function useGroupChatGame(options: {
  onComplete: (data: Game3Data) => void;
}) {
  const { onComplete } = options;

  // =========================================================
  // UIに直接反映するステート
  // =========================================================
  const [gamePhase, setGamePhase] = useState<GamePhase>('tutorial');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [remainingTimeMs, setRemainingTimeMs] = useState(STAGE_TIME_LIMIT_MS);
  const [visibleMessageCount, setVisibleMessageCount] = useState(0);
  const [isTypingIndicatorVisible, setIsTypingIndicatorVisible] =
    useState(false);

  // =========================================================
  // 再レンダリング不要な計測データをrefで管理
  // =========================================================
  const tutorialOpenedAtRef = useRef<number>(0);
  const optionsShownAtRef = useRef<number>(0);
  const typingIndicatorShownAtRef = useRef<number>(0);
  /** 現ステージでの選択肢ホバー回数（別の選択肢へ移ったときのみ加算、ステージ切替でリセット） */
  const hoveredOptionsCountRef = useRef(0);
  /** 最後にホバーした選択肢ID（1〜4）。同じボタンでの細かいenter発火を無視するため */
  const lastHoveredOptionIdRef = useRef<number | null>(null);
  /** 全ステージ通じたホバー回数の累計（Game3Dataトップレベルに渡す） */
  const totalHoveredOptionsRef = useRef(0);
  /** ステージ3の「○○が返信中」表示〜ユーザー操作までの時間(ms) */
  const stage3TypingReactRef = useRef<number | null>(null);
  /** 各ステージの操作ログを蓄積 */
  const stageResultsRef = useRef<Game3StageLog[]>([]);
  const tutorialViewTimeRef = useRef(0);
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** buildAndSubmitの二重実行防止 */
  const submittedRef = useRef(false);

  // =========================================================
  // 派生値
  // =========================================================
  const currentStage: StageDefinition = STAGES[currentStageIndex];
  /** ステージ3,5で「○○が返信中」表示に使うBot名 */
  const typingBotName =
    currentStage?.trackTypingIndicator && currentStage.typingBotId
      ? (BOTS.find((b) => b.id === currentStage.typingBotId)?.name ?? null)
      : null;

  // =========================================================
  // ユーティリティ
  // =========================================================
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  // =========================================================
  // ステージ進行: 操作ログを記録して次ステージ or 完了へ
  // =========================================================
  const recordStageAndAdvance = useCallback(
    (
      selectedOptionId: number | null,
      reactionTimeMs: number,
      isTimeout: boolean,
      typingIndicatorReactTimeMs?: number | null
    ) => {
      const stage = STAGES[currentStageIndex];
      const log: Game3StageLog = {
        stageId: stage.stageId,
        selectedOptionId: isTimeout ? 0 : selectedOptionId,
        reactionTimeMs,
        isTimeout,
      };
      stageResultsRef.current = [...stageResultsRef.current, log];

      // hoveredOptionsは全ステージの累計をトップレベルに渡す
      totalHoveredOptionsRef.current += hoveredOptionsCountRef.current;
      hoveredOptionsCountRef.current = 0;
      lastHoveredOptionIdRef.current = null;

      // タイピングインジケータのUI表示はステージ3,5の両方で行うが、
      // バックエンド(scoreCalculator)が期待するのは単一値のため、
      // データ計測対象はステージ3のみに限定する
      if (stage.stageId === 3 && typingIndicatorReactTimeMs != null) {
        stage3TypingReactRef.current = typingIndicatorReactTimeMs;
      }

      setIsTypingIndicatorVisible(false);

      const nextIndex = currentStageIndex + 1;
      if (nextIndex >= TOTAL_STAGES) {
        setGamePhase('submitting');
      } else {
        // 次のステージの開始を示すセパレーターを挿入
        setChatMessages((prev) => [
          ...prev,
          { type: 'separator', label: `--- ${STAGES[nextIndex].dayLabel} ---` },
        ]);
        setCurrentStageIndex(nextIndex);
        setVisibleMessageCount(0);
        setGamePhase('stage-cutin');
      }
    },
    [currentStageIndex]
  );

  // =========================================================
  // チュートリアル → ゲーム開始
  // =========================================================

  /** チュートリアルオーバーレイをタップしたとき */
  const startGame = useCallback(() => {
    if (gamePhase !== 'tutorial') return;
    tutorialViewTimeRef.current = Date.now() - tutorialOpenedAtRef.current;
    setCurrentStageIndex(0);
    setChatMessages([
      { type: 'separator', label: 'TODAY' },
      { type: 'separator', label: `--- ${STAGES[0].dayLabel} ---` },
    ]);
    setVisibleMessageCount(0);
    stageResultsRef.current = [];
    totalHoveredOptionsRef.current = 0;
    lastHoveredOptionIdRef.current = null;
    stage3TypingReactRef.current = null;
    setGamePhase('stage-cutin');
  }, [gamePhase]);

  /** チュートリアル表示開始時刻を記録 */
  useEffect(() => {
    if (gamePhase !== 'tutorial') return;
    tutorialOpenedAtRef.current = Date.now();
  }, [gamePhase]);

  // =========================================================
  // カットイン演出: 1.2秒後にchat-playingへ遷移
  // =========================================================
  useEffect(() => {
    if (gamePhase !== 'stage-cutin') return;
    const id = setTimeout(() => {
      setGamePhase('chat-playing');
    }, CUTIN_DURATION_MS);
    timeoutsRef.current.push(id);
    return () => clearTimeout(id);
  }, [gamePhase, currentStageIndex]);

  // =========================================================
  // chat-playing: Botメッセージを800ms間隔で順次表示
  //   → 全メッセージ表示後、ステージ3,5なら「返信中...」を1.5秒表示
  //   → waiting-inputへ遷移
  // =========================================================
  useEffect(() => {
    if (gamePhase !== 'chat-playing' || !currentStage) return;

    const stageMessages = currentStage.messages;

    // メッセージがないステージ（現状は該当なし）の場合は即座に選択肢表示
    if (stageMessages.length === 0) {
      const id = setTimeout(() => {
        if (currentStage.trackTypingIndicator) {
          typingIndicatorShownAtRef.current = Date.now();
          setIsTypingIndicatorVisible(true);
        }
        optionsShownAtRef.current = Date.now();
        setRemainingTimeMs(STAGE_TIME_LIMIT_MS);
        setGamePhase('waiting-input');
      }, 0);
      timeoutsRef.current.push(id);
      return () => clearTimeout(id);
    }

    let mounted = true;
    let nextIndex = 0;

    const scheduleNext = () => {
      if (!mounted) return;

      // 全メッセージ表示完了 → 入力中表示 or 選択肢表示へ
      if (nextIndex >= stageMessages.length) {
        if (currentStage.trackTypingIndicator) {
          // ステージ3,5: 「○○が返信中」を表示し、1.5秒後に選択肢表示
          // 選択肢表示中も「返信中」は表示し続ける
          typingIndicatorShownAtRef.current = Date.now();
          setIsTypingIndicatorVisible(true);
          const id = setTimeout(() => {
            if (!mounted) return;
            optionsShownAtRef.current = Date.now();
            setRemainingTimeMs(STAGE_TIME_LIMIT_MS);
            setGamePhase('waiting-input');
          }, TYPING_INDICATOR_DURATION_MS);
          timeoutsRef.current.push(id);
        } else {
          optionsShownAtRef.current = Date.now();
          setRemainingTimeMs(STAGE_TIME_LIMIT_MS);
          setGamePhase('waiting-input');
        }
        return;
      }

      // メッセージを1件追加して次をスケジュール
      const msg = stageMessages[nextIndex];
      setChatMessages((prev) => [
        ...prev,
        { type: 'bot', botId: msg.botId, text: msg.text },
      ]);
      setVisibleMessageCount((c) => c + 1);
      nextIndex += 1;
      const id = setTimeout(scheduleNext, MESSAGE_REVEAL_DELAY_MS);
      timeoutsRef.current.push(id);
    };

    const id = setTimeout(scheduleNext, MESSAGE_REVEAL_DELAY_MS);
    timeoutsRef.current.push(id);

    return () => {
      mounted = false;
      clearAllTimeouts();
    };
  }, [gamePhase, currentStageIndex, currentStage, clearAllTimeouts]);

  // =========================================================
  // waiting-input: 10秒カウントダウン → 時間切れで自動進行
  // =========================================================
  useEffect(() => {
    if (gamePhase !== 'waiting-input') return;

    const start = Date.now();
    timerIdRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, STAGE_TIME_LIMIT_MS - elapsed);
      setRemainingTimeMs(remaining);

      if (remaining <= 0 && timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;

        const now = Date.now();
        const reactionTimeMs = now - optionsShownAtRef.current;
        const typingReact =
          currentStage.trackTypingIndicator && typingIndicatorShownAtRef.current
            ? now - typingIndicatorShownAtRef.current
            : undefined;

        // タイムアウト: selectedOptionId=0, isTimeout=true
        recordStageAndAdvance(null, reactionTimeMs, true, typingReact);
      }
    }, 100);

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [gamePhase, currentStageIndex, currentStage, recordStageAndAdvance]);

  // =========================================================
  // ユーザー操作ハンドラ
  // =========================================================

  /** 選択肢をクリックしたとき（optionId: 1〜4） */
  const selectOption = useCallback(
    (optionId: number) => {
      if (gamePhase !== 'waiting-input') return;
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }

      const now = Date.now();
      const reactionTimeMs = now - optionsShownAtRef.current;
      const typingIndicatorReactTimeMs =
        currentStage.trackTypingIndicator && typingIndicatorShownAtRef.current
          ? now - typingIndicatorShownAtRef.current
          : undefined;

      // チャットタイムラインにユーザーの選択を表示
      const opt = currentStage.options[optionId - 1];
      const optionText = opt ? `${opt.emoji} ${opt.label}` : '';
      setChatMessages((prev) => [...prev, { type: 'user', text: optionText }]);

      recordStageAndAdvance(
        optionId,
        reactionTimeMs,
        false,
        typingIndicatorReactTimeMs
      );
    },
    [gamePhase, currentStage, recordStageAndAdvance]
  );

  /** 選択肢にマウスを乗せたとき（迷いの計測用） */
  /** optionId: 1〜4。別の選択肢に移ったときだけカウント（BEは0〜5回想定）。各ステージの最初の1回はカウントしない */
  const handleOptionHover = useCallback(
    (optionId: number) => {
      if (gamePhase !== 'waiting-input') return;
      if (lastHoveredOptionIdRef.current === optionId) return;
      const isMovingFromAnother = lastHoveredOptionIdRef.current !== null;
      lastHoveredOptionIdRef.current = optionId;
      if (isMovingFromAnother) hoveredOptionsCountRef.current += 1;
    },
    [gamePhase]
  );

  // =========================================================
  // ゲーム終了 → Game3Data組み立て → onComplete
  // =========================================================
  useEffect(() => {
    if (gamePhase !== 'submitting' || submittedRef.current) return;
    submittedRef.current = true;

    const game3Data: Game3Data = {
      tutorialViewTime: tutorialViewTimeRef.current,
      stages: [...stageResultsRef.current],
      hoveredOptions: totalHoveredOptionsRef.current,
      typingIndicatorReactTimeMs: stage3TypingReactRef.current,
    };
    onComplete(game3Data);
    const id = setTimeout(() => setGamePhase('completed'), 0);
    timeoutsRef.current.push(id);
    return () => clearTimeout(id);
  }, [gamePhase, onComplete]);

  // =========================================================
  // 全リソースクリーンアップ（アンマウント時）
  // =========================================================
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [clearAllTimeouts]);

  // =========================================================
  // 外部に公開する値・関数
  // =========================================================
  return {
    gamePhase,
    currentStage,
    currentStageIndex,
    chatMessages,
    remainingTimeMs,
    isTypingIndicatorVisible,
    typingBotName,
    visibleMessageCount,
    startGame,
    selectOption,
    handleOptionHover,
    stageTimeLimitMs: STAGE_TIME_LIMIT_MS,
    totalStages: TOTAL_STAGES,
    bots: BOTS,
    groupName: GROUP_NAME,
    groupMemberCount: GROUP_MEMBER_COUNT,
  };
}
