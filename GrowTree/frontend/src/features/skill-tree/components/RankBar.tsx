'use client';

import Image from "next/image";
import { RANKS, SKILL_NODES, type SkillNode } from "../types/data";

interface Props {
  nodes?: SkillNode[];
}

export function RankBar({ nodes }: Props) {
  const activeNodes = nodes || SKILL_NODES;
  const completedCount = activeNodes.filter((n) => n.status === "completed").length;
  // Exclude root node from total if you want, or keep it.
  const totalCount = activeNodes.length;
  const progress = completedCount / totalCount;
  const tierIndex = Math.min(Math.floor(progress * 10), 9);
  const currentRank = RANKS[tierIndex];

  const levelColors: Record<string, { text: string; bar: string; barDark: string }> = {
    beginner: { text: "#5abf5a", bar: "#5abf5a", barDark: "#2e8a2e" },
    intermediate: { text: "#e8b849", bar: "#e8b849", barDark: "#a67c20" },
    master: { text: "#cc66dd", bar: "#cc66dd", barDark: "#8833aa" },
  };
  const colors = levelColors[currentRank.level];

  // Map category to color
  const catColorMap: Record<string, string> = {
    'web': '#55aaff',
    'ai': '#e8b849',
    'security': '#e85555',
    'infra': '#55cc55',
    'design': '#cc66dd',
    'game': '#fb923c',
    'mixed': '#ffd700', // Gold color for mixed nodes
  };

  const catLabelMap: Record<string, string> = {
    'web': 'Web/App',
    'ai': 'AI',
    'security': 'Security',
    'infra': 'Infra',
    'design': 'Design',
    'game': 'Game',
    'mixed': 'Achievement',
  };

  const topAchievements = activeNodes
    .filter(n => n.status === "completed" && n.id !== "egg")
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, 3);

  return (
    <div
      className="absolute top-4 right-4 z-20 flex flex-col gap-4 p-4 font-sans max-h-[90vh] overflow-y-auto scrollbar-hide"
      style={{
        background: "rgba(10, 15, 20, 0.95)",
        border: "2px solid #e8b849",
        boxShadow: "0px 0px 20px rgba(44, 95, 45, 0.7), inset 0 0 10px rgba(0,0,0,0.8)",
        imageRendering: "pixelated",
        width: "300px",
        backdropFilter: "blur(5px)"
      }}
    >
      <div className="text-center pb-2 border-b border-gray-700/50">
          <h2 className="text-[#e8b849] font-bold tracking-widest text-sm uppercase">World Tree Status</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Tier badge - Big Image */}
        <div
          className="w-20 h-20 flex items-center justify-center shrink-0 bg-[#05080f] relative overflow-hidden"
          style={{
            border: "2px solid",
            borderColor: colors.text,
            boxShadow: `0 0 15px ${colors.text}66, inset 0 0 10px #000`
          }}
        >
          <Image
            src={`/images/ranks/rank_tree_${tierIndex}.png`}
            alt={`Rank ${tierIndex} - ${currentRank.nameJa}`}
            width={64}
            height={64}
            className="object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        <div className="flex flex-col gap-1 w-full justify-center">
          <span className="text-2xl font-black tracking-wider leading-tight" style={{ color: colors.text, textShadow: `0 2px 4px rgba(0,0,0,0.8)` }}>
            {currentRank.nameJa}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            {currentRank.nameEn}
          </span>
        </div>
      </div>

      {/* Bigger EXP bar */}
      <div className="flex flex-col gap-1 mt-1 w-full bg-[#0a0a0f] p-3 rounded-sm border border-gray-800">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-xs font-bold text-gray-500 tracking-widest">EXP PROGRESS</span>
          <span className="text-sm font-black" style={{ color: colors.text }}>
            {completedCount} <span className="text-gray-600 font-medium">/ {totalCount}</span>
          </span>
        </div>
        <div className="h-5 w-full relative bg-[#111827] border border-gray-700 shadow-inner overflow-hidden">
          <div
            className="h-full absolute left-0 top-0 transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(progress * 100, 100)}%`,
              background: colors.bar,
              boxShadow: `0 0 10px ${colors.bar}`
            }}
          >
             <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
          </div>
        </div>
      </div>

      {/* Top 3 Achievements Overall */}
      <div className="mt-2 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="text-xs font-bold tracking-widest text-gray-300">▼ LATEST ACHIEVEMENTS ▼</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {topAchievements.length === 0 ? (
            <div className="text-center text-xs text-gray-500 italic py-2">
              No achievements unlocked yet.
            </div>
          ) : (
            topAchievements.map((node, i) => {
              const nodeColor = catColorMap[node.category] || '#fff';
              const nodeCatLabel = catLabelMap[node.category] || node.category;
              // Make the #1 rank slightly more prominent
              const isFirst = i === 0;

              return (
                <div key={node.id} className="flex flex-col bg-[#080b0f] p-2 pl-3 relative overflow-hidden transition-all group"
                     style={{ borderLeft: `4px solid ${nodeColor}`, borderBottom: isFirst ? `1px solid ${nodeColor}44` : 'none' }}>
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none transition-transform group-hover:scale-150 group-hover:opacity-20" style={{ background: nodeColor, borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
                  <div className="flex justify-between items-center mb-[2px]">
                    <span className="text-[10px] uppercase font-black tracking-widest" style={{ color: nodeColor }}>
                        {nodeCatLabel}
                    </span>
                    <span className="text-[9px] font-bold text-gray-600">
                        {isFirst ? '★ TOP TIER' : `RANK ${i + 1}`}
                    </span>
                  </div>
                  <span className={`text-[13px] font-bold truncate tracking-wide text-gray-100 drop-shadow-md`} title={node.label}>
                      {node.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
