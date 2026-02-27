export type NodeStatus = "completed" | "available" | "locked"
export type SkillCategory = "none" | "web" | "ai" | "security" | "infra" | "design" | "game"

export interface SkillNode {
  id: string
  label: string
  category: SkillCategory
  status: NodeStatus
  x: number
  y: number
  tier: number
  description: string
  children: string[]
}

export interface RankInfo {
  tier: number
  nameJa: string
  nameEn: string
  level: "beginner" | "intermediate" | "master"
}

export const RANKS: RankInfo[] = [
  { tier: 1, nameJa: "種子", nameEn: "Seed", level: "beginner" },
  { tier: 2, nameJa: "苗木", nameEn: "Sprout", level: "beginner" },
  { tier: 3, nameJa: "若木", nameEn: "Sapling", level: "beginner" },
  { tier: 4, nameJa: "巨木", nameEn: "Giant Tree", level: "intermediate" },
  { tier: 5, nameJa: "母樹", nameEn: "Mother Tree", level: "intermediate" },
  { tier: 6, nameJa: "林", nameEn: "Grove", level: "intermediate" },
  { tier: 7, nameJa: "森", nameEn: "Forest", level: "intermediate" },
  { tier: 8, nameJa: "霊樹", nameEn: "Spirit Tree", level: "master" },
  { tier: 9, nameJa: "古樹", nameEn: "Ancient Tree", level: "master" },
  { tier: 10, nameJa: "世界樹", nameEn: "World Tree", level: "master" },
]

/**
 * ノード配置設計
 *
 * ジャンル隣接順（関係性が高いものを隣に）:
 *   インフラ | セキュリティ | AI | Web | デザイン | ゲーム
 *
 * 理由:
 *   - インフラ ↔ セキュリティ (ネットワーク/インフラセキュリティ)
 *   - セキュリティ ↔ AI (AI活用セキュリティ)
 *   - AI ↔ Web (AI搭載Webアプリ)
 *   - Web ↔ デザイン (Webデザイン/UI)
 *   - デザイン ↔ ゲーム (ビジュアルデザイン/ゲームUI)
 *
 * x座標: -1250 ~ +1250 (6ジャンル × 500px間隔)
 * y座標: 下(高tier) → 上(低tier)  下:ground, 上:crown
 */

// X座標定数（ジャンルごとの中心X）
const X = {
  infra: -1250,
  security: -750,
  ai: -250,
  web: 250,
  design: 750,
  game: 1250,
}

export const SKILL_NODES: SkillNode[] = [
  // =====================================================
  //  TIER 0 — ROOT (中央下)
  // =====================================================
  {
    id: "egg",
    label: "エンジニアの卵",
    category: "none",
    status: "completed",
    x: 0, y: 500,
    tier: 0,
    description: "すべてのエンジニアの出発点。ここから技術の旅が始まる。",
    children: ["infra-1", "security-1", "ai-1", "web-1", "design-1", "game-1"],
  },

  // =====================================================
  //  TIER 1 — ジャンル入門（6分岐）
  // =====================================================
  {
    id: "infra-1",
    label: "インフラ入門",
    category: "infra",
    status: "available",
    x: X.infra, y: 250,
    tier: 1,
    description: "Linux・ネットワーク・サーバーの基礎。すべての土台となる知識。",
    children: ["infra-2a", "infra-2b"],
  },
  {
    id: "security-1",
    label: "セキュリティ入門",
    category: "security",
    status: "available",
    x: X.security, y: 250,
    tier: 1,
    description: "情報セキュリティの基本と脅威モデルを理解する。",
    children: ["security-2a", "security-2b"],
  },
  {
    id: "ai-1",
    label: "AI/ML入門",
    category: "ai",
    status: "available",
    x: X.ai, y: 250,
    tier: 1,
    description: "機械学習の基本概念とPythonデータサイエンスの入門。",
    children: ["ai-2a", "ai-2b"],
  },
  {
    id: "web-1",
    label: "Web入門",
    category: "web",
    status: "available",
    x: X.web, y: 250,
    tier: 1,
    description: "HTML/CSS/JavaScriptを理解し、Webの仕組みを学ぶ。",
    children: ["web-2a", "web-2b"],
  },
  {
    id: "design-1",
    label: "デザイン入門",
    category: "design",
    status: "available",
    x: X.design, y: 250,
    tier: 1,
    description: "UI/UXデザインの基本原則とデザインツールを習得する。",
    children: ["design-2a", "design-2b"],
  },
  {
    id: "game-1",
    label: "ゲーム開発入門",
    category: "game",
    status: "available",
    x: X.game, y: 250,
    tier: 1,
    description: "ゲームエンジンと基本的なゲーム開発の概念を学ぶ。",
    children: ["game-2a", "game-2b"],
  },

  // =====================================================
  //  TIER 2 — 各ジャンルの基礎スキル（各2ノード）
  // =====================================================

  // --- Infra ---
  {
    id: "infra-2a",
    label: "コンテナ技術",
    category: "infra",
    status: "locked",
    x: X.infra - 130, y: 50,
    tier: 2,
    description: "Docker・コンテナの基本概念と運用を習得する。",
    children: ["infra-3"],
  },
  {
    id: "infra-2b",
    label: "クラウド基礎",
    category: "infra",
    status: "locked",
    x: X.infra + 130, y: 50,
    tier: 2,
    description: "AWS/GCP/Azureの主要サービスを理解する。",
    children: ["infra-3"],
  },

  // --- Security ---
  {
    id: "security-2a",
    label: "Webセキュリティ",
    category: "security",
    status: "locked",
    x: X.security - 130, y: 50,
    tier: 2,
    description: "XSS・CSRF・SQLインジェクションなどの攻撃と防御。",
    children: ["security-3"],
  },
  {
    id: "security-2b",
    label: "ネットワーク防御",
    category: "security",
    status: "locked",
    x: X.security + 130, y: 50,
    tier: 2,
    description: "ファイアウォール・IDS/IPS・VPNの設定と管理。",
    children: ["security-3"],
  },

  // --- AI ---
  {
    id: "ai-2a",
    label: "機械学習応用",
    category: "ai",
    status: "locked",
    x: X.ai - 130, y: 50,
    tier: 2,
    description: "教師あり/なし学習、モデル評価の中級スキル。",
    children: ["ai-3"],
  },
  {
    id: "ai-2b",
    label: "LLM基礎",
    category: "ai",
    status: "locked",
    x: X.ai + 130, y: 50,
    tier: 2,
    description: "大規模言語モデルの仕組みとプロンプトエンジニアリング。",
    children: ["ai-3"],
  },

  // --- Web ---
  {
    id: "web-2a",
    label: "フロントエンド",
    category: "web",
    status: "locked",
    x: X.web - 130, y: 50,
    tier: 2,
    description: "React/Next.jsを使ったモダンフロントエンド開発。",
    children: ["web-3"],
  },
  {
    id: "web-2b",
    label: "バックエンド",
    category: "web",
    status: "locked",
    x: X.web + 130, y: 50,
    tier: 2,
    description: "Node.js・API設計・データベースの基礎。",
    children: ["web-3"],
  },

  // --- Design ---
  {
    id: "design-2a",
    label: "UIデザイン",
    category: "design",
    status: "locked",
    x: X.design - 130, y: 50,
    tier: 2,
    description: "FigmaでUIコンポーネントを設計する。",
    children: ["design-3"],
  },
  {
    id: "design-2b",
    label: "UXリサーチ",
    category: "design",
    status: "locked",
    x: X.design + 130, y: 50,
    tier: 2,
    description: "ユーザーインタビューとユーザビリティテスト手法。",
    children: ["design-3"],
  },

  // --- Game ---
  {
    id: "game-2a",
    label: "ゲームエンジン",
    category: "game",
    status: "locked",
    x: X.game - 130, y: 50,
    tier: 2,
    description: "Unity/Unreal Engineの基本操作とシーン設計。",
    children: ["game-3"],
  },
  {
    id: "game-2b",
    label: "ゲームデザイン",
    category: "game",
    status: "locked",
    x: X.game + 130, y: 50,
    tier: 2,
    description: "ゲームメカニクス・レベルデザインの基礎理論。",
    children: ["game-3"],
  },

  // =====================================================
  //  TIER 3 — 各ジャンルの中級スキル（各1ノード）
  // =====================================================
  {
    id: "infra-3",
    label: "Kubernetes",
    category: "infra",
    status: "locked",
    x: X.infra, y: -150,
    tier: 3,
    description: "Kubernetesクラスター管理とオーケストレーション。",
    children: ["infra-4"],
  },
  {
    id: "security-3",
    label: "ペネトレーション",
    category: "security",
    status: "locked",
    x: X.security, y: -150,
    tier: 3,
    description: "脆弱性診断とペネトレーションテスト手法。",
    children: ["security-4"],
  },
  {
    id: "ai-3",
    label: "深層学習",
    category: "ai",
    status: "locked",
    x: X.ai, y: -150,
    tier: 3,
    description: "CNN・RNN・TransformerアーキテクチャとLLMアプリ構築。",
    children: ["ai-4"],
  },
  {
    id: "web-3",
    label: "フルスタック",
    category: "web",
    status: "locked",
    x: X.web, y: -150,
    tier: 3,
    description: "フロント/バック/DBを統合した開発力を身につける。",
    children: ["web-4"],
  },
  {
    id: "design-3",
    label: "デザインシステム",
    category: "design",
    status: "locked",
    x: X.design, y: -150,
    tier: 3,
    description: "スケーラブルなデザインシステムの構築と運用。",
    children: ["design-4"],
  },
  {
    id: "game-3",
    label: "ゲームプログラミング",
    category: "game",
    status: "locked",
    x: X.game, y: -150,
    tier: 3,
    description: "物理演算・シェーダー・最適化を駆使したゲーム開発。",
    children: ["game-4"],
  },

  // =====================================================
  //  TIER 4 — 各ジャンルの上級スキル（各1ノード）
  // =====================================================
  {
    id: "infra-4",
    label: "SREエンジニア",
    category: "infra",
    status: "locked",
    x: X.infra, y: -380,
    tier: 4,
    description: "信頼性エンジニアリング・SLO設計・インシデント対応。",
    children: [],
  },
  {
    id: "security-4",
    label: "セキュリティ設計",
    category: "security",
    status: "locked",
    x: X.security, y: -380,
    tier: 4,
    description: "ゼロトラスト・脅威モデリング・セキュリティアーキテクチャ。",
    children: [],
  },
  {
    id: "ai-4",
    label: "AIエンジニアリング",
    category: "ai",
    status: "locked",
    x: X.ai, y: -380,
    tier: 4,
    description: "AI/MLシステムの設計から本番運用まで。MLOps実践。",
    children: [],
  },
  {
    id: "web-4",
    label: "テックリード",
    category: "web",
    status: "locked",
    x: X.web, y: -380,
    tier: 4,
    description: "チームを技術的にリードし、アーキテクチャを設計する。",
    children: [],
  },
  {
    id: "design-4",
    label: "クリエイティブ技術",
    category: "design",
    status: "locked",
    x: X.design, y: -380,
    tier: 4,
    description: "3D・アニメーション・インタラクティブアートを統合する。",
    children: [],
  },
  {
    id: "game-4",
    label: "ゲームディレクター",
    category: "game",
    status: "locked",
    x: X.game, y: -380,
    tier: 4,
    description: "ゲーム全体の設計・開発・ローンチを主導する。",
    children: [],
  },
]

export function getNodeById(id: string): SkillNode | undefined {
  return SKILL_NODES.find((n) => n.id === id)
}
