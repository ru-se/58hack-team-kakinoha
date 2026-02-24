'use client';

import type { ResultResponse } from '../types';
import RadarChart from './RadarChart';

type OverviewTabProps = {
  data: ResultResponse;
};

// ギャップ率の計算（元コードのロジックを継承）
function getGapRateDisplay(data: ResultResponse): string {
  const { gaps } = data;
  const maxAbsGap = Math.max(
    Math.abs(gaps.caution),
    Math.abs(gaps.calmness),
    Math.abs(gaps.logic),
    Math.abs(gaps.cooperativeness),
    Math.abs(gaps.positivity)
  );
  return `${Math.min(100, Math.round(maxAbsGap))}%`;
}

// キーワード強調用の小コンポーネント
const Highlight = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <span
    className={`${color} px-2 py-0.5 rounded-md font-black mx-1 inline-block shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
  >
    {children}
  </span>
);

export default function OverviewTab({ data }: OverviewTabProps) {
  const gapRate = getGapRateDisplay(data);
  const { feedback } = data;

  return (
    <div className="grid gap-8 md:grid-cols-2 items-center h-full max-h-full">
      {/* 左側：レーダーチャートのカード */}
      {/* 修正ポイント：aspect-square と overflow-hidden で「飛び出し」を防止 */}
      <div className="relative bg-white border-4 border-black rounded-[2.5rem] p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden h-full min-h-[350px]">
        <div className="w-full h-full aspect-square max-h-[380px] relative">
          <RadarChart
            baselineScores={data.baseline_scores}
            measuredScores={data.scores}
          />
        </div>
      </div>

      {/* 右側：フィードバックのカード */}
      <div className="relative h-full">
        {/* CHECK THIS OUT! ステッカー */}
        <div className="absolute -top-5 -left-4 z-20 bg-[#e63946] text-white font-black px-5 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-3 text-sm lg:text-base">
          CHECK THIS OUT!
        </div>

        {/* 黄色のカード本体 */}
        <div className="bg-[#fffbeb] border-4 border-black rounded-[2.5rem] p-8 lg:p-10 shadow-[10px_10px_0px_0px_rgba(13,148,136,1)] h-full flex flex-col justify-center relative z-10 min-h-[350px]">
          <h2 className="text-2xl lg:text-3xl font-black text-black mb-6 leading-tight">
            <span className="text-[#8b5cf6] block text-xl lg:text-2xl mb-1">
              理性と本能のギャップ:
            </span>
            <span className="text-6xl lg:text-7xl">{gapRate}</span>
          </h2>

          <div className="text-base lg:text-lg font-bold leading-relaxed text-gray-800 space-y-4">
            <p>
              あなたは
              <Highlight color="bg-blue-100 text-blue-700">
                『{feedback.gap_point}』
              </Highlight>
              を自認していますが、実際の行動は
              <Highlight color="bg-pink-100 text-pink-700">直感</Highlight>
              にドーンと振れています！
            </p>

            <p className="whitespace-pre-line">{feedback.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
