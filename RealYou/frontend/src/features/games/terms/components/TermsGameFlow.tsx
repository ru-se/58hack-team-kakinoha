'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import type { Game1Data, ScrollEvent } from '@/features/games/types';
import { game1DataAtom } from '@/stores/games';
import PopupAd from './PopupAd';
import PopupTerms from './PopupTerms';
import LoadingScreen from '@/components/common/LoadingScreen';
// TODO: バックエンド接続時にコメントアウトを解除する
// import { submitGame } from '@/lib/api';

// ポップアップ広告が表示されるまでの遅延時間（ms）
const POPUP_DELAY_MS = 15_000;
// スクロールイベントの記録間隔（ms）。パフォーマンスのため間引く
const SCROLL_THROTTLE_MS = 200;
// 「最下部まで到達した」と判定するスクロール割合（90%）
const REACHED_BOTTOM_THRESHOLD = 0.9;

export default function TermsGameFlow() {
  const router = useRouter();
  const setGame1Data = useSetAtom(game1DataAtom);

  const [checkboxStates, setCheckboxStates] = useState({
    readConfirm: false,
    mailMagazine: true,
    thirdPartyShare: true,
  });
  // 第12条の隠し指示「確認済み」の入力値
  const [hiddenInputValue, setHiddenInputValue] = useState('');
  // ポップアップ広告の表示状態
  const [showPopup, setShowPopup] = useState(false);
  // 利用規約モーダル表示状態（初期で表示）
  const [showTermsModal] = useState(true);
  // ゲーム完了フラグ（trueで完了画面を表示→次のゲームへ遷移）
  const [isCompleted, setIsCompleted] = useState(false);

  //BGM再生用のref
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // --- 以下は再レンダリング不要なデータをrefで管理 ---
  // ゲーム開始時刻（totalTime算出用）
  const startTimeRef = useRef(0);
  // スクロール位置+経過時間のログ配列
  const scrollEventsRef = useRef<ScrollEvent[]>([]);
  // 最下部到達フラグ
  const reachedBottomRef = useRef(false);
  // 前回スクロール記録時刻（スロットリング用）
  const lastScrollRecordRef = useRef(0);
  // スクロール領域のDOM参照
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // ポップアップが表示された時刻（timeToClose算出用）。レンダー時にJSXへ渡すためstateで管理
  const [popupAppearedAt, setPopupAppearedAt] = useState(0);
  // ポップアップへの対応データ
  const popupStatsRef = useRef({
    timeToClose: 0,
    clickCount: 0,
    mouseJitter: 0,
  });
  // 「同意する」ボタンにホバーし始めた時刻
  const agreeHoverStartRef = useRef(0);
  // 各チェックボックスがユーザーによって変更されたかの追跡
  const checkboxChangedRef = useRef({
    readConfirm: false,
    mailMagazine: false,
    thirdPartyShare: false,
  });

  useEffect(() => {
    const bgm = new Audio('/realyou/sounds/start-bgm.mp3');
    bgm.loop = true;
    bgm.volume = 0.3;
    bgmRef.current = bgm;

    const playBGM = () => {
      bgm.play().catch(() => {
        /* 自動再生制限用 */
      });
      window.removeEventListener('click', playBGM);
    };

    window.addEventListener('click', playBGM);

    return () => {
      bgm.pause();
      window.removeEventListener('click', playBGM);
    };
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();
    scrollEventsRef.current.push({
      position: 0,
      timestamp: 0,
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPopupAppearedAt(Date.now());
      setShowPopup(true);
    }, POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const now = Date.now();
    if (now - lastScrollRecordRef.current < SCROLL_THROTTLE_MS) return;
    lastScrollRecordRef.current = now;

    const elapsed = now - startTimeRef.current;
    const position = container.scrollTop;

    scrollEventsRef.current.push({ position, timestamp: elapsed });

    const scrollRatio =
      position / (container.scrollHeight - container.clientHeight);
    if (scrollRatio >= REACHED_BOTTOM_THRESHOLD) {
      reachedBottomRef.current = true;
    }
  }, []);

  const handleCheckboxChange = useCallback(
    (
      key: 'readConfirm' | 'mailMagazine' | 'thirdPartyShare',
      checked: boolean
    ) => {
      const se = new Audio('/realyou/sounds/check-box-se.mp3');
      se.volume = 0.4;
      se.play().catch(() => {});
      checkboxChangedRef.current[key] = true;
      setCheckboxStates((prev) => ({ ...prev, [key]: checked }));
    },
    []
  );

  const handleHiddenInputChange = useCallback((value: string) => {
    setHiddenInputValue(value);
  }, []);

  const handlePopupClose = useCallback(
    (clickCount: number, timeToClose: number, mouseJitter: number) => {
      popupStatsRef.current = { clickCount, timeToClose, mouseJitter };
      setShowPopup(false);
    },
    []
  );

  // モーダル内スクロール領域を親で扱えるようにするためのコールバック
  const setModalScrollRef = useCallback((el: HTMLDivElement | null) => {
    scrollContainerRef.current = el;
  }, []);

  const handleAgreeHoverStart = useCallback(() => {
    if (agreeHoverStartRef.current === 0) {
      agreeHoverStartRef.current = Date.now();
    }
  }, []);

  const getAgreeButtonHoverTimeMs = useCallback(() => {
    if (agreeHoverStartRef.current === 0) return 0;
    return Date.now() - agreeHoverStartRef.current;
  }, []);

  const buildGame1Data = useCallback(
    (action: 'agree' | 'disagree'): Game1Data => {
      const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);

      return {
        totalTime,
        finalAction: action,
        reachedBottom: reachedBottomRef.current,
        scrollEvents: scrollEventsRef.current,
        hiddenInput: hiddenInputValue || null,
        checkboxStates: {
          readConfirm: {
            checked: checkboxStates.readConfirm,
            changed: checkboxChangedRef.current.readConfirm,
          },
          mailMagazine: {
            checked: checkboxStates.mailMagazine,
            changed: checkboxChangedRef.current.mailMagazine,
          },
          thirdPartyShare: {
            checked: checkboxStates.thirdPartyShare,
            changed: checkboxChangedRef.current.thirdPartyShare,
          },
        },
        popupStats: popupStatsRef.current,
        agreeButtonHoverTimeMs: getAgreeButtonHoverTimeMs(),
      };
    },
    [hiddenInputValue, checkboxStates, getAgreeButtonHoverTimeMs]
  );

  const handleAction = useCallback(
    (action: 'agree' | 'disagree') => {
      const se = new Audio('/realyou/sounds/general-button-se.mp3');
      se.play().catch(() => {});

      const data = buildGame1Data(action);
      setGame1Data(data);

      setIsCompleted(true);

      if (bgmRef.current) {
        bgmRef.current.pause();
      }

      setTimeout(() => {
        router.push('/diagnosis');
      }, 2000);
    },
    [buildGame1Data, setGame1Data, router]
  );

  if (isCompleted) {
    return <LoadingScreen message="MBTI診断へ移動中..." />;
  }

  return (
    <div className="flex h-screen flex-col bg-[#F0F380]">
      <div className="flex-1" />

      {showPopup && (
        <PopupAd onClose={handlePopupClose} appearedAt={popupAppearedAt} />
      )}

      {showTermsModal && (
        <PopupTerms
          onCheckboxChange={handleCheckboxChange}
          onHiddenInputChange={handleHiddenInputChange}
          checkboxStates={checkboxStates}
          hiddenInputValue={hiddenInputValue}
          setScrollContainerRef={setModalScrollRef}
          onScroll={handleScroll}
          onAction={handleAction}
          onAgreeHoverStart={handleAgreeHoverStart}
        />
      )}
    </div>
  );
}
