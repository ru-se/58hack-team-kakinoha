"use client";

import { useState, useCallback } from "react";
import { SkillTreeCanvas } from "../../features/skill-tree/components/SkillTreeCanvas";
import { SkillNodePanel } from "../../features/skill-tree/components/SkillNodePanel";
import { RankBar } from "../../features/skill-tree/components/RankBar";
import { SkillLegend } from "../../features/skill-tree/components/SkillLegend";
import { ZoomControls } from "../../features/skill-tree/components/ZoomControls";
import {
  DebugPanel,
  type DebugPoints,
  type GenreKey,
} from "../../features/skill-tree/components/DebugPanel";
import {
  SKILL_NODES,
  type SkillNode,
} from "../../features/skill-tree/types/data";

const INITIAL_POINTS: DebugPoints = {
  web: 0,
  ai: 0,
  security: 0,
  infrastructure: 0,
  design: 0,
  game: 0,
};

const CAT_TO_GENRE: Record<string, GenreKey> = {
  infra: "infrastructure",
  security: "security",
  ai: "ai",
  web: "web",
  design: "design",
  game: "game",
};

export default function SkillTreePage() {
  const [nodes, setNodes] = useState<SkillNode[]>(SKILL_NODES);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [zoomAction, setZoomAction] = useState<{
    type: string;
    ts: number;
  } | null>(null);
  const [mounted] = useState(true);
  const [debugPoints, setDebugPoints] = useState<DebugPoints>(INITIAL_POINTS);

  const handleSelectNode = useCallback((node: SkillNode | null) => {
    setSelectedNode(node);
  }, []);

  const handleAddPoint = useCallback((genre: GenreKey) => {
    setDebugPoints((prev) => ({ ...prev, [genre]: prev[genre] + 1 }));
  }, []);

  const handleUnlock = useCallback(
    (nodeId: string, cost: number, rawCat: string) => {
      const genre = CAT_TO_GENRE[rawCat];
      if (!genre) return;

      // Deduct points
      setDebugPoints((prev) => ({
        ...prev,
        [genre]: Math.max(0, prev[genre] - cost),
      }));

      // Update nodes status
      setNodes((prev) => {
        const next = prev.map((n) =>
          n.id === nodeId ? { ...n, status: "completed" as const } : n,
        );
        const availableSet = new Set<string>();

        next.forEach((n) => {
          if (n.status === "completed") {
            n.children.forEach((childId) => availableSet.add(childId));
          }
        });

        return next.map((n) => {
          if (n.status === "completed") return n;
          if (availableSet.has(n.id))
            return { ...n, status: "available" as const };
          return { ...n, status: "locked" as const };
        });
      });

      // Update selected node visually in panel
      setSelectedNode((prev) => {
        if (!prev || prev.id !== nodeId) return prev;
        return { ...prev, status: "completed" as const };
      });
    },
    [],
  );

  // Compute what category points should be passed to the panel
  const getPointsForCategory = (cat: string) => {
    const genre = CAT_TO_GENRE[cat];
    return genre ? debugPoints[genre] : 0;
  };

  return (
    <div
      className="relative w-full h-[calc(100vh-4rem)] overflow-hidden"
      style={{ background: "#0a0f08" }}
    >
      <SkillTreeCanvas
        nodes={nodes}
        onSelectNode={handleSelectNode}
        selectedNode={selectedNode}
        zoomAction={zoomAction}
      />

      {/* RankBar now needs to see the dynamic nodes to calculate progress */}
      <RankBar nodes={nodes} />
      <SkillLegend />
      <ZoomControls
        onZoomIn={() => setZoomAction({ type: "in", ts: Date.now() })}
        onZoomOut={() => setZoomAction({ type: "out", ts: Date.now() })}
        onReset={() => setZoomAction({ type: "reset", ts: Date.now() })}
      />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none font-sans">
        <h1
          className="text-base font-bold tracking-widest"
          style={{
            color: "#e8b849",
            textShadow: "2px 2px 0 #7a5a10, -1px -1px 0 #0a0a0a",
          }}
        >
          SKILL TREE
        </h1>
        {mounted && (
          <p
            className="text-[9px] mt-1"
            style={{ color: "#666680" }}
            suppressHydrationWarning
          >
            ドラッグで移動 / スクロールでズーム / ノードをクリックで詳細
          </p>
        )}
      </div>

      <DebugPanel points={debugPoints} onAddPoint={handleAddPoint} />

      {selectedNode && (
        <SkillNodePanel
          node={selectedNode}
          userPoints={getPointsForCategory(selectedNode.category)}
          onClose={() => setSelectedNode(null)}
          onUnlock={() =>
            handleUnlock(
              selectedNode.id,
              selectedNode.requiredPoints,
              selectedNode.category,
            )
          }
        />
      )}
    </div>
  );
}
