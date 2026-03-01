'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LucideIcon,
  Activity,
  ShieldAlert,
  Zap,
  Users,
  Star,
  RefreshCw,
} from 'lucide-react';
import type { ResultResponse } from '../types';
import GameDetailTab from './GameDetailTab';
import OverviewTab from './OverviewTab';
import SharePanel from './SharePanel';

type TabId = 'overview' | 'game_1' | 'game_2' | 'game_3';

const SOUNDS = {
  BGM: '/realyou/sounds/result-bgm.mp3',
  TAB_CLICK: '/realyou/sounds/general-button-se.mp3',
  RETAKE: '/realyou/sounds/start-se.mp3',
};

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: '総合診断', icon: Activity },
  { id: 'game_1', label: '規約の罠', icon: ShieldAlert },
  { id: 'game_2', label: 'AIバトル', icon: Zap },
  { id: 'game_3', label: '空気読み', icon: Users },
];

const GAME_TAB_COLORS: Record<string, string> = {
  game_1: '#ef4444',
  game_2: '#f97316',
  game_3: '#3b82f6',
};

type ResultReportProps = {
  data: ResultResponse;
};

export default function ResultReport({ data }: ResultReportProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // SE再生用ヘルパー
  const playSE = (path: string) => {
    const audio = new Audio(path);
    audio.volume = 0.5;
    audio.play().catch((e) => console.warn('SE playback failed:', e));
  };

  // BGMの開始・停止管理
  useEffect(() => {
    const bgm = new Audio(SOUNDS.BGM);
    bgm.loop = true;
    bgm.volume = 0.3;
    bgmRef.current = bgm;

    // ユーザーがブラウザで何かしら操作した後に再生されるようにする
    const startBGM = () => {
      bgm.play().catch(() => {
        /* 自動再生制限用 */
      });
      window.removeEventListener('click', startBGM);
    };

    window.addEventListener('click', startBGM);
    startBGM(); // すでに操作済みなら即再生

    return () => {
      bgm.pause();
      bgmRef.current = null;
    };
  }, []);

  const handleTabChange = (tabId: TabId) => {
    // 1. SEをロードして再生
    const se = new Audio('/realyou/sounds/general-button-se.mp3');
    se.volume = 0.5;
    se.play().catch(() => {
      /* 自動再生制限などで失敗してもエラーを出さない */
    });

    // 2. タブを切り替える
    setActiveTab(tabId);
  };

  const handleRetake = useCallback(() => {
    playSE(SOUNDS.RETAKE);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_id');
      }
      router.push('/');
    }, 500);
  }, [router]);

  return (
    <div
      //背景にトップ画面と同じパターンを利用
      className="relative h-screen w-full overflow-hidden font-sans text-gray-800 flex flex-col items-center justify-center p-2 sm:p-4"
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 4px),
          url('/realyou/images/bg-pattern.svg')
        `,
        backgroundSize: '16px 16px, cover',
        backgroundPosition: '0 0, center',
        backgroundRepeat: 'repeat, no-repeat',
      }}
    >
      <header className="relative z-10 mb-8 text-center">
        <div className="inline-block bg-white border-4 border-black px-8 py-3 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <h1 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            行動解析REPORT
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </h1>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-7xl flex flex-col max-h-[80vh]">
        <nav className="flex px-2 lg:px-10 items-end h-10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-1 py-3 px-1 mx-1 rounded-t-2xl font-black text-xs sm:text-base transition-all transform duration-200 border-x-4 border-t-4 border-black
                  ${
                    isActive
                      ? 'bg-white text-black translate-y-0 z-10'
                      : 'bg-gray-100 text-gray-500 translate-y-2 hover:translate-y-1'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="flex-1 bg-white border-4 border-black rounded-3xl rounded-tr-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-8 min-h-125">
          {activeTab === 'overview' && <OverviewTab data={data} />}
          {activeTab === 'game_1' && (
            <GameDetailTab
              detail={data.details.game_1}
              comment={data.phase_summaries.phase_1}
              tabColor={GAME_TAB_COLORS.game_1}
            />
          )}
          {activeTab === 'game_2' && (
            <GameDetailTab
              detail={data.details.game_2}
              comment={data.phase_summaries.phase_2}
              tabColor={GAME_TAB_COLORS.game_2}
            />
          )}
          {activeTab === 'game_3' && (
            <GameDetailTab
              detail={data.details.game_3}
              comment={data.phase_summaries.phase_3}
              tabColor={GAME_TAB_COLORS.game_3}
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={handleRetake}
            className="flex items-center justify-center h-12 min-w-[160px] px-6 bg-white border-4 border-black text-black rounded-full font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all text-sm sm:text-base"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            もう一度診断
          </button>

          <SharePanel title={data.feedback.title} />
        </div>
      </main>
    </div>
  );
}
