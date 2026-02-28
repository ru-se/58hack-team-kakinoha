'use client';

import { useRouter } from 'next/navigation';
import type { QuizSubmitResponse } from '@/lib/api';

interface Props {
    data: QuizSubmitResponse;
}

export default function QuizResultReport({ data }: Props) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F0D44A] p-4 font-sans text-black relative overflow-hidden flex flex-col items-center py-12">
            {/* 背景ドットパターン */}
            <div
                className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, rgba(255,255,255,0.8) 1.0px, transparent 4px)',
                    backgroundSize: '16px 16px',
                }}
            />

            <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
                {/* ヘッダータイトル */}
                <div className="bg-[#2d5be3] border-[6px] border-black rounded-2xl p-4 shadow-[6px_6px_0_0_#000] text-center">
                    <h1 className="text-2xl font-black text-white tracking-wider">
                        🎉 クイズ結果 🎉
                    </h1>
                </div>

                {/* スコア表示エリア */}
                <div className="bg-white border-[6px] border-black rounded-2xl p-6 shadow-[8px_8px_0_0_#000] flex flex-col items-center gap-4">
                    <p className="text-lg font-bold">あなたの正答率</p>
                    <div className="text-6xl font-black text-[#e17a78] [text-shadow:4px_4px_0_#000] mb-2 tracking-tighter">
                        {data.actual_score}<span className="text-4xl ml-1">%</span>
                    </div>

                    <div className="w-full h-[4px] bg-black my-2" />

                    <p className="text-base font-bold">自己評価とのギャップ</p>
                    <div className="text-4xl font-black text-[#57d071] [text-shadow:3px_3px_0_#000] tracking-tighter">
                        {data.gap > 0 ? '+' : ''}{data.gap}
                    </div>
                </div>

                {/* フィードバック */}
                <div className="bg-[#e9eb7c] border-[6px] border-black rounded-2xl p-6 shadow-[6px_6px_0_0_#000]">
                    <h2 className="text-xl font-black mb-3 border-b-4 border-black pb-2">
                        💡 フィードバック
                    </h2>
                    <p className="text-base font-bold whitespace-pre-line leading-relaxed">
                        {data.feedback_message}
                    </p>
                </div>

                {/* 次へ進むアクション */}
                <button
                    onClick={() => router.push('/problems')}
                    className="mt-4 w-full py-5 bg-white border-[6px] border-black rounded-2xl text-xl font-black text-black shadow-[6px_6px_0_0_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] active:scale-95"
                >
                    問題一覧に戻る →
                </button>
            </div>
        </div>
    );
}
