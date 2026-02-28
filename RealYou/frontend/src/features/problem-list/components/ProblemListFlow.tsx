'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { MOCK_PROBLEMS, ProblemStatus } from '../data/mockProblems';
import { getQuizList, ApiQuiz } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

type FilterType = 'all' | 'unanswered' | 'not-perfect' | 'week';

const GENRE_ICONS: Record<string, string> = {
  web: '🌐',
  ai: '🤖',
  security: '🔒',
  infrastructure: '⚙️',
  design: '🎨',
  game: '🎮',
};

const getWeekString = (dateString: string) => {
  // ISO-8601 (Monday start) Week Calculation
  const date = new Date(dateString);
  const day = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  date.setDate(date.getDate() - day + 3); // Nearest Thursday
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
  const weekNumber = Math.round(((date.getTime() - firstThursday.getTime()) / 86400000) / 7) + 1;
  const weekStr = weekNumber.toString().padStart(2, '0');
  return `${date.getFullYear()}-W${weekStr}`;
};

export default function ProblemListFlow() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterWeek, setFilterWeek] = useState<string>('2026-W09'); // Default to current week
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: 本番では localStorage の user_id のみ使用。DEV_USER_IDは削除すること
  const DEV_USER_ID = '46f441c6-cc35-4bd3-ab49-953f5a287c83';

  const fetchQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('user_id') ?? DEV_USER_ID;
      const data = await getQuizList(userId);
      setQuizzes(data.quizzes);
    } catch (err: any) {
      setError(err.message || 'クイズの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // オペレーターのセリフ
  const operatorMessage = selectedProblemId
    ? '何言ってるかわからないので\nこちらで勝手に用意します'
    : 'どの問題を解きますか？';

  const filteredProblems = useMemo(() => {
    return quizzes.filter((quiz) => {
      if (filterType === 'all') return true;
      if (filterType === 'unanswered' || filterType === 'not-perfect') {
        return !quiz.answered;
      }
      if (filterType === 'week') return getWeekString(quiz.created_at) === filterWeek;
      return true;
    });
  }, [quizzes, filterType, filterWeek]);

  const handleSelectProblem = (id: string) => {
    if (selectedProblemId) return; // 既に選択済みなら何もしない

    const audio = new Audio('/sounds/general-button-se.mp3');
    audio.play().catch(() => { });

    setSelectedProblemId(id);

    setTimeout(() => {
      router.push('/quiz');
    }, 2500);
  };

  return (
    <div
      className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#99c2ff] bg-cover bg-center items-center justify-center p-4"
      style={{ backgroundImage: "url('/images/game2_backcground.png')" }}
    >
      {/* スマホUIフレーム (中央配置) */}
      <div
        className="relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-[24px] border-[6px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] mb-32"
        style={{ height: 'min(75vh, 600px)' }}
      >
        {/* スマホ内ヘッダー */}
        <header className="flex items-center justify-center border-b-[4px] border-black bg-[#2d5be3] px-4 py-3 text-white">
          <h1 className="text-lg font-black tracking-widest">📋 問題リスト</h1>
        </header>

        {/* フィルターセクション */}
        <div className="flex flex-col gap-2 p-3 border-b-[4px] border-black bg-[#f0f0f0]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black text-black whitespace-nowrap">
              表示絞り込み:
            </span>
            <div className="relative w-full">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full appearance-none rounded-xl border-[3px] border-black bg-white px-3 py-2 pr-8 text-sm font-bold text-black shadow-[3px_3px_0_0_#000] focus:outline-none focus:ring-0 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all"
              >
                <option value="all">デフォルト</option>
                <option value="unanswered">未回答</option>
                <option value="not-perfect">満点以外</option>
                <option value="week">週指定</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {filterType === 'week' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-bold">週:</span>
              <input
                type="week"
                value={filterWeek}
                onChange={(e) => setFilterWeek(e.target.value)}
                className="flex-1 rounded border-2 border-black p-1 text-sm font-bold bg-white leading-none"
              />
            </div>
          )}
        </div>

        {/* リスト部分 */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50 pb-8">
          {isLoading ? (
            <div className="flex flex-col gap-4 items-center justify-center h-full text-black">
              <Spinner />
              <p className="font-bold">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-4 items-center justify-center h-full">
              <span className="text-4xl text-black">⚠️</span>
              <p className="font-bold text-black text-center">{error}</p>
              <button
                onClick={fetchQuizzes}
                className="rounded-xl border-[3px] border-black bg-[#e17a78] px-4 py-2 font-black tracking-widest text-white shadow-[4px_4px_0_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_0_#000]"
              >
                もう一度試す
              </button>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="flex flex-col gap-2 items-center justify-center h-full text-gray-500">
              <span className="text-4xl text-black">🤔</span>
              <p className="font-bold text-black">見つかりません</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProblems.map((quiz) => {
                const isSelected = selectedProblemId === quiz.quiz_id;
                const isOtherSelected = selectedProblemId && selectedProblemId !== quiz.quiz_id;
                const dateString = new Date(quiz.created_at).toLocaleDateString('ja-JP');

                return (
                  <button
                    key={quiz.quiz_id}
                    onClick={() => handleSelectProblem(quiz.quiz_id)}
                    disabled={!!selectedProblemId}
                    className={`flex flex-col w-full text-left bg-white border-[3px] border-black rounded-xl p-3 transition-all ${isSelected ? 'bg-[#e9eb7c] ring-4 ring-[#e9eb7c] ring-offset-2' : ''
                      } ${isOtherSelected ? 'opacity-40 grayscale' : ''} ${!selectedProblemId ? 'shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_0_#000]' : ''
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="font-bold text-sm leading-tight text-black line-clamp-2">
                        {quiz.title}
                      </span>
                    </div>
                    <div className="flex justify-between items-end w-full mt-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        {Object.keys(quiz.genres).map((genreKey) => (
                          <span key={genreKey} className="text-sm font-black text-black flex items-center gap-1">
                            {GENRE_ICONS[genreKey] || '❔'}
                            {genreKey === 'web' ? 'Web' : genreKey === 'ai' ? 'AI' : genreKey === 'security' ? 'Security' : genreKey === 'infrastructure' ? 'Infra' : genreKey === 'design' ? 'Design' : 'Game'}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {quiz.answered && (
                          <div className="flex items-center justify-center w-6 h-6 rounded bg-[#00c800] border-2 border-black rotate-[-5deg]">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <span className="text-sm font-black text-[#5a6270]">
                          {dateString}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- 画面下部の会話エリア (コールセンターのオペレーター) --- */}
      <div className="absolute bottom-8 left-0 right-0 px-4 z-50">
        <div className="mx-auto max-w-2xl flex flex-col gap-6">
          <div className="relative rounded-[24px] border-[6px] border-black bg-[#d9d9d9] px-6 py-6 shadow-[8px_8px_0_0_#000] animate-[fadeInUp_0.3s_ease-out]">
            <div className="absolute -top-7 right-8 rounded-t-xl border-x-[6px] border-t-[6px] border-black bg-[#d9d9d9] px-6 py-1 text-lg font-black tracking-widest text-[#e17a78]">
              サポートデスク
            </div>

            <p className="text-xl font-bold leading-relaxed text-black whitespace-pre-line text-center">
              {operatorMessage}
            </p>

            {/* 吹き出しの尻尾 */}
            <div className="absolute -top-6 right-20 w-8 h-8 bg-[#d9d9d9] border-l-[6px] border-t-[6px] border-black transform rotate-45 z-[-1]"></div>
          </div>
        </div>
      </div>

      {/* フルスクリーンオーバーレイ (画面遷移用) */}
      {selectedProblemId && (
        <div className="absolute inset-0 z-[60] pointer-events-none bg-black/0 animate-[fadeIn_0.5s_ease-out_1.5s_forwards]"></div>
      )}
    </div>
  );
}
