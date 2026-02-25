'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSetAtom } from 'jotai';
import { mbtiAtom, diagnosisStepAtom } from '@/stores/diagnosis';
import { MBTI_TYPES, MBTI_GROUPS, type MbtiType } from '@/constants/mbti';

// タブとカードで同じ色を使用（ジャンルごと）
const GROUP_COLORS = [
  'bg-[#E5A1F4]', // 分析家 - light purple
  'bg-[#89F1C8]', // 外交官 - teal
  'bg-[#8EE3FA]', // 番人 - light blue
  'bg-[#FFD77B]', // 探検家 - light orange
] as const;

// 水玉模様用（ジャンルごとの色・HEX）
const GROUP_COLOR_HEX = ['#E5A1F4', '#89F1C8', '#8EE3FA', '#FFD77B'] as const;

// オーバーレイ用（ジャンルごとの少し濃い色）
const GROUP_OVERLAY_COLORS = [
  'bg-[#c77dd9]', // 分析家 - darker magenta
  'bg-[#52c9a0]', // 外交官 - darker mint
  'bg-[#55c9e8]', // 番人 - darker cyan
  'bg-[#e6b84d]', // 探検家 - darker gold
] as const;

function getTypesByGroup(group: string): MbtiType[] {
  return MBTI_TYPES.filter((t) => t.group === group);
}

export default function MbtiSelect() {
  const setMbti = useSetAtom(mbtiAtom);
  const setStep = useSetAtom(diagnosisStepAtom);
  const [groupIndex, setGroupIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [transitionVia, setTransitionVia] = useState<
    'tab' | 'arrow-left' | 'arrow-right'
  >('tab');
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const playSE = useCallback((path: string) => {
    const audio = new Audio(path);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, []);

  // BGMの初期化と再生管理
  useEffect(() => {
    // TopPageと同じ start-bgm を使用
    const bgm = new Audio('/sounds/start-bgm.mp3');
    bgm.loop = true;
    bgm.volume = 0.4;
    bgmRef.current = bgm;

    const playBGM = () => {
      bgm.play().catch(() => {});
      window.removeEventListener('click', playBGM);
    };

    window.addEventListener('click', playBGM);
    // すでに他のページでインタラクションがあれば即再生される
    playBGM();

    return () => {
      bgm.pause();
      window.removeEventListener('click', playBGM);
    };
  }, []);

  const currentGroup = MBTI_GROUPS[groupIndex];
  const currentTypes = getTypesByGroup(currentGroup);
  const selectedType = selected
    ? MBTI_TYPES.find((t) => t.code === selected)
    : null;

  const handleTabClick = useCallback(
    (index: number) => {
      if (index === groupIndex) return;
      // タブクリック時は transitionVia を先に 'tab' に反映してから groupIndex を更新
      // （矢印遷移後の初回タブクリックで正しいアニメーションが使われるようにする）
      flushSync(() => setTransitionVia('tab'));
      setGroupIndex(index);
      setSelected(null);
      playSE('/sounds/general-button-se.mp3');
    },
    [groupIndex, playSE]
  );

  const handleArrowPrev = useCallback(() => {
    setTransitionVia('arrow-right'); // コンテンツは右から入る
    setGroupIndex((i) => (i - 1 + MBTI_GROUPS.length) % MBTI_GROUPS.length);
    setSelected(null);
    playSE('/sounds/general-button-se.mp3');
  }, [playSE]);

  const handleArrowNext = useCallback(() => {
    setTransitionVia('arrow-left'); // コンテンツは左から入る
    setGroupIndex((i) => (i + 1) % MBTI_GROUPS.length);
    setSelected(null);
    playSE('/sounds/general-button-se.mp3');
  }, [playSE]);

  const handleConfirm = () => {
    playSE('/sounds/general-button-se.mp3');
    if (!selected) return;
    setMbti(selected);
    setStep('quiz');
  };

  const handleReselect = () => {
    playSE('/sounds/general-button-se.mp3');
    setSelected(null);
  };

  const handleSkip = () => {
    playSE('/sounds/general-button-se.mp3');
    setMbti(null);
    setStep('quiz');
  };

  const getContentVariants = () => {
    if (transitionVia === 'tab') {
      return {
        enter: { opacity: 0 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0 },
      };
    }
    if (transitionVia === 'arrow-left') {
      return {
        enter: { opacity: 0, x: 80 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -80 },
      };
    }
    return {
      enter: { opacity: 0, x: -80 },
      center: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 80 },
    };
  };

  const contentVariants = getContentVariants();

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center py-2">
      {/* メインカード + タブ */}
      <div className="flex min-h-0 w-full flex-1 flex-col items-center px-1">
        {/* 4ジャンルタブ - 左詰め、少し大きく */}
        <div className="flex w-full justify-start gap-0">
          {MBTI_GROUPS.map((group, index) => (
            <motion.button
              key={group}
              type="button"
              onClick={() => handleTabClick(index)}
              className={`relative z-10 cursor-pointer rounded-t-lg border-4 border-b-0 border-gray-800 px-4 py-2 text-base font-semibold text-gray-800 ${
                GROUP_COLORS[index]
              } ${groupIndex === index ? 'mb-[-4px]' : ''}`}
              animate={{
                y: groupIndex === index ? 2 : 0,
                boxShadow:
                  groupIndex === index
                    ? 'inset 0 3px 6px rgba(0,0,0,0.12)'
                    : 'none',
              }}
              transition={{ duration: 0.2 }}
            >
              {group}
            </motion.button>
          ))}
        </div>

        {/* カード本体 - items-center 親でも幅を確保するため w-full */}
        <div
          className={`relative flex w-full min-h-[70vh] max-h-[85vh] flex-1 flex-col justify-center items-center overflow-visible rounded-4xl rounded-tl-none border-4 border-gray-800 shadow-lg ${GROUP_COLORS[groupIndex]}`}
        >
          {/* わからないボタン - カード内右上 */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute right-2 top-2 z-10 cursor-pointer rounded-lg border-4 border-gray-800 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md active:scale-95"
          >
            わからない
          </button>
          <p className="shrink-0 mb-2 pb-1 text-center text-5xl font-bold text-gray-900">
            あなたのMBTIを選んでね！！
          </p>

          {/* キャラ表示エリア + 左右矢印 - グリッドでボタンとカードを分離 */}
          <div className="mx-4 grid min-h-0 w-full max-h-[420px] flex-1 grid-cols-[auto_1fr_auto] items-center gap-1 px-2 py-1">
            <button
              type="button"
              onClick={handleArrowPrev}
              aria-label="前のジャンル"
              className="h-0 w-0 shrink-0 cursor-pointer border-y-18 border-r-24 border-l-0 border-y-transparent border-r-white transition hover:border-r-gray-200 hover:scale-110"
            />

            <div className="relative min-h-52 overflow-visible">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={groupIndex}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={contentVariants}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center gap-1"
                >
                  <div
                    className="flex h-full w-full items-stretch justify-center gap-2 rounded-lg bg-white px-1 py-1"
                    style={{
                      backgroundImage: `radial-gradient(circle, ${GROUP_COLOR_HEX[groupIndex]} 2px, transparent 2px)`,
                      backgroundSize: '20px 20px',
                    }}
                  >
                    {currentTypes.map((type) => (
                      <motion.button
                        key={type.code}
                        type="button"
                        onClick={() => {
                          setSelected(type.code);
                          playSE('/sounds/general-button-se.mp3');
                        }}
                        className="relative z-0 flex flex-1 basis-0 flex-col cursor-pointer items-center justify-center overflow-hidden rounded-4xl border-2 border-gray-800 bg-white/80 outline-none ring-0 hover:z-50"
                        whileHover={{
                          scale: 1.2,
                          y: -16,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{ scale: 1.02 }}
                        style={{ boxShadow: 'none' }}
                      >
                        <div className="relative flex min-h-0 flex-1 items-center justify-center w-full">
                          <Image
                            src={`/images/mbti/${type.code}.png`}
                            alt={type.name}
                            width={176}
                            height={176}
                            className="max-h-44 w-auto border-0 object-contain outline-none"
                          />
                          <div
                            className={`absolute bottom-0 left-0 right-0 ${GROUP_OVERLAY_COLORS[groupIndex]} py-1.5 px-2 text-center`}
                          >
                            <p className="text-sm font-bold text-white">
                              {type.code} / {type.name}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={handleArrowNext}
              aria-label="次のジャンル"
              className="h-0 w-0 shrink-0 cursor-pointer border-y-18 border-l-24 border-r-0 border-y-transparent border-l-white transition hover:border-l-gray-200 hover:scale-110"
            />
          </div>
        </div>
      </div>

      {/* 決定確認ポップアップ */}
      {selectedType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mbti-confirm-title"
        >
          <div
            className={`mx-4 w-full max-w-md rounded-2xl border-4 border-gray-800 p-6 shadow-xl ${
              GROUP_COLORS[
                Math.max(
                  0,
                  MBTI_GROUPS.findIndex((g) => g === selectedType.group)
                )
              ]
            }`}
          >
            <p
              id="mbti-confirm-title"
              className="text-center text-lg font-bold text-gray-900"
            >
              あなたのMBTIは
            </p>
            <div className="my-4 flex justify-center">
              <Image
                src={`/images/mbti/${selectedType.code}.png`}
                alt={selectedType.name}
                width={128}
                height={128}
                className="h-32 w-auto border-0 object-contain outline-none"
              />
            </div>
            <p className="text-center text-xl font-bold text-gray-900">
              {selectedType.code} / {selectedType.name}
            </p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={handleReselect}
                className="flex-1 cursor-pointer rounded-lg border-4 border-gray-800 bg-white px-4 py-3 font-semibold text-gray-800 transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:shadow-md active:scale-95"
              >
                選び直す
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 cursor-pointer rounded-lg border-4 border-gray-800 bg-white px-4 py-3 font-semibold text-gray-800 transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:shadow-md active:scale-95"
              >
                決定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
