'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { MOCK_PROBLEMS, ProblemStatus } from '../data/mockProblems';

type FilterType = 'all' | 'unanswered' | 'not-perfect' | 'date';

export default function ProblemListFlow() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterDate, setFilterDate] = useState<string>('2026-02-28'); // Default to today
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  // オペレーターのセリフ
  const operatorMessage = selectedProblemId
    ? '何言ってるかわからないので\nこちらで勝手に用意します'
    : 'どの問題を解きますか？';

  const filteredProblems = useMemo(() => {
    return MOCK_PROBLEMS.filter((problem) => {
      if (filterType === 'all') return true;
      if (filterType === 'unanswered') return problem.status === 'unanswered';
      if (filterType === 'not-perfect') return problem.status !== 'perfect';
      if (filterType === 'date') return problem.date === filterDate;
      return true;
    });
  }, [filterType, filterDate]);

  const handleSelectProblem = (id: string) => {
    if (selectedProblemId) return; // 既に選択済みなら何もしない
    
    // SEがあればここで鳴らす
    const audio = new Audio('/sounds/general-button-se.mp3');
    audio.play().catch(() => {});

    setSelectedProblemId(id);

    // 2秒後にクイズページへ遷移
    setTimeout(() => {
      router.push('/quiz');
    }, 2500);
  };

  const getStatusLabel = (status: ProblemStatus) => {
    switch (status) {
      case 'unanswered':
        return { text: '未回答', className: 'bg-[#e17a78] text-white' };
      case 'answered':
        return { text: '回答済', className: 'bg-[#F0D44A] text-black' };
      case 'perfect':
        return { text: '満点', className: 'bg-[#57d071] text-black' };
    }
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
                <option value="date">日付指定</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
          
          {filterType === 'date' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-bold">日付:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-1 rounded border-2 border-black p-1 text-sm font-bold bg-white"
              />
            </div>
          )}
        </div>

        {/* リスト部分 */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50 pb-8">
          {filteredProblems.length === 0 ? (
            <div className="flex flex-col gap-2 items-center justify-center h-full text-gray-500">
              <span className="text-4xl text-black">🤔</span>
              <p className="font-bold text-black">見つかりません</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProblems.map((problem) => {
                const statusInfo = getStatusLabel(problem.status);
                const isSelected = selectedProblemId === problem.id;
                const isOtherSelected = selectedProblemId && selectedProblemId !== problem.id;

                return (
                  <button
                    key={problem.id}
                    onClick={() => handleSelectProblem(problem.id)}
                    disabled={!!selectedProblemId}
                    className={`flex flex-col w-full text-left bg-white border-[3px] border-black rounded-xl p-3 transition-all ${
                      isSelected ? 'bg-[#e9eb7c] ring-4 ring-[#e9eb7c] ring-offset-2' : ''
                    } ${isOtherSelected ? 'opacity-40 grayscale' : ''} ${
                      !selectedProblemId ? 'shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_0_#000]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="font-bold text-sm leading-tight text-black line-clamp-2">
                        {problem.title}
                      </span>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-black ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {problem.date}
                      </span>
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
