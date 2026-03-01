"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { SkillTreeCanvas } from "../../features/skill-tree/components/SkillTreeCanvas";
import { SkillNodePanel } from "../../features/skill-tree/components/SkillNodePanel";
import { RankBar } from "../../features/skill-tree/components/RankBar";
import { SkillLegend } from "../../features/skill-tree/components/SkillLegend";
import { ZoomControls } from "../../features/skill-tree/components/ZoomControls";
import { DebugPanel, type DebugPoints, type GenreKey } from "../../features/skill-tree/components/DebugPanel";
import { SKILL_NODES, type SkillNode } from "../../features/skill-tree/types/data";

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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomAction, setZoomAction] = useState<{ type: string; ts: number } | null>(null);
  const [mounted] = useState(true);
  const [debugPoints, setDebugPoints] = useState<DebugPoints>(INITIAL_POINTS);

  useEffect(() => {
    // ======== URL Parameter Handling ========
    const params = new URLSearchParams(window.location.search);
    const queryUserId = params.get("user_id");
    if (queryUserId) {
      localStorage.setItem("chimera_user_id", queryUserId);
      localStorage.setItem("user_id", queryUserId);
    }

    const userId =
      localStorage.getItem("chimera_user_id") ||
      localStorage.getItem("user_id");
    if (!userId) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://five8hack-team-kakinoha.onrender.com";
    const endpoint = `${baseUrl}/api/results/${userId}/total-exp`;

    const toPoint = (value: unknown): number => {
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    };

    const fetchTotalExp = async () => {
      try {
        console.log("[GrowTree] total-exp fetch start", { endpoint, userId });

        const res = await fetch(endpoint, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const totalExp = data?.total_exp ?? {};

        console.log("[GrowTree] total-exp response", totalExp);

        setDebugPoints({
          web: toPoint(totalExp.web),
          ai: toPoint(totalExp.ai),
          security: toPoint(totalExp.security),
          infrastructure: toPoint(totalExp.infrastructure),
          design: toPoint(totalExp.design),
          game: toPoint(totalExp.game),
        });

        console.log("[GrowTree] debugPoints mapped", {
          web: toPoint(totalExp.web),
          ai: toPoint(totalExp.ai),
          security: toPoint(totalExp.security),
          infrastructure: toPoint(totalExp.infrastructure),
          design: toPoint(totalExp.design),
          game: toPoint(totalExp.game),
        });
      } catch (err) {
        console.warn("[GrowTree] total-exp fetch failed", err);
      }
    };

    void fetchTotalExp();
  }, []);

  const handleSelectNode = useCallback((node: SkillNode | null) => {
    setSelectedNodeId(node ? node.id : null);
  }, []);

  const handleAddPoint = useCallback((genre: GenreKey) => {
    setDebugPoints(prev => ({ ...prev, [genre]: prev[genre] + 50 }));
  }, []);

  const handleUnlock = useCallback((_nodeId: string, _cost: number, _rawCat: string) => {
    // Unlocking is now automatic based on points, no manual point deduction needed.
  }, []);

  const getPointsForCategory = useCallback((cat: string) => {
    const genre = CAT_TO_GENRE[cat];
    return genre ? debugPoints[genre] : 0;
  }, [debugPoints]);

  const nodes = useMemo(() => {
    const currentNodes: SkillNode[] = JSON.parse(JSON.stringify(SKILL_NODES));

    // Check points and mark completed
    currentNodes.forEach(node => {
      let canComplete = false;

      if (node.id === "egg") {
        canComplete = true; // Always unlocked
      } else if (node.category === "mixed" && node.requiredPointsMap) {
        canComplete = Object.entries(node.requiredPointsMap).every(
          ([reqCat, reqPoints]) => getPointsForCategory(reqCat) >= reqPoints
        );
      } else {
        canComplete = getPointsForCategory(node.category) >= node.requiredPoints;
      }

      node.status = canComplete ? "completed" : "locked";
    });

    // Determine 'available' status via graph traversal starting from 'egg'
    const availableSet = new Set<string>();
    const nodeMap = new Map(currentNodes.map(n => [n.id, n]));

    const root = nodeMap.get("egg");
    if (root && root.status === "completed") {
      root.children.forEach(childId => availableSet.add(childId));
    }

    let changed = true;
    while (changed) {
      changed = false;
      currentNodes.forEach(node => {
        // Only consider a node really completed if it's reachable from an available/completed parent
        // For linear trees, this is naturally true but mixed nodes might be different.
        if (node.status === "completed") {
          node.children.forEach(childId => {
            const child = nodeMap.get(childId);
            if (child && child.status === "locked" && !availableSet.has(childId)) {
              availableSet.add(childId);
              changed = true;
            }
          });
        }
      });
    }

    currentNodes.forEach(node => {
      // If node is locked but is a child of a completed node, it's available.
      // Exception: completed nodes remain completed.
      // For mixed nodes, we just check if it's locked. Currently no parent sets them as children.
      // Actually, in our new graph, tier 4 nodes have mixed nodes in their `children` array.
      if (node.status === "locked" && availableSet.has(node.id)) {
        node.status = "available";
      }

      // Additional safety for mixed nodes: if they are not in availableSet but their pre-requisites are fulfilled by point, 
      // they might be "available". Though with 2 requirements, they become completed natively when points are enough.
      // E.g. mixed node needs infra: 4, security: 4. The tier 4 nodes must be completed.
    });

    return currentNodes;
  }, [getPointsForCategory]);

  const selectedNode = useMemo(() => {
    return selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null;
  }, [nodes, selectedNodeId]);


  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden" style={{ background: "#0a0f08" }}>
      <SkillTreeCanvas
        nodes={nodes}
        onSelectNode={handleSelectNode}
        selectedNode={selectedNode}
        zoomAction={zoomAction}
      />

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
          style={{ color: "#e8b849", textShadow: "2px 2px 0 #7a5a10, -1px -1px 0 #0a0a0a" }}
        >
          SKILL TREE
        </h1>
        {mounted && (
          <p className="text-[9px] mt-1" style={{ color: "#666680" }} suppressHydrationWarning>
            ドラッグで移動 / スクロールでズーム / ノードをクリックで詳細
          </p>
        )}
      </div>

      <DebugPanel points={debugPoints} onAddPoint={handleAddPoint} />

      {selectedNode && (
        <SkillNodePanel
          node={selectedNode}
          userPoints={selectedNode.category === "mixed" ? 0 : getPointsForCategory(selectedNode.category)}
          onClose={() => setSelectedNodeId(null)}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  );
}
