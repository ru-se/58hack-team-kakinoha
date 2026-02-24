'use client';

import { Users } from 'lucide-react';
import type { GameDetail } from '../types';
import FeatureScoreBar from './FeatureScoreBar';
import MetricsBarChart from './MetricsBarChart';

type GameDetailTabProps = {
  detail: GameDetail;
  comment: string;
  tabColor?: string;
};

export default function GameDetailTab({
  detail,
  comment,
  tabColor = '#3b82f6',
}: GameDetailTabProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full animate-in slide-in-from-right duration-500">
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <section className="bg-blue-50 border-2 border-blue-100 p-3 rounded-[1.5rem] shadow-sm">
          <h3 className="mb-2 text-[10px] font-black text-blue-600 flex items-center gap-1 opacity-70">
            <Users className="w-3 h-3" />
            計測された特徴
          </h3>
          {/* space-y-3 -> space-y-1.5 にしてバーの間隔を詰めました */}
          <div className="space-y-1.5">
            {detail.feature_scores.map((fs) => (
              <FeatureScoreBar
                key={fs.axis}
                name={fs.name}
                score={fs.score}
                // よりコンパクトなスタイルへ
                className="bg-white/40 px-2 py-1 rounded-md border border-blue-50/50"
              />
            ))}
          </div>
        </section>

        <section className="relative bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto custom-scrollbar p-5">
            <h3 className="mb-2 text-lg font-black text-black sticky top-0 bg-white py-1 z-10 border-b-2 border-dashed border-gray-100">
              解析コメント
            </h3>
            <div className="text-base font-bold leading-relaxed text-gray-800">
              <p className="whitespace-pre-wrap">
                {comment
                  .split(/(\d+\.?\d*秒|\d+回ホバー|\d+回反論)/)
                  .map((part, i) =>
                    /(\d+\.?\d*秒|\d+回ホバー|\d+回反論)/.test(part) ? (
                      // ハイライトの色をタブの色に合わせて動的に変更
                      <span
                        key={i}
                        style={{ backgroundColor: `${tabColor}40` }}
                        className="px-1 rounded-sm mx-0.5"
                      >
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="w-full md:w-2/3 flex flex-col pt-2">
        <h3 className="text-center font-black text-xl text-gray-400 mb-6 tracking-widest uppercase">
          行動ログ詳細データ
        </h3>

        <div className="flex-1 min-h-87.5">
          <MetricsBarChart
            metrics={detail.metrics}
            userBarColor={tabColor}
            averageBarColor="#d1d5db"
          />
        </div>

        {/* 凡例 */}
        <div className="mt-6 flex justify-center gap-10 font-black text-sm">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-4 rounded-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              style={{ backgroundColor: tabColor }}
            />
            <span style={{ color: tabColor }}>あなた</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-4 rounded-sm bg-gray-300" />
            <span className="text-gray-400">平均</span>
          </div>
        </div>
      </section>
    </div>
  );
}
