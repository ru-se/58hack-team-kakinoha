"use client";

import { useState } from "react";

export type GenreKey = "web" | "ai" | "security" | "infrastructure" | "design" | "game";

export interface DebugPoints {
  web: number;
  ai: number;
  security: number;
  infrastructure: number;
  design: number;
  game: number;
}

const GENRES: { key: GenreKey; label: string; icon: string; color: string; bg: string }[] = [
  { key: "web",            label: "Web開発",       icon: "🌐", color: "#60a5fa", bg: "#1e3a5f" },
  { key: "ai",             label: "AI/機械学習",   icon: "🤖", color: "#fbbf24", bg: "#3d2e00" },
  { key: "security",       label: "セキュリティ",  icon: "🔐", color: "#f87171", bg: "#3d1010" },
  { key: "infrastructure", label: "インフラ/DevOps",icon: "⚙️", color: "#34d399", bg: "#0f3022" },
  { key: "design",         label: "UI/UXデザイン", icon: "🎨", color: "#c084fc", bg: "#2d1040" },
  { key: "game",           label: "ゲーム開発",    icon: "🎮", color: "#fb923c", bg: "#3d1f00" },
];

interface Props {
  points: DebugPoints;
  onAddPoint: (genre: GenreKey) => void;
}

export function DebugPanel({ points, onAddPoint }: Props) {
  const [open, setOpen] = useState(false);

  const total = Object.values(points).reduce((s, v) => s + v, 0);

  return (
    <>
      {/* DEBUG toggle button — bottom-left */}
      <button
        onClick={() => setOpen(o => !o)}
        className="absolute bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 font-mono text-xs font-bold tracking-widest transition-all"
        style={{
          background: open ? "#1a2e1a" : "#0d1a0d",
          border: "2px solid #4ade80",
          color: "#4ade80",
          boxShadow: open
            ? "0 0 12px rgba(74,222,128,0.5), inset 0 0 8px rgba(74,222,128,0.1)"
            : "2px 2px 0 #14532d",
        }}
      >
        <span style={{ fontSize: 14 }}>🛠</span>
        DEBUG
        {total > 0 && (
          <span
            style={{
              background: "#4ade80",
              color: "#0a0f08",
              borderRadius: 2,
              padding: "0 4px",
              fontSize: 10,
            }}
          >
            {total}
          </span>
        )}
      </button>

      {/* Debug panel */}
      {open && (
        <div
          className="absolute bottom-14 left-4 z-50 font-mono"
          style={{
            width: 280,
            background: "rgba(10,15,8,0.97)",
            border: "2px solid #4ade80",
            boxShadow: "0 0 24px rgba(74,222,128,0.3), 4px 4px 0 #14532d",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#14532d",
              borderBottom: "2px solid #4ade80",
              padding: "6px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="text-xs font-bold tracking-widest" style={{ color: "#4ade80" }}>
              🛠 DEBUG MENU
            </span>
            <span className="text-[10px]" style={{ color: "#86efac" }}>
              TOTAL: <strong style={{ color: "#fbbf24" }}>{total}</strong>pt
            </span>
          </div>

          {/* Genre buttons */}
          <div className="p-3 space-y-2">
            <p className="text-[9px] tracking-widest mb-3" style={{ color: "#4b5563" }}>
              ボタンを押してポイントを付与 →
            </p>
            {GENRES.map(g => (
              <button
                key={g.key}
                onClick={() => onAddPoint(g.key)}
                className="w-full flex items-center justify-between px-3 py-2 transition-all active:scale-95"
                style={{
                  background: g.bg,
                  border: `1.5px solid ${g.color}44`,
                  color: g.color,
                  boxShadow: `0 0 6px ${g.color}22`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 14px ${g.color}66`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = g.color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 6px ${g.color}22`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${g.color}44`;
                }}
              >
                <span className="flex items-center gap-2 text-xs font-bold tracking-wide">
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5"
                  style={{
                    background: points[g.key] > 0 ? g.color : "#1f2937",
                    color: points[g.key] > 0 ? "#0a0f08" : "#4b5563",
                    minWidth: 36,
                    textAlign: "center",
                    border: `1px solid ${g.color}44`,
                  }}
                >
                  {points[g.key]}pt
                </span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div
            className="text-[9px] tracking-widest text-center py-2"
            style={{ borderTop: "1px solid #14532d44", color: "#374151" }}
          >
            ポイントはスキルツリー解放に使用されます
          </div>
        </div>
      )}
    </>
  );
}
