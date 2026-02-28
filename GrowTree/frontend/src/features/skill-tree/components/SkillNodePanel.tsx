"use client";

import type { SkillNode } from "../types/data";

interface Props {
  node: SkillNode;
  userPoints?: number; // ? をつけて任意にする
  onClose: () => void;
  onUnlock?: () => void; // ? をつけて任意にする
}

const STATUS_LABELS: Record<string, string> = {
  completed: "クリア済み",
  available: "解放可能",
  locked: "ロック中",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "#e8b849",
  available: "#5abf5a",
  locked: "#5a6068",
};

const CATEGORY_LABELS: Record<string, string> = {
  none: "General",
  web: "Web / App",
  ai: "AI",
  security: "Security",
  infra: "Infrastructure",
  design: "UI/UX Design",
  game: "Game Dev",
};

const CAT_COLORS: Record<string, string> = {
  none: "#e8b849",
  web: "#60a5fa",
  ai: "#fbbf24",
  security: "#f87171",
  infra: "#34d399",
  design: "#c084fc",
  game: "#fb923c",
};

export function SkillNodePanel({ node, userPoints, onClose, onUnlock }: Props) {
  const catColor = CAT_COLORS[node.category] || "#888";
  const statusColor = STATUS_COLORS[node.status];
  const canUnlock = node.status === "available" && (userPoints ?? 0) >= node.requiredPoints;

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[360px] max-w-[calc(100vw-2rem)] p-4 font-sans animate-in slide-in-from-bottom-4 duration-200"
      style={{
        background: "rgba(31, 41, 55, 0.95)",
        border: "4px solid #e8b849",
        boxShadow:
          "inset 2px 2px 0 #fcd34d, inset -2px -2px 0 #b45309, 0 4px 0 #000",
        imageRendering: "pixelated",
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center border-2 border-[#e8b849] bg-[#1f2937] text-sm text-[#e8b849] hover:bg-[#e8b849] hover:text-[#1f2937]"
        aria-label="Close panel"
      >
        X
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 flex items-center justify-center text-xl shrink-0 border-2 bg-gray-900"
          style={{
            borderColor: statusColor,
            color: statusColor,
            boxShadow: `0 0 10px ${statusColor}44`,
          }}
        >
          {node.status === "completed" ? "✔" : node.status === "available" ? "!" : "🔒"}
        </div>
        <div>
          <h3 className="text-lg font-bold leading-tight" style={{ color: statusColor }}>
            {node.label}
          </h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className="text-xs px-2 py-1 font-bold tracking-wide"
          style={{ background: "#1f2937", color: catColor, border: `1px solid ${catColor}` }}
        >
          {CATEGORY_LABELS[node.category]}
        </span>
        <span
          className="text-xs px-2 py-1 font-bold tracking-wide"
          style={{ background: "#1f2937", color: statusColor, border: `1px solid ${statusColor}` }}
        >
          {STATUS_LABELS[node.status]}
        </span>
        <span className="text-xs px-2 py-1 font-bold tracking-wide text-gray-400 border border-gray-600 bg-[#1f2937]">
          TIER {node.tier}
        </span>
      </div>

      <div className="bg-[#0a0f08] border border-gray-700 p-3 mb-3">
        <p className="text-sm leading-relaxed text-gray-300">{node.description}</p>
      </div>

      {/* Unlock action section */}
      {node.status === "available" && (
        <div className="mt-2 text-center flex flex-col items-center gap-2">
          <div className="text-xs font-bold" style={{ color: "#a5b4fc" }}>
            必要ポイント: <span className="text-lg text-white">{node.requiredPoints}pt</span> 
            <span className="text-gray-400 ml-1">(所持: {userPoints ?? 0}pt)</span>
          </div>
          
          <button
            onClick={() => onUnlock?.()}
            disabled={!canUnlock}
            className="w-full py-2 text-sm font-bold tracking-widest transition-all mt-1 uppercase"
            style={{
              background: canUnlock ? "#14532d" : "#374151",
              border: `2px solid ${canUnlock ? "#4ade80" : "#6b7280"}`,
              color: canUnlock ? "#4ade80" : "#9ca3af",
              opacity: canUnlock ? 1 : 0.6,
              cursor: canUnlock ? "pointer" : "not-allowed",
              boxShadow: canUnlock ? "0 0 10px rgba(74,222,128,0.3)" : "none",
            }}
          >
            {canUnlock ? "スキル解放" : "ポイント不足"}
          </button>
        </div>
      )}

      {node.status === "locked" && (
        <div className="mt-2 text-xs text-center py-2 font-bold tracking-wider"
             style={{ background: "#374151", border: "1px solid #6b7280", color: "#9ca3af" }}>
          LOCKED - PREREQUISITES REQUIRED
        </div>
      )}
    </div>
  );
}
