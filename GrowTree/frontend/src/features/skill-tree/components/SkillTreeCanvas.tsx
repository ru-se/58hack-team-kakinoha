"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { SKILL_NODES, type SkillNode } from "../types/data";

interface Props {
  nodes?: SkillNode[];
  onSelectNode: (node: SkillNode | null) => void;
  selectedNode: SkillNode | null;
  zoomAction: { type: string; ts: number } | null;
}

/* ---- palettes ---- */
const PAL = {
  completed: { fill: "#e8b849", hi: "#fff7cc", lo: "#a67c20", rim: "#7a5a10", glow: "#ffd700" },
  available: { fill: "#4ade80", hi: "#bbf7d0", lo: "#16a34a", rim: "#15803d", glow: "#4ade80" },
  locked:    { fill: "#374151", hi: "#6b7280", lo: "#1f2937", rim: "#111827", glow: "#374151" },
};
const CAT: Record<string, string> = {
  none:     "#e8b849",
  web:      "#60a5fa",
  ai:       "#fbbf24",
  security: "#f87171",
  infra:    "#34d399",
  design:   "#c084fc",
  game:     "#fb923c",
};

/* ---- particle ---- */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
}

export function SkillTreeCanvas({ nodes, onSelectNode, selectedNode, zoomAction }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef    = useRef<HTMLDivElement>(null);
  const tf        = useRef({ x: 0, y: 0, s: 0.65 });
  const drag      = useRef({ on: false, sx: 0, sy: 0, ox: 0, oy: 0 });
  const particles = useRef<Particle[]>([]);
  const raf       = useRef(0);
  const tick      = useRef(0);

  const activeNodes = useMemo(() => nodes || SKILL_NODES, [nodes]);

  /* ---- zoom actions ---- */
  useEffect(() => {
    if (!zoomAction) return;
    const t = tf.current;
    if (zoomAction.type === "in")       t.s = Math.min(t.s * 1.25, 4);
    else if (zoomAction.type === "out") t.s = Math.max(t.s / 1.25, 0.3);
    else { t.s = 0.65; t.x = 0; t.y = 0; }
  }, [zoomAction]);

  /* ---- init particles ---- */
  useEffect(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 2000,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        life: Math.random() * 200,
        maxLife: 150 + Math.random() * 200,
        size: Math.random() * 2.5 + 0.5,
        color: ["#ffd700", "#4ade80", "#60a5fa", "#c084fc", "#f87171"][Math.floor(Math.random() * 5)],
      });
    }
    particles.current = arr;
  }, [activeNodes]);

  const toWorld = useCallback((sx: number, sy: number) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const t   = tf.current;
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (sx * dpr - c.width  / 2 - t.x) / t.s,
      y: (sy * dpr - c.height / 2 - t.y) / t.s,
    };
  }, []);

  const hitNode = useCallback((wx: number, wy: number) => {
    for (let i = activeNodes.length - 1; i >= 0; i--) {
      const n = activeNodes[i];
      if (Math.abs(wx - n.x) < 36 && Math.abs(wy - n.y) < 36) return n;
    }
    return null;
  }, [activeNodes]);

  /* ============================================================
     DRAW LOOP
  ============================================================ */
  useEffect(() => {
    const canvas = canvasRef.current, box = boxRef.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas || !box) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = box.clientWidth  * dpr;
      canvas.height = box.clientHeight * dpr;
      canvas.style.width  = box.clientWidth  + "px";
      canvas.style.height = box.clientHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    /* ---- background ---- */
    function drawBg(ctx: CanvasRenderingContext2D) {
      if (!canvas) return;
      const t = tick.current;

      // Deep space gradient
      const grad = ctx.createRadialGradient(0, -200, 0, 0, -200, 1800);
      grad.addColorStop(0,   "#0d1f0d");
      grad.addColorStop(0.4, "#081408");
      grad.addColorStop(1,   "#020802");
      ctx.fillStyle = grad;
      ctx.fillRect(-3000, -1500, 6000, 4000);

      // Nebula blobs
      const nebulas = [
        { x: -800, y: -300, r: 400, color: "rgba(74,222,128,0.04)" },
        { x:  600, y: -400, r: 350, color: "rgba(96,165,250,0.05)" },
        { x: -300, y: -600, r: 300, color: "rgba(192,132,252,0.04)" },
        { x:  900, y: -100, r: 280, color: "rgba(251,191,36,0.03)" },
        { x: -600, y:  100, r: 250, color: "rgba(248,113,113,0.03)" },
      ];
      for (const nb of nebulas) {
        const ng = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.r);
        ng.addColorStop(0, nb.color);
        ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.ellipse(nb.x, nb.y, nb.r, nb.r * 0.6, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stars (twinkling)
      for (let i = 0; i < 200; i++) {
        const sx  = ((i * 173 + 37) % 5000) - 2500;
        const sy  = ((i * 131 + 19) % 2000) - 1200;
        const tw  = (Math.sin(t * 0.03 + i * 1.7) + 1) / 2;
        ctx.globalAlpha = 0.2 + tw * 0.8;
        ctx.fillStyle   = i % 4 === 0 ? "#a5f3fc" : i % 3 === 0 ? "#e0f2fe" : "#f0fdf4";
        ctx.beginPath();
        ctx.arc(sx, sy, i % 5 === 0 ? 2 : 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Vertical light shaft
      const shaft = ctx.createLinearGradient(0, 700, 0, -600);
      shaft.addColorStop(0,   "rgba(74,222,128,0)");
      shaft.addColorStop(0.3, `rgba(74,222,128,${0.05 + Math.sin(t * 0.02) * 0.02})`);
      shaft.addColorStop(0.7, `rgba(74,222,128,${0.03 + Math.sin(t * 0.02) * 0.01})`);
      shaft.addColorStop(1,   "rgba(74,222,128,0)");
      ctx.fillStyle = shaft;
      ctx.fillRect(-60, -600, 120, 1300);

      // Ground glow
      const glow = ctx.createLinearGradient(0, 560, 0, 700);
      glow.addColorStop(0, "rgba(34,197,94,0.18)");
      glow.addColorStop(1, "rgba(34,197,94,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(-2000, 560, 4000, 140);

      // Pixel grass
      for (let gx = -2000; gx < 2000; gx += 3) {
        const gy    = 620 + Math.sin(gx * 0.015) * 6;
        const phase = Math.floor(gx / 3) & 1;
        ctx.fillStyle = phase ? "#1a3a1a" : "#1f4a1f";
        ctx.fillRect(gx, gy, 3, 4 + (Math.abs(gx) % 5));
      }
      ctx.fillStyle = "#0f2010";
      ctx.fillRect(-2000, 638, 4000, 400);
    }

    /* ---- organic trunk ---- */
    function drawTrunk(ctx: CanvasRenderingContext2D) {
      const t    = tick.current;
      const sway = Math.sin(t * 0.012) * 2;
      const minY = Math.min(...activeNodes.map(n => n.y)) - 80;
      const topY = Math.min(minY, -500);
      const botY = 632;

      for (let y = botY; y >= topY; y -= 2) {
        const prog = (botY - y) / (botY - topY);
        const w    = Math.max(3, 42 - prog * 36);
        const xoff = Math.sin(prog * 3 + t * 0.012) * prog * 4 + sway * (1 - prog);
        const r    = Math.round(92 - prog * 20);
        const g    = Math.round(58 - prog * 10);
        const b    = Math.round(30 - prog * 10);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(Math.round(xoff - w / 2), y, Math.round(w), 2);
      }

      // Highlight edge
      ctx.save();
      ctx.globalAlpha = 0.25;
      for (let y = botY; y >= topY; y -= 4) {
        const prog = (botY - y) / (botY - topY);
        const w    = Math.max(2, 42 - prog * 36);
        const xoff = Math.sin(prog * 3 + t * 0.012) * prog * 4 + sway * (1 - prog);
        ctx.fillStyle = "#c8a060";
        ctx.fillRect(Math.round(xoff - w / 2), y, 3, 2);
      }
      ctx.restore();

      // Glowing roots
      ctx.save();
      for (let r = 0; r < 5; r++) {
        const angle = (r / 5) * Math.PI - Math.PI / 2 + (r - 2) * 0.3;
        const len   = 80 + r * 20;
        ctx.strokeStyle = `rgba(74,222,128,${0.15 - r * 0.02})`;
        ctx.lineWidth   = 3 - r * 0.4;
        ctx.shadowColor = "#4ade80";
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.moveTo(sway, botY);
        ctx.quadraticCurveTo(
          Math.cos(angle) * len * 0.5 + sway,
          botY + Math.abs(Math.sin(angle) * len * 0.3),
          Math.cos(angle) * len + sway,
          botY + Math.abs(Math.sin(angle) * len)
        );
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    /* ---- glowing branches ---- */
    function drawBranches(ctx: CanvasRenderingContext2D) {
      const sway = Math.sin(tick.current * 0.012) * 2;

      for (const nd of activeNodes) {
        for (const cid of nd.children) {
          const ch = activeNodes.find(n => n.id === cid);
          if (!ch) continue;

          const x0  = nd.x + sway * 0.3, y0 = nd.y;
          const x1  = ch.x + sway * 0.2, y1 = ch.y;
          const cpx = (x0 + x1) / 2;
          const cpy = (y0 + y1) / 2 + Math.abs(x1 - x0) * 0.08;
          const dist = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(cpx, cpy, x1, y1);
          ctx.lineWidth   = Math.max(2, 8 - dist * 0.005);
          ctx.strokeStyle = "#6b4226";
          ctx.shadowColor = "#4a2e10";
          ctx.shadowBlur  = 4;
          ctx.stroke();

          // Highlight
          ctx.lineWidth   = 1;
          ctx.strokeStyle = "rgba(200,160,96,0.35)";
          ctx.shadowBlur  = 0;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    /* ---- leaf clusters ---- */
    function drawLeaves(ctx: CanvasRenderingContext2D) {
      const t = tick.current;
      const greens = ["#14532d", "#166534", "#15803d", "#16a34a", "#1a4a1a", "#22543d"];

      for (const node of activeNodes) {
        const sway = Math.sin(t * 0.008 + node.x * 0.001) * 3;
        const tier = node.tier ?? 0;
        const cx   = node.x + sway;
        const cy   = node.y - 40;
        const rx   = 55 + tier * 6;
        const ry   = 38 + tier * 4;

        // Shadow
        ctx.save();
        ctx.globalAlpha = 0.35;
        const shadowG = ctx.createRadialGradient(cx, cy + 10, 0, cx, cy + 10, rx * 0.9);
        shadowG.addColorStop(0, "rgba(0,0,0,0.4)");
        shadowG.addColorStop(1, "transparent");
        ctx.fillStyle = shadowG;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, rx * 0.9, ry * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Leaf pixels
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.clip();
        for (let dy = -ry; dy <= ry; dy += 3) {
          for (let dxi = -rx; dxi <= rx; dxi += 3) {
            if ((dxi / rx) ** 2 + (dy / ry) ** 2 > 1) continue;
            const hash = ((Math.abs(dxi) * 7 + Math.abs(dy) * 13) * 31) & 255;
            if (hash > 220 && (dxi / rx) ** 2 + (dy / ry) ** 2 > 0.4) continue;
            const ci = Math.abs(Math.floor(dxi / 4) + Math.floor(dy / 5)) % greens.length;
            ctx.fillStyle = greens[ci];
            ctx.fillRect(cx + dxi, cy + dy, 3, 3);
          }
        }
        ctx.restore();

        // Rim glow
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(t * 0.02 + node.x * 0.002) * 0.1;
        const rimG = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.4, 0, cx, cy, rx);
        rimG.addColorStop(0, "#86efac");
        rimG.addColorStop(0.6, "transparent");
        ctx.fillStyle = rimG;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    /* ---- glowing connections ---- */
    function drawConnections(ctx: CanvasRenderingContext2D) {
      const t = tick.current;

      for (const nd of activeNodes) {
        for (const cid of nd.children) {
          const ch = activeNodes.find(n => n.id === cid);
          if (!ch) continue;

          const x0  = nd.x, y0 = nd.y;
          const x1  = ch.x, y1 = ch.y;
          const cpx = (x0 + x1) / 2;
          const cpy = (y0 + y1) / 2 + Math.abs(x1 - x0) * 0.08;

          const both  = nd.status === "completed" && ch.status === "completed";
          const avail = nd.status === "completed" && ch.status === "available";

          if (both) {
            // Gold glowing bezier
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cpx, cpy, x1, y1);
            ctx.lineWidth   = 3;
            ctx.strokeStyle = "#fbbf24";
            ctx.shadowColor = "#ffd700";
            ctx.shadowBlur  = 18;
            ctx.stroke();
            // Wide outer halo
            ctx.lineWidth   = 9;
            ctx.strokeStyle = "rgba(251,191,36,0.12)";
            ctx.shadowBlur  = 0;
            ctx.stroke();
            ctx.restore();

            // Flowing orb (Bezier position)
            const sp  = (t * 0.018) % 1;
            const s2  = 1 - sp;
            const ox  = s2 * s2 * x0 + 2 * s2 * sp * cpx + sp * sp * x1;
            const oy  = s2 * s2 * y0 + 2 * s2 * sp * cpy + sp * sp * y1;
            ctx.save();
            ctx.beginPath();
            ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
            ctx.fillStyle   = "#fffde7";
            ctx.shadowColor = "#ffd700";
            ctx.shadowBlur  = 24;
            ctx.fill();
            ctx.restore();

          } else if (avail) {
            const pulse = (Math.sin(t * 0.07) + 1) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cpx, cpy, x1, y1);
            ctx.lineWidth   = 2;
            ctx.strokeStyle = `rgba(74,222,128,${0.5 + pulse * 0.5})`;
            ctx.shadowColor = "#4ade80";
            ctx.shadowBlur  = 12 + pulse * 10;
            ctx.stroke();
            ctx.restore();

          } else {
            ctx.save();
            ctx.setLineDash([6, 8]);
            ctx.beginPath();
            ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cpx, cpy, x1, y1);
            ctx.lineWidth   = 1.5;
            ctx.strokeStyle = "rgba(75,85,99,0.45)";
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }
        }
      }
    }

    /* ---- node drawing ---- */
    function drawNode(ctx: CanvasRenderingContext2D, n: SkillNode, sel: boolean) {
      const { x, y, status, category } = n;
      const p   = PAL[status];
      const cat = CAT[category] || "#888";
      const S   = 24;
      const t   = tick.current;

      // Selection ring
      if (sel) {
        const pulseR = S + 16 + Math.sin(t * 0.09) * 6;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = cat;
        ctx.lineWidth   = 2.5;
        ctx.shadowColor = cat;
        ctx.shadowBlur  = 24;
        ctx.globalAlpha = 0.55 + Math.sin(t * 0.1) * 0.45;
        ctx.stroke();
        ctx.restore();

        // Bounce arrow
        const bounce = Math.sin(t * 0.12) * 5;
        const ay     = y - S - 26 + bounce;
        ctx.save();
        ctx.fillStyle   = cat;
        ctx.shadowColor = cat;
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.moveTo(x, ay + 12);
        ctx.lineTo(x - 7, ay);
        ctx.lineTo(x + 7, ay);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Outer category glow area
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, S + 11, 0, Math.PI * 2);
      ctx.fillStyle   = status === "locked" ? "rgba(55,65,81,0.4)" : `${cat}28`;
      ctx.shadowColor = status === "locked" ? "transparent" : cat;
      ctx.shadowBlur  = status === "locked" ? 0 : 22;
      ctx.fill();
      ctx.restore();

      // Category ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, S + 7, 0, Math.PI * 2);
      ctx.strokeStyle = status === "locked" ? "#374151" : cat;
      ctx.lineWidth   = 2;
      ctx.shadowColor = status === "locked" ? "transparent" : cat;
      ctx.shadowBlur  = status === "locked" ? 0 : 14;
      ctx.stroke();
      ctx.restore();

      // Main body (radial gradient)
      ctx.save();
      const bodyGrad = ctx.createRadialGradient(x - S * 0.3, y - S * 0.3, 1, x, y, S);
      bodyGrad.addColorStop(0,   p.hi);
      bodyGrad.addColorStop(0.5, p.fill);
      bodyGrad.addColorStop(1,   p.lo);
      ctx.beginPath();
      ctx.arc(x, y, S, 0, Math.PI * 2);
      ctx.fillStyle   = bodyGrad;
      ctx.shadowColor = p.glow;
      ctx.shadowBlur  = status !== "locked" ? 22 : 4;
      ctx.fill();
      ctx.restore();

      // Inner rim
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, S, 0, Math.PI * 2);
      ctx.strokeStyle = p.rim;
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();

      // Icon
      ctx.save();
      ctx.font = "17px sans-serif";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      if (status === "completed") {
        ctx.fillStyle   = "#3d2510";
        ctx.shadowColor = "#7a5a10";
        ctx.shadowBlur  = 6;
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("✓", x, y + 1);
      } else if (status === "locked") {
        ctx.fillStyle = "#6b7280";
        ctx.fillText("🔒", x, y + 1);
      } else {
        ctx.fillStyle   = "#14532d";
        ctx.shadowColor = "#4ade80";
        ctx.shadowBlur  = 8;
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("!", x, y);
      }
      ctx.restore();

      // Label
      ctx.save();
      ctx.font         = "bold 13px 'DotGothic16', monospace";
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";
      ctx.shadowColor  = "#000";
      ctx.shadowBlur   = 8;
      ctx.fillStyle =
        status === "locked"    ? "#6b7280" :
        status === "completed" ? "#fef3c7" : "#d1fae5";
      ctx.fillText(n.label, x, y + S + 8);
      ctx.restore();
    }

    /* ---- floating particles ---- */
    function drawParticles(ctx: CanvasRenderingContext2D) {
      ctx.save();
      for (const p of particles.current) {
        p.life += 1;
        p.x    += p.vx;
        p.y    += p.vy;
        if (p.life > p.maxLife) {
          const pool = activeNodes.filter(n => n.status !== "locked");
          const nd   = pool[Math.floor(Math.random() * pool.length)];
          if (nd) {
            p.x = nd.x + (Math.random() - 0.5) * 100;
            p.y = nd.y + 30 + Math.random() * 30;
          }
          p.vx     = (Math.random() - 0.5) * 0.4;
          p.vy     = -Math.random() * 0.6 - 0.1;
          p.life   = 0;
          p.maxLife = 150 + Math.random() * 200;
          continue;
        }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.85;
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
      ctx.restore();
    }

    /* ---- scanlines overlay (screen-space) ---- */
    function drawScanlines(ctx: CanvasRenderingContext2D) {
      if (!canvas) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.035;
      ctx.fillStyle   = "#000";
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    /* ---- vignette overlay ---- */
    function drawVignette(ctx: CanvasRenderingContext2D) {
      if (!canvas) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const cx  = canvas.width  / 2;
      const cy  = canvas.height / 2;
      const rad = Math.max(cx, cy) * 1.3;
      const vg  = ctx.createRadialGradient(cx, cy, rad * 0.4, cx, cy, rad);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    /* ---- main loop ---- */
    function draw() {
      if (!canvas || !ctx) return;
      tick.current++;
      const T = tf.current;

      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = "#020802";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2 + T.x, canvas.height / 2 + T.y);
      ctx.scale(T.s, T.s);

      drawBg(ctx);
      drawLeaves(ctx);
      drawTrunk(ctx);
      drawBranches(ctx);
      drawConnections(ctx);
      drawParticles(ctx);

      const sorted = [...activeNodes].sort((a, b) => {
        const o = { locked: 0, available: 1, completed: 2 } as const;
        return o[a.status] - o[b.status];
      });
      for (const n of sorted) drawNode(ctx, n, selectedNode?.id === n.id);

      ctx.restore();

      drawScanlines(ctx);
      drawVignette(ctx);

      raf.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
    };
  }, [selectedNode, activeNodes]);

  /* ============================================================
     EVENTS (drag pan + click)
  ============================================================ */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const onMD = (e: MouseEvent) => {
      drag.current = { on: true, sx: e.clientX, sy: e.clientY, ox: tf.current.x, oy: tf.current.y };
    };
    const onMM = (e: MouseEvent) => {
      if (!drag.current.on) return;
      const dpr = window.devicePixelRatio || 1;
      tf.current.x = drag.current.ox + (e.clientX - drag.current.sx) * dpr;
      tf.current.y = drag.current.oy + (e.clientY - drag.current.sy) * dpr;
    };
    const onMU = (e: MouseEvent) => {
      const d     = drag.current;
      const moved = Math.abs(e.clientX - d.sx) > 5 || Math.abs(e.clientY - d.sy) > 5;
      drag.current.on = false;
      if (!moved) {
        const rect = c.getBoundingClientRect();
        const w    = toWorld(e.clientX - rect.left, e.clientY - rect.top);
        onSelectNode(hitNode(w.x, w.y));
      }
    };
    const onWh = (e: WheelEvent) => {
      e.preventDefault();
      tf.current.s = Math.max(0.3, Math.min(4, tf.current.s * (e.deltaY > 0 ? 0.92 : 1.08)));
    };

    let lastDist = 0;
    const onTS = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        drag.current = { on: true, sx: e.touches[0].clientX, sy: e.touches[0].clientY, ox: tf.current.x, oy: tf.current.y };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDist = Math.sqrt(dx * dx + dy * dy);
        drag.current.on = false;
      }
    };
    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && drag.current.on) {
        const dpr = window.devicePixelRatio || 1;
        tf.current.x = drag.current.ox + (e.touches[0].clientX - drag.current.sx) * dpr;
        tf.current.y = drag.current.oy + (e.touches[0].clientY - drag.current.sy) * dpr;
      } else if (e.touches.length === 2) {
        const dx   = e.touches[0].clientX - e.touches[1].clientX;
        const dy   = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastDist > 0) tf.current.s = Math.max(0.3, Math.min(4, tf.current.s * (dist / lastDist)));
        lastDist = dist;
      }
    };
    const onTE = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        const ch = e.changedTouches[0];
        if (Math.abs(ch.clientX - drag.current.sx) < 10 && Math.abs(ch.clientY - drag.current.sy) < 10) {
          const rect = c.getBoundingClientRect();
          const w    = toWorld(ch.clientX - rect.left, ch.clientY - rect.top);
          onSelectNode(hitNode(w.x, w.y));
        }
        drag.current.on = false;
      }
    };

    c.addEventListener("mousedown", onMD);
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup",   onMU);
    c.addEventListener("wheel", onWh, { passive: false });
    c.addEventListener("touchstart", onTS, { passive: false });
    c.addEventListener("touchmove",  onTM, { passive: false });
    c.addEventListener("touchend",   onTE);

    return () => {
      c.removeEventListener("mousedown", onMD);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup",   onMU);
      c.removeEventListener("wheel", onWh);
      c.removeEventListener("touchstart", onTS);
      c.removeEventListener("touchmove",  onTM);
      c.removeEventListener("touchend",   onTE);
    };
  }, [onSelectNode, toWorld, hitNode]);

  return (
    <div ref={boxRef} className="absolute inset-0" style={{ cursor: "grab" }}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
