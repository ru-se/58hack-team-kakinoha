'use client';

import { useEffect, useState } from 'react';

type AnalyzingViewProps =
  | { status: 'loading' }
  | { status: 'error'; errorMessage: string; onRetry: () => void };

export default function AnalyzingView(props: AnalyzingViewProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (props.status !== 'loading') return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + 5));
    }, 100);
    return () => clearInterval(interval);
  }, [props.status]);

  if (props.status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 p-4">
        <p className="text-center text-lg text-gray-800">通信に失敗しました</p>
        <p className="text-center text-sm text-red-500">{props.errorMessage}</p>
        <button
          type="button"
          onClick={props.onRetry}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          もう一度取得
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 p-4">
      <p className="text-lg font-medium text-gray-800">分析中...</p>
      <div className="w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-2 bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
