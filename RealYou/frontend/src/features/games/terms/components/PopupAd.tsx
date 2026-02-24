'use client';

import { useRef, useCallback, useEffect } from 'react';

interface PopupAdProps {
  onClose: (
    clickCount: number,
    timeToClose: number,
    mouseJitter: number
  ) => void;
  appearedAt: number;
}

export default function PopupAd({ onClose, appearedAt }: PopupAdProps) {
  const clickCountRef = useRef(0);
  // mouseJitter 計測用: 総移動距離と始点・終点の座標を記録
  const totalDistanceRef = useRef(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const firstPosRef = useRef<{ x: number; y: number } | null>(null);
  const currentPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const pos = { x: e.clientX, y: e.clientY };

      if (!firstPosRef.current) {
        firstPosRef.current = pos;
      }

      if (lastPosRef.current) {
        const dx = pos.x - lastPosRef.current.x;
        const dy = pos.y - lastPosRef.current.y;
        totalDistanceRef.current += Math.sqrt(dx * dx + dy * dy);
      }

      lastPosRef.current = pos;
      currentPosRef.current = pos;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calcMouseJitter = useCallback(() => {
    const first = firstPosRef.current;
    const current = currentPosRef.current;
    if (!first || !current) return 0;

    const dx = current.x - first.x;
    const dy = current.y - first.y;
    const straightLine = Math.sqrt(dx * dx + dy * dy);

    return Math.round((totalDistanceRef.current - straightLine) * 10) / 10;
  }, []);

  const handleOverlayClick = useCallback(() => {
    clickCountRef.current += 1;
  }, []);

  const handleClose = useCallback(() => {
    clickCountRef.current += 1;
    const timeToClose = Date.now() - appearedAt;
    const mouseJitter = Math.max(0, calcMouseJitter());
    onClose(clickCountRef.current, timeToClose, mouseJitter);
  }, [onClose, appearedAt, calcMouseJitter]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div
        className="relative w-80 rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="閉じる"
        >
          ✕
        </button>
        <div className="pt-4 text-center">
          <p className="text-lg font-bold text-red-500">
            期間限定キャンペーン!
          </p>
          <p className="mt-2 text-sm text-gray-600">
            今なら初月無料！プレミアムプランにアップグレードしませんか？
          </p>
          <div className="mt-4 space-y-2">
            <button className="w-full rounded bg-red-500 px-4 py-2 text-sm font-bold text-white">
              詳しく見る
            </button>
            <p className="text-xs text-gray-400">
              ×ボタンで閉じることができます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
