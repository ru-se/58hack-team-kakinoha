'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { mbtiAtom } from '@/stores/diagnosis';
import { game1DataAtom } from '@/stores/games';
import {
  QUESTIONS,
  type QuestionKey,
  type BaselineAnswers,
  type AnswerOption,
} from '@/features/diagnosis/types';
import LoadingScreen from '@/components/common/LoadingScreen';
import { postRegister, submitGame } from '@/lib/api';

type Status = 'answering' | 'loading' | 'error' | 'success';

// TODO: UIは仮のものです。
export default function BaselineSurvey() {
  const router = useRouter();
  const mbti = useAtomValue(mbtiAtom);
  const game1Data = useAtomValue(game1DataAtom);

  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const playSE = useCallback((path: string) => {
    const audio = new Audio(path);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, []);

  // BGMの初期化と再生管理
  useEffect(() => {
    const bgm = new Audio('/sounds/start-bgm.mp3');
    bgm.loop = true;
    bgm.volume = 0.4;
    bgmRef.current = bgm;

    const playBGM = () => {
      bgm.play().catch(() => {});
      window.removeEventListener('click', playBGM);
    };

    window.addEventListener('click', playBGM);
    playBGM();

    return () => {
      bgm.pause();
      window.removeEventListener('click', playBGM);
    };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Partial<Record<QuestionKey, AnswerOption>>
  >({});
  const [status, setStatus] = useState<Status>('answering');

  const currentQuestion = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length;

  const submitToApi = useCallback(
    async (finalAnswers: BaselineAnswers) => {
      setStatus('loading');

      try {
        const result = await postRegister({
          mbti,
          baseline_answers: finalAnswers,
        });

        localStorage.setItem('user_id', result.user_id);

        if (game1Data) {
          await submitGame({
            user_id: result.user_id,
            game_type: 1,
            data: game1Data as unknown as Record<string, unknown>,
          });
        }

        setStatus('success');

        setTimeout(() => {
          router.push('/games/helpdesk');
        }, 2000);
      } catch {
        setStatus('error');
      }
    },
    [mbti, router, game1Data]
  );

  const handleAnswer = (value: AnswerOption) => {
    const newAnswers = { ...answers, [currentQuestion.key]: value };
    setAnswers(newAnswers);
    playSE('/sounds/general-button-se.mp3');

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitToApi(newAnswers as BaselineAnswers);
    }
  };

  const handleRetry = () => {
    playSE('/sounds/general-button-se.mp3');
    submitToApi(answers as BaselineAnswers);
  };

  if (status === 'loading') {
    return <LoadingScreen message="送信中..." />;
  }

  if (status === 'error') {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <p className="text-lg font-semibold text-red-600">通信に失敗しました</p>
        <button
          onClick={handleRetry}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          リトライ
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return <LoadingScreen message="ゲームに移動中..." />;
  }

  return (
    <div className="relative w-full max-w-2xl">
      {/* ヘッダー: タイトル + プログレスバー */}
      <div className="mb-0 flex items-start justify-between gap-4">
        {/* タイトルエリア - メインカードに少し重なる */}
        <div className="relative z-10 flex flex-col">
          <div className="rounded-2xl border-4 border-gray-800 bg-white px-6 py-3 shadow-md">
            <h1 className="text-xl font-bold text-gray-900">質問コーナー</h1>
          </div>
        </div>

        {/* プログレスバー: 5セグメント */}
        <div className="flex shrink-0 gap-0.5 rounded-xl border-4 border-gray-800 bg-gray-100 p-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`h-6 w-8 rounded-lg transition-colors ${
                i <= currentIndex ? 'bg-rose-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* メインカード: 質問 + 4択 - タイトルと重なる */}
      <div className="relative -mt-4 rounded-3xl border-4 border-gray-800 bg-white p-6 shadow-lg">
        <p className="mb-6 text-xl font-bold text-gray-900">
          Q{currentIndex + 1}. {currentQuestion.label}
        </p>

        {/* 2x2グリッドの選択肢 */}
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleAnswer(option.value)}
              className="rounded-2xl border-4 border-gray-800 bg-gray-100 px-6 py-4 text-center font-bold text-gray-900 transition hover:bg-rose-50 hover:border-rose-300"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
