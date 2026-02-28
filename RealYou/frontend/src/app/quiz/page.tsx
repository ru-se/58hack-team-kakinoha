'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { selectedQuizIdAtom, quizSubmitResultAtom } from '@/store/quizAtoms';
import { getQuizQuestions, ApiQuestion, submitQuizAnswers } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import {
  UNDERSTANDING_INTRO,
  UNDERSTANDING_QUESTION,
  UNDERSTANDING_OPTIONS,
  REVIEW_INTRO,
} from '@/features/quiz/data/quizContent';

type Phase =
  | 'understanding-intro'
  | 'understanding'
  | 'review-intro'
  | 'review'
  | 'completed'
  | 'submit-error';

export default function QuizPage() {
  const router = useRouter();
  const quizId = useAtomValue(selectedQuizIdAtom);

  const [phase, setPhase] = useState<Phase>('understanding-intro');
  const [understandingValue, setUnderstandingValue] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const [answers, setAnswers] = useState<{ question_id: string; selected_index: number }[]>([]);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);
  const setQuizSubmitResult = useSetAtom(quizSubmitResultAtom);

  useEffect(() => {
    if (quizId === null) {
      router.replace('/problems');
      return;
    }

    fetchQuestions(quizId);
  }, [quizId, router]);

  const fetchQuestions = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getQuizQuestions(id);
      const sorted = [...data.questions].sort((a, b) => a.order_num - b.order_num);
      setQuestions(sorted);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '問題の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (quizId) fetchQuestions(quizId);
  };

  const currentReviewQ = questions[reviewIndex];
  const isCorrect = selectedAnswer === currentReviewQ?.correct_index;

  const handleSelectAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    setAnswers((prev) => [...prev, { question_id: currentReviewQ.id, selected_index: idx }]);
  };

  const DEV_USER_ID = '46f441c6-cc35-4bd3-ab49-953f5a287c83';

  const handleSubmit = async () => {
    setPhase('completed');
    try {
      const userId = localStorage.getItem('user_id') ?? DEV_USER_ID;
      const result = await submitQuizAnswers(quizId!, {
        user_id: userId,
        self_evaluation_level: understandingValue ?? 3,
        answers,
      });
      setQuizSubmitResult(result);
      router.push('/result');
    } catch (err: unknown) {
      setPhase('submit-error');
      setSubmitErrorMsg(err instanceof Error ? err.message : '送信に失敗しました');
    }
  };

  const handleNextReview = () => {
    if (reviewIndex + 1 >= questions.length) {
      handleSubmit();
    } else {
      setReviewIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  if (quizId === null) {
    return null; // Redirecting
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden p-4"
      style={{ backgroundColor: '#F0D44A', height: '100dvh' }}
    >
      {/* 背景ドット */}
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.8) 1.0px, transparent 4px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* スマホフレーム */}
      <div
        className="relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-[24px] border-[6px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]"
        style={{ height: 'min(90vh, 700px)' }}
      >
        {/* ヘッダー */}
        <header className="flex items-center justify-between border-b-[6px] border-black bg-[#2d5be3] px-4 py-3 text-white">
          <h1 className="text-lg font-black tracking-widest">
            {phase === 'understanding-intro' || phase === 'understanding'
              ? '🧠 理解度チェック'
              : phase === 'review-intro' || phase === 'review'
                ? '📖 復習タイム'
                : '✅ 完了'}
          </h1>
          {(phase === 'review' && questions.length > 0) && (
            <span className="text-sm font-black text-white/80">
              {reviewIndex + 1} / {questions.length}
            </span>
          )}
        </header>

        {/* コンテンツエリア */}
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">

          {/* ─── ロード中・エラー ─── */}
          {isLoading ? (
            <div className="flex flex-col gap-4 items-center justify-center h-full text-black">
              <Spinner />
              <p className="font-bold">問題を取得中...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-4 items-center justify-center h-full w-full">
              <span className="text-4xl">⚠️</span>
              <p className="font-bold text-center text-black mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="w-full py-4 bg-[#e17a78] border-[4px] border-black rounded-2xl text-base font-black text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 active:scale-95"
              >
                もう一度試す
              </button>
              <button
                onClick={() => router.push('/problems')}
                className="w-full py-4 bg-white border-[4px] border-black rounded-2xl text-base font-black text-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 active:scale-95"
              >
                問題一覧に戻る
              </button>
            </div>
          ) : (
            <>
              {/* ─── フェーズ1: 理解度 説明 ─── */}
              {phase === 'understanding-intro' && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <span className="text-6xl">{UNDERSTANDING_INTRO.emoji}</span>
                  <div className="bg-[#e9eb7c] border-[4px] border-black rounded-2xl px-6 py-2 shadow-[4px_4px_0_0_#000]">
                    <p className="text-xl font-black">{UNDERSTANDING_INTRO.title}</p>
                  </div>
                  <p className="whitespace-pre-line text-base font-bold leading-relaxed text-black/80">
                    {UNDERSTANDING_INTRO.body}
                  </p>
                  <button
                    onClick={() => setPhase('understanding')}
                    className="mt-2 w-full py-4 bg-[#2d5be3] border-[4px] border-black rounded-2xl text-lg font-black text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:scale-95"
                  >
                    {UNDERSTANDING_INTRO.buttonLabel} →
                  </button>
                </div>
              )}

              {/* ─── フェーズ2: 理解度 回答 ─── */}
              {phase === 'understanding' && (
                <div className="flex flex-col items-center gap-5 w-full">
                  <p className="whitespace-pre-line text-center text-lg font-black leading-relaxed text-black">
                    {UNDERSTANDING_QUESTION}
                  </p>
                  <div className="flex flex-col gap-3 w-full mt-2">
                    {UNDERSTANDING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setUnderstandingValue(opt.value);
                          setTimeout(() => setPhase('review-intro'), 600);
                        }}
                        className={`flex items-center gap-4 w-full px-5 py-4 border-[4px] border-black rounded-2xl text-left font-bold transition-all
                          ${understandingValue === opt.value
                            ? 'bg-[#57d071] shadow-[2px_2px_0_0_#000] translate-y-1'
                            : 'bg-white shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]'
                          }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-sm text-black">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── フェーズ3: 復習 説明 ─── */}
              {phase === 'review-intro' && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <span className="text-6xl">{REVIEW_INTRO.emoji}</span>
                  <div className="bg-[#e9eb7c] border-[4px] border-black rounded-2xl px-6 py-2 shadow-[4px_4px_0_0_#000]">
                    <p className="text-xl font-black">{REVIEW_INTRO.title}</p>
                  </div>
                  <p className="whitespace-pre-line text-base font-bold leading-relaxed text-black/80">
                    {REVIEW_INTRO.body}
                  </p>
                  <button
                    onClick={() => setPhase('review')}
                    className="mt-2 w-full py-4 bg-[#e17a78] border-[4px] border-black rounded-2xl text-lg font-black text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:scale-95"
                  >
                    {REVIEW_INTRO.buttonLabel} →
                  </button>
                </div>
              )}

              {/* ─── フェーズ4: 復習 問題 ─── */}
              {phase === 'review' && currentReviewQ && (
                <div className="flex flex-col gap-5 w-full">
                  {/* 問題文 */}
                  <div className="bg-[#f5f5f5] border-[4px] border-black rounded-2xl p-5 shadow-[4px_4px_0_0_#000]">
                    <p className="text-xs font-black text-gray-400 mb-2 tracking-widest">
                      問題 {reviewIndex + 1}
                    </p>
                    <p className="whitespace-pre-line text-base font-black leading-relaxed text-black">
                      {currentReviewQ.question_text}
                    </p>
                  </div>

                  {/* 選択肢 */}
                  <div className="flex flex-col gap-3">
                    {currentReviewQ.options.map((opt, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isRight = idx === currentReviewQ.correct_index;
                      let bg = 'bg-white';
                      if (isAnswered) {
                        if (isRight) bg = 'bg-[#57d071]';
                        else if (isSelected && !isRight) bg = 'bg-[#e17a78]';
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(idx)}
                          disabled={isAnswered}
                          className={`flex items-center gap-3 w-full px-4 py-3.5 border-[3px] border-black rounded-xl text-left text-sm font-bold transition-all
                            ${bg}
                            ${!isAnswered ? 'shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000]' : 'shadow-[2px_2px_0_0_#000]'}
                          `}
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full border-[2px] border-black flex items-center justify-center text-xs font-black bg-[#F0D44A]">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-black">{opt}</span>
                          {isAnswered && isRight && (
                            <span className="ml-auto text-lg">✅</span>
                          )}
                          {isAnswered && isSelected && !isRight && (
                            <span className="ml-auto text-lg">❌</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* 解説 + 次へボタン */}
                  {isAnswered && (
                    <div className="flex flex-col gap-3 animate-[fadeInUp_0.3s_ease-out]">
                      <div className={`border-[3px] border-black rounded-xl p-4 text-sm font-bold leading-relaxed whitespace-pre-line
                        ${isCorrect ? 'bg-[#57d071]/20 text-black' : 'bg-[#e17a78]/20 text-black'}`}
                      >
                        <p>
                          {isCorrect
                            ? '✅ 正解！'
                            : `❌ 不正解...\n正解は「${currentReviewQ.options[currentReviewQ.correct_index]}」です。`
                          }
                        </p>
                        {currentReviewQ.explanation && (
                          <p className="mt-2 text-xs opacity-80">{currentReviewQ.explanation}</p>
                        )}
                      </div>
                      <button
                        onClick={handleNextReview}
                        className="w-full py-4 bg-[#2d5be3] border-[4px] border-black rounded-2xl text-base font-black text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 active:scale-95"
                      >
                        {reviewIndex + 1 >= questions.length ? '結果を見る 🎉' : '次の問題へ →'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ─── 完了 ─── */}
              {phase === 'completed' && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <Spinner />
                  <p className="text-xl font-black text-black">採点中...</p>
                </div>
              )}

              {/* ─── 送信エラー ─── */}
              {phase === 'submit-error' && (
                <div className="flex flex-col gap-4 items-center justify-center h-full w-full">
                  <span className="text-4xl">⚠️</span>
                  <p className="font-bold text-center text-black mb-4">{submitErrorMsg}</p>
                  <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-[#e17a78] border-[4px] border-black rounded-2xl text-base font-black text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 active:scale-95"
                  >
                    もう一度送信する
                  </button>
                  <button
                    onClick={() => router.push('/problems')}
                    className="w-full py-4 bg-white border-[4px] border-black rounded-2xl text-base font-black text-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 active:scale-95"
                  >
                    問題一覧に戻る
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
