"use client";

import type { SkillNode } from "../types/data";
import type { GenreKey } from "./DebugPanel";

interface Props {
  node: SkillNode;
  userPoints: number; // The user's current points for this category
  onClose: () => void;
  onUnlock: (nodeId: string, cost: number, cat: GenreKey) => void;
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
  mixed: "Achievement",
};

const CAT_COLORS: Record<string, string> = {
  none: "#e8b849",
  web: "#60a5fa",
  ai: "#fbbf24",
  security: "#f87171",
  infra: "#34d399",
  design: "#c084fc",
  game: "#fb923c",
  mixed: "#f472b6",
};

export function SkillNodePanel({ node, userPoints, onClose, onUnlock }: Props) {
  const catColor = CAT_COLORS[node.category] || "#888";
  const statusColor = STATUS_COLORS[node.status];
  
  const isMixed = node.category === "mixed";

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[360px] max-w-[calc(100vw-2rem)] p-4 font-sans animate-in slide-in-from-bottom-4 duration-200"
      style={{
        background: "rgba(31, 41, 55, 0.95)",
        border: `4px solid ${isMixed ? "#db2777" : "#e8b849"}`,
        boxShadow: isMixed
          ? "inset 2px 2px 0 #fbcfe8, inset -2px -2px 0 #831843, 0 4px 0 #000"
          : "inset 2px 2px 0 #fcd34d, inset -2px -2px 0 #b45309, 0 4px 0 #000",
        imageRendering: "pixelated",
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center border-2 border-gray-600 bg-[#1f2937] text-sm text-gray-400 hover:bg-gray-600 hover:text-white"
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
      {node.status !== "completed" && (
        <div className="mt-2 text-center flex flex-col items-center gap-2">
          {isMixed ? (
            <div className="text-xs font-bold w-full" style={{ color: "#a5b4fc" }}>
              必要到達度:
              <br />
              {node.requiredPointsMap && Object.entries(node.requiredPointsMap).map(([reqCat, reqPoints]) => (
                <div key={reqCat} className="text-white bg-gray-800 border border-gray-600 mt-1 py-1 px-2 rounded-md">
                   {CATEGORY_LABELS[reqCat] || reqCat}: {reqPoints}pt 以上
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs font-bold" style={{ color: "#a5b4fc" }}>
              解放条件: <span className="text-lg text-white font-mono">{node.requiredPoints}pt</span>
              <span className="text-gray-400 ml-1"> (現在: {userPoints}pt)</span>
            </div>
          )}
          
          <div className="w-full text-xs text-center py-2 mt-2 font-bold tracking-wider" style={{ background: "#1f2937", border: "1px solid #374151", color: "#9ca3af" }}>
             ポイント到達により自動解放されます
          </div>
        </div>
      )}

      {node.status === "completed" && (
        <div className="mt-2 text-xs text-center py-2 font-bold tracking-wider"
             style={{ background: "#14532d", border: "1px solid #4ade80", color: "#4ade80" }}>
          SKILL UNLOCKED
        </div>
      )}
    </div>
  );
}
