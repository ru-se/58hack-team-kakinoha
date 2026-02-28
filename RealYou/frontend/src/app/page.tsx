'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

// --- まる爆発アニメーションコンポーネント ---
const SparklesExplosion = () => {
  const count = 20;
  const colors = ['#e9eb7c', '#ee7ee6', '#6eb8ca', '#e17a78', '#91ec77'];

  const sparkles = Array.from({ length: count }, (_, index) => {
    const angle = (360 / count) * index;
    const distance = 60 + index * 3;
    const style = {
      position: 'absolute',
      backgroundColor: colors[index % colors.length],
      width: `${6 + (index % 5) * 2}px`,
      height: `${6 + (index % 5) * 2}px`,
      borderRadius: '50%',
      top: '50%',
      left: '50%',
      '--angle': `${angle}deg`,
      '--distance': `${distance}px`,
      opacity: 0,
      animation: 'sparkle-burst 600ms ease-out forwards',
    } as CSSProperties;

    return { id: index, style };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      <style>{`
        @keyframes sparkle-burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0px) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scale(0);
          }
        }
      `}</style>

      {sparkles.map((s) => (
        <div key={s.id} style={s.style} />
      ))}
    </div>
  );
};

// --- メインのトップページコンポーネント ---
export default function TopPage() {
  const router = useRouter();
  const [showExplosion, setShowExplosion] = useState(false);

  // BGMを保持するための Ref
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // BGMの初期化と再生管理
  useEffect(() => {
    // パスは public/sounds/start-bgm.mp3 を想定
    const bgm = new Audio('/sounds/start-bgm.mp3');
    bgm.loop = true;
    bgm.volume = 0.4;
    bgmRef.current = bgm;

    const playBGM = () => {
      bgm.play().catch(() => {
        // 自動再生制限がかかった場合は何もしない
      });
      // 一度クリックされたらイベントリスナーを削除
      window.removeEventListener('click', playBGM);
    };

    window.addEventListener('click', playBGM);

    // クリーンアップ
    return () => {
      bgm.pause();
      window.removeEventListener('click', playBGM);
    };
  }, []);

  const handleStartClick = () => {
    setShowExplosion(true);

    // SEの再生（パスを修正）
    const audio = new Audio('/sounds/start-se.mp3');
    audio.play().catch(() => {});

    // ボタン押下時にBGMを停止
    if (bgmRef.current) {
      bgmRef.current.pause();
    }

    setTimeout(() => {
      router.push('/problems');
    }, 800);

    setTimeout(() => {
      setShowExplosion(false);
    }, 800);
  };

  return (
    <div
      className="flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-top-pattern"
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(255,255,255,0.8) 1.0px, transparent 4px),
          url('/images/bg-pattern.svg')
        `,
        backgroundSize: '16px 16px, cover',
        backgroundPosition: '0 0, center',
        backgroundRepeat: 'repeat, no-repeat',
      }}
    >
      <div className="flex flex-col items-center gap-[2vh] w-full">
        <Image
          src="/images/RealYouLogo.png"
          alt="Real You -本当の私じゃだめですか？-"
          width={800}
          height={500}
          className="max-h-[65vh] w-auto object-contain drop-shadow-2xl"
        />

        <div className="relative">
          <button
            onClick={handleStartClick}
            className="transition-all duration-100 ease-out hover:scale-110 active:scale-95 active:opacity-50"
          >
            <Image
              src="/images/StartButton.png"
              alt="診断スタート"
              width={320}
              height={120}
              className="w-[40vw] max-w-xs min-w-[180px] drop-shadow-md"
            />
          </button>

          {showExplosion && <SparklesExplosion />}
        </div>
      </div>
    </div>
  );
}
