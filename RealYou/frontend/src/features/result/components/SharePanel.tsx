'use client';

import { Share2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type SharePanelProps = {
  title: string;
};

function buildShareText(title: string): string {
  return `私の行動解析結果は「${title}」でした！\n#行動解析REPORT`;
}

export default function SharePanel({ title }: SharePanelProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const text = buildShareText(title);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const shareToX = () => {
    const params = new URLSearchParams({ text });
    window.open(
      `https://twitter.com/intent/tweet?${params}`,
      '_blank',
      'noopener,noreferrer'
    );
    setOpen(false);
  };

  // TODO: 本番URL確定後、LINE シェアに url パラメータを追加する
  const shareToLine = () => {
    const params = new URLSearchParams({ text });
    window.open(
      `https://social-plugins.line.me/lineit/share?${params}`,
      '_blank',
      'noopener,noreferrer'
    );
    setOpen(false);
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center h-12 min-w-[160px] px-6 bg-black text-white rounded-full font-black shadow-[4px_4px_0px_0px_#fbbf24] hover:translate-y-0.5 hover:shadow-none transition-all text-sm sm:text-base"
      >
        <Share2 className="w-5 h-5 mr-2 stroke-[3px]" />
        <span className="text-sm sm:text-base tracking-tight">
          結果をシェア
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-10 mb-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={shareToX}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            <span className="text-base">𝕏</span>X (Twitter) でシェア
          </button>
          <button
            type="button"
            onClick={shareToLine}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            <span className="text-base">💬</span>
            LINE でシェア
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            <span className="text-base">📋</span>
            {copied ? 'コピーしました！' : 'テキストをコピー'}
          </button>
        </div>
      )}
    </div>
  );
}
