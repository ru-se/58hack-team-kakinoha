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

  const coreGenres = [
    { key: 'web', label: 'Web/App', color: '#55aaff' },
    { key: 'ai', label: 'AI', color: '#e8b849' },
    { key: 'security', label: 'Security', color: '#e85555' },
    { key: 'infra', label: 'Infra', color: '#55cc55' },
    { key: 'design', label: 'Design', color: '#cc66dd' },
    { key: 'game', label: 'Game', color: '#fb923c' }
  ];

  const getTopAchievement = (genreKey: string) => {
    const completedInGenre = activeNodes.filter(n => n.category === genreKey && n.status === "completed");
    if (completedInGenre.length === 0) return "--- Not Reached ---";
    
    // Find the one with highest tier
    const topNode = completedInGenre.reduce((max, node) => (node.tier > max.tier ? node : max), completedInGenre[0]);
    return topNode.label;
  };

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

      {/* Top Achievements per Genre */}
      <div className="mt-2 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="text-xs font-bold tracking-widest text-gray-300">▼ TOP ACHIEVEMENTS ▼</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {coreGenres.map(genre => {
            const topLabel = getTopAchievement(genre.key);
            const isUnlocked = topLabel !== "--- Not Reached ---";
            return (
              <div key={genre.key} className="flex flex-col bg-[#080b0f] border-l-4 p-2 pl-3 relative overflow-hidden transition-all"
                   style={{ borderLeftColor: isUnlocked ? genre.color : '#334155' }}>
                <div className="absolute top-0 right-0 w-16 h-16 opacity-5 pointer-events-none" style={{ background: genre.color, borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
                <span className="text-[10px] uppercase font-black tracking-widest mb-[2px]" style={{ color: isUnlocked ? genre.color : '#64748b' }}>
                    {genre.label}
                </span>
                <span className={`text-[13px] font-bold truncate tracking-wide ${isUnlocked ? 'text-gray-100' : 'text-gray-600'}`} title={topLabel}>
                    {topLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
