'use client';

type FeatureScoreBarProps = {
  name: string;
  score: number;
  max?: number;
  className?: string;
};

const COLOR_MAP: Record<string, string> = {
  積極性: 'bg-orange-500',
  冷静さ: 'bg-yellow-400',
  論理性: 'bg-blue-500',
  慎重さ: 'bg-red-500',
  協調性: 'bg-green-500',

  positivity: 'bg-orange-500',
  calmness: 'bg-yellow-400',
  logic: 'bg-blue-500',
  caution: 'bg-red-500',
  cooperativeness: 'bg-green-500',
};

export default function FeatureScoreBar({
  name,
  score,
  max = 100,
  className = '',
}: FeatureScoreBarProps) {
  const percent = Math.min(100, Math.max(0, (score / max) * 100));

  const barColor = COLOR_MAP[name] || 'bg-gray-400';

  return (
    <div className={`${className} border-2 border-black`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-black text-black">{name}</span>
        <span className="text-sm font-black text-black">{score}</span>
      </div>

      <div className="h-5 w-full overflow-hidden rounded-full border-2 border-black bg-gray-200 relative">
        <div
          className={`h-full rounded-r-full ${barColor} transition-all duration-1000 ease-out border-r-2 border-black`}
          style={{ width: `${percent}%` }}
        />

        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,white_5px,white_10px)]" />
      </div>
    </div>
  );
}
