"use client";

import { useState } from "react";

export function AppSidebar() {
  const [errorItem, setErrorItem] = useState<string | null>(null);

  const handleDisabledClick = (e: React.MouseEvent, item: string) => {
    e.preventDefault();
    setErrorItem(item);
    setTimeout(() => setErrorItem(null), 400);
  };

  const getDisabledClass = (item: string) => {
    const isError = errorItem === item;
    const baseClass = "relative w-full flex items-center p-3 transition-all duration-200 border-4 font-sans mb-3 rounded-none cursor-not-allowed overflow-hidden";
    
    return `${baseClass} bg-[#4a554a] border-[#1f291f] text-[#9ca3af] shadow-[inset_2px_2px_10px_rgba(0,0,0,0.5)] ${isError ? 'animate-shake' : ''}`;
  };

  const renderDisabledItem = (title: string, icon: string, path: string, asLi = true) => {
    const isError = errorItem === path;
    const content = (
        <button
          onClick={(e) => handleDisabledClick(e, path)}
          className={getDisabledClass(path)}
        >
          {/* X mark overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-[#ef4444] opacity-50 drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          
          <div className="flex h-8 w-8 items-center justify-center text-xl mr-3 bg-[#374137] border-2 border-[#1f291f] opacity-60 grayscale">
            {icon}
          </div>
          <span className="text-lg font-bold tracking-widest opacity-60">{title}</span>

          {/* Red flash effect on click */}
          {isError && (
            <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay pointer-events-none"></div>
          )}
        </button>
    );
    return asLi ? <li>{content}</li> : content;
  };

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 -translate-x-full transition-transform sm:translate-x-0 bg-[#14532D] border-r-4 border-black">
      <div className="flex h-full flex-col overflow-y-auto px-4 py-8">
        {/* Menu Title */}
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold tracking-widest text-[#4ADE80] font-sans border-b-4 border-[#4ADE80] pb-2 drop-shadow-[2px_2px_0_black]">
            MAIN MENU
          </h2>
        </div>

        {/* Navigation Items (Disabled) */}
        <ul className="space-y-4 font-bold">
          {renderDisabledItem("HOME", "🏠", "/dashboard")}
          {renderDisabledItem("QUESTS", "⚔️", "/exercises")}
          {renderDisabledItem("STATS", "📜", "/grades")}
          {renderDisabledItem("RANK", "🎯", "/rank-measurement")}
        </ul>

        {/* Logout Button (Disabled) */}
        <div className="mt-auto mb-4">
          {renderDisabledItem("LOGOUT", "🚪", "/logout", false)}
        </div>

        {/* System Info Box */}
        <div className="mt-auto border-4 border-black bg-black p-4 text-[#4ADE80] font-sans text-xs tracking-wider">
          <p className="mb-2 border-b border-[#4ADE80] pb-1">SYSTEM STATUS</p>
          <div className="flex justify-between mb-1">
            <span>ONLINE</span>
            <span className="animate-pulse text-[#FCD34D]">●</span>
          </div>
          <div className="flex justify-between">
            <span>VER.</span>
            <span>2.0.26</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
