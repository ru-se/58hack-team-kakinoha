export type NodeStatus = "completed" | "available" | "locked"
export type SkillCategory = "none" | "web" | "ai" | "security" | "infra" | "design" | "game" | "mixed"

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
  requiredPoints: number
  requiredPointsMap?: Partial<Record<SkillCategory, number>> // for mixed nodes
  importance?: number
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

const X = {
  infra: -1250,
  security: -750,
  ai: -250,
  web: 250,
  design: 750,
  game: 1250,
}

export const SKILL_NODES: SkillNode[] = [
  {
    id: "egg",
    label: "エンジニアの卵",
    category: "none",
    status: "completed",
    x: 0, y: 500,
    tier: 0,
    description: "すべてのエンジニアの出発点。ここから技術の旅が始まる。",
    children: ["infra-1", "security-1", "ai-1", "web-1", "design-1", "game-1"],
    requiredPoints: 0,
    importance: 0,
  },

  // --- Infra ---
  { id: "infra-1", label: "インフラ入門", category: "infra", status: "locked", x: X.infra, y: 250, tier: 1, description: "Linux・ネットワーク・サーバーの基礎。", children: ["infra-2"], requiredPoints: 1, importance: 10 },
  { id: "infra-2", label: "コンテナ＆クラウド", category: "infra", status: "locked", x: X.infra, y: 50, tier: 2, description: "Dockerの基本概念とクラウドの基礎。", children: ["infra-3", "mixed-is-1"], requiredPoints: 2, importance: 20 },
  { id: "infra-3", label: "IaC基礎", category: "infra", status: "locked", x: X.infra, y: -200, tier: 3, description: "TerraformやAnsibleによるインフラのコード化。", children: ["infra-4"], requiredPoints: 3, importance: 30 },
  { id: "infra-4", label: "Kubernetes", category: "infra", status: "locked", x: X.infra, y: -450, tier: 4, description: "Kubernetesによるコンテナオーケストレーション。", children: ["infra-5", "mixed-is-2"], requiredPoints: 4, importance: 40 },
  { id: "infra-5", label: "クラウドネイティブ", category: "infra", status: "locked", x: X.infra, y: -720, tier: 5, description: "高度なマイクロサービス運用技術。", children: ["infra-6"], requiredPoints: 5, importance: 50 },
  { id: "infra-6", label: "SREエンジニア", category: "infra", status: "locked", x: X.infra, y: -1000, tier: 6, description: "信頼性エンジニアリング・SLO設計・インシデント対応。", children: ["infra-7", "mixed-is-3"], requiredPoints: 6, importance: 60 },
  { id: "infra-7", label: "分散システム設計", category: "infra", status: "locked", x: X.infra, y: -1300, tier: 7, description: "グローバルに拡張可能な分散システムのアーキテクチャ。", children: ["infra-8"], requiredPoints: 7, importance: 70 },
  { id: "infra-8", label: "Platform Engineer", category: "infra", status: "locked", x: X.infra, y: -1600, tier: 8, description: "開発者のための究極の内部プラットフォーム構築。", children: ["mixed-is-4"], requiredPoints: 8, importance: 80 },

  // --- Security ---
  { id: "security-1", label: "セキュリティ入門", category: "security", status: "locked", x: X.security, y: 250, tier: 1, description: "情報セキュリティの基本と脅威モデル。", children: ["security-2"], requiredPoints: 1, importance: 10 },
  { id: "security-2", label: "Web攻撃と防御", category: "security", status: "locked", x: X.security, y: 50, tier: 2, description: "OWASP Top10などの主要なWeb脆弱性と対策。", children: ["security-3", "mixed-is-1", "mixed-sa-1"], requiredPoints: 2, importance: 20 },
  { id: "security-3", label: "暗号技術", category: "security", status: "locked", x: X.security, y: -200, tier: 3, description: "公開鍵暗号・ハッシュ関数・PKIの理論と実装。", children: ["security-4"], requiredPoints: 3, importance: 30 },
  { id: "security-4", label: "ペネトレーション", category: "security", status: "locked", x: X.security, y: -450, tier: 4, description: "脆弱性診断とペネトレーションテスト手法。", children: ["security-5", "mixed-is-2", "mixed-sa-2"], requiredPoints: 4, importance: 40 },
  { id: "security-5", label: "マルウェア解析", category: "security", status: "locked", x: X.security, y: -720, tier: 5, description: "リバースエンジニアリングと動的/静的解析。", children: ["security-6"], requiredPoints: 5, importance: 50 },
  { id: "security-6", label: "セキュリティ設計", category: "security", status: "locked", x: X.security, y: -1000, tier: 6, description: "ゼロトラスト・脅威モデリング・アーキテクチャ。", children: ["security-7", "mixed-is-3", "mixed-sa-3"], requiredPoints: 6, importance: 60 },
  { id: "security-7", label: "インシデントレスポンス", category: "security", status: "locked", x: X.security, y: -1300, tier: 7, description: "フォレンジック技術と高度なサイバー攻撃への対応。", children: ["security-8"], requiredPoints: 7, importance: 70 },
  { id: "security-8", label: "CISO", category: "security", status: "locked", x: X.security, y: -1600, tier: 8, description: "組織全体のセキュリティ戦略とガバナンスの統括。", children: ["mixed-is-4", "mixed-sa-4"], requiredPoints: 8, importance: 80 },

  // --- AI ---
  { id: "ai-1", label: "AI/ML入門", category: "ai", status: "locked", x: X.ai, y: 250, tier: 1, description: "機械学習の基本概念とPythonデータサイエンス。", children: ["ai-2"], requiredPoints: 1, importance: 10 },
  { id: "ai-2", label: "機械学習応用", category: "ai", status: "locked", x: X.ai, y: 50, tier: 2, description: "教師あり/なし学習の中級スキルと評価プロセス。", children: ["ai-3", "mixed-sa-1", "mixed-aw-1"], requiredPoints: 2, importance: 20 },
  { id: "ai-3", label: "深層学習基礎", category: "ai", status: "locked", x: X.ai, y: -200, tier: 3, description: "ニューラルネットワークの基礎とPyTorch/TensorFlow。", children: ["ai-4"], requiredPoints: 3, importance: 30 },
  { id: "ai-4", label: "LLMと生成AI", category: "ai", status: "locked", x: X.ai, y: -450, tier: 4, description: "Transformer・RAG・プロンプトエンジニアリング。", children: ["ai-5", "mixed-sa-2", "mixed-aw-2"], requiredPoints: 4, importance: 40 },
  { id: "ai-5", label: "コンピュータビジョン", category: "ai", status: "locked", x: X.ai, y: -720, tier: 5, description: "画像認識、物体検出、セグメンテーション。", children: ["ai-6"], requiredPoints: 5, importance: 50 },
  { id: "ai-6", label: "強化学習", category: "ai", status: "locked", x: X.ai, y: -1000, tier: 6, description: "エージェント学習と環境探索の高度なアルゴリズム。", children: ["ai-7", "mixed-sa-3", "mixed-aw-3"], requiredPoints: 6, importance: 60 },
  { id: "ai-7", label: "MLOps", category: "ai", status: "locked", x: X.ai, y: -1300, tier: 7, description: "AI/MLシステムの大規模かつ継続的な本番運用。", children: ["ai-8"], requiredPoints: 7, importance: 70 },
  { id: "ai-8", label: "AIリサーチャー", category: "ai", status: "locked", x: X.ai, y: -1600, tier: 8, description: "未知のAIアーキテクチャの探求と最先端研究。", children: ["mixed-sa-4", "mixed-aw-4"], requiredPoints: 8, importance: 80 },

  // --- Web ---
  { id: "web-1", label: "Web入門", category: "web", status: "locked", x: X.web, y: 250, tier: 1, description: "HTML/CSS/JavaScriptを理解し、Webの仕組みを学ぶ。", children: ["web-2"], requiredPoints: 1, importance: 10 },
  { id: "web-2", label: "フロントエンド基礎", category: "web", status: "locked", x: X.web, y: 50, tier: 2, description: "DOM操作とReact/Vueの基本的なコンポーネント開発。", children: ["web-3", "mixed-aw-1", "mixed-wd-1"], requiredPoints: 2, importance: 20 },
  { id: "web-3", label: "バックエンド基礎", category: "web", status: "locked", x: X.web, y: -200, tier: 3, description: "Node.js、API設計、およびRDBMSの基本操作。", children: ["web-4"], requiredPoints: 3, importance: 30 },
  { id: "web-4", label: "モダンフルスタック", category: "web", status: "locked", x: X.web, y: -450, tier: 4, description: "Next.jsなどを利用した高度なフルスタック開発。", children: ["web-5", "mixed-aw-2", "mixed-wd-2"], requiredPoints: 4, importance: 40 },
  { id: "web-5", label: "パフォーマンス最適化", category: "web", status: "locked", x: X.web, y: -720, tier: 5, description: "レンダリング最適化、キャッシュ戦略、通信の高速化。", children: ["web-6"], requiredPoints: 5, importance: 50 },
  { id: "web-6", label: "大規模Web設計", category: "web", status: "locked", x: X.web, y: -1000, tier: 6, description: "マイクロフロントエンドや分散バックエンドのアーキテクチャ。", children: ["web-7", "mixed-aw-3", "mixed-wd-3"], requiredPoints: 6, importance: 60 },
  { id: "web-7", label: "テックリード", category: "web", status: "locked", x: X.web, y: -1300, tier: 7, description: "チームとプロジェクトを技術的にリードする。", children: ["web-8"], requiredPoints: 7, importance: 70 },
  { id: "web-8", label: "VPoE", category: "web", status: "locked", x: X.web, y: -1600, tier: 8, description: "開発組織全体のマネジメントと技術戦略の決定。", children: ["mixed-aw-4", "mixed-wd-4"], requiredPoints: 8, importance: 80 },

  // --- Design ---
  { id: "design-1", label: "デザイン入門", category: "design", status: "locked", x: X.design, y: 250, tier: 1, description: "タイポグラフィ、色彩理論、レイアウトの基本。", children: ["design-2"], requiredPoints: 1, importance: 10 },
  { id: "design-2", label: "UI設計", category: "design", status: "locked", x: X.design, y: 50, tier: 2, description: "Figmaを用いた美しく使いやすいUIコンポーネント設計。", children: ["design-3", "mixed-wd-1", "mixed-dg-1"], requiredPoints: 2, importance: 20 },
  { id: "design-3", label: "UXリサーチ", category: "design", status: "locked", x: X.design, y: -200, tier: 3, description: "ユーザーインタビューとユーザビリティテスト手法。", children: ["design-4"], requiredPoints: 3, importance: 30 },
  { id: "design-4", label: "デザインシステム", category: "design", status: "locked", x: X.design, y: -450, tier: 4, description: "スケーラブルなデザインシステムの構築と運用。", children: ["design-5", "mixed-wd-2", "mixed-dg-2"], requiredPoints: 4, importance: 40 },
  { id: "design-5", label: "インタラクション", category: "design", status: "locked", x: X.design, y: -720, tier: 5, description: "マイクロインタラクションとスムーズなアニメーション。", children: ["design-6"], requiredPoints: 5, importance: 50 },
  { id: "design-6", label: "Service Design", category: "design", status: "locked", x: X.design, y: -1000, tier: 6, description: "顧客体験（CX）全般を設計するサービスデザイン。", children: ["design-7", "mixed-wd-3", "mixed-dg-3"], requiredPoints: 6, importance: 60 },
  { id: "design-7", label: "クリエイティブ技術", category: "design", status: "locked", x: X.design, y: -1300, tier: 7, description: "WebGLや3Dを組み込んだ新次元のWeb表現。", children: ["design-8"], requiredPoints: 7, importance: 70 },
  { id: "design-8", label: "CDO", category: "design", status: "locked", x: X.design, y: -1600, tier: 8, description: "企業のデザイン戦略とクリエイティブの最高責任者。", children: ["mixed-wd-4", "mixed-dg-4"], requiredPoints: 8, importance: 80 },

  // --- Game ---
  { id: "game-1", label: "ゲーム開発入門", category: "game", status: "locked", x: X.game, y: 250, tier: 1, description: "ゲームエンジンと基本的なゲーム開発の概念を学ぶ。", children: ["game-2"], requiredPoints: 1, importance: 10 },
  { id: "game-2", label: "ゲームメカニクス", category: "game", status: "locked", x: X.game, y: 50, tier: 2, description: "プレイヤー体験を面白くする基本ルールの設計。", children: ["game-3", "mixed-dg-1"], requiredPoints: 2, importance: 20 },
  { id: "game-3", label: "3D数学＆物理", category: "game", status: "locked", x: X.game, y: -200, tier: 3, description: "ベクトル、クォータニオン、衝突判定の計算。", children: ["game-4"], requiredPoints: 3, importance: 30 },
  { id: "game-4", label: "シェーダープログラミング", category: "game", status: "locked", x: X.game, y: -450, tier: 4, description: "HLSL/GLSL等を用いた高度なグラフィック表現。", children: ["game-5", "mixed-dg-2"], requiredPoints: 4, importance: 40 },
  { id: "game-5", label: "ネットワーク同期", category: "game", status: "locked", x: X.game, y: -720, tier: 5, description: "マルチプレイヤーゲームにおける状態同期と予測。", children: ["game-6"], requiredPoints: 5, importance: 50 },
  { id: "game-6", label: "ゲームエンジン開発", category: "game", status: "locked", x: X.game, y: -1000, tier: 6, description: "低レイヤーAPIを用いたカスタムゲームエンジンの構築。", children: ["game-7", "mixed-dg-3"], requiredPoints: 6, importance: 60 },
  { id: "game-7", label: "ゲームディレクター", category: "game", status: "locked", x: X.game, y: -1300, tier: 7, description: "ゲーム全体の設計・開発・ローンチを主導する。", children: ["game-8"], requiredPoints: 7, importance: 70 },
  { id: "game-8", label: "マスタークリエイター", category: "game", status: "locked", x: X.game, y: -1600, tier: 8, description: "世界を熱狂させるAAAゲームタイトルの創造神。", children: ["mixed-dg-4"], requiredPoints: 8, importance: 80 },

  // === Mixed Nodes ===

  // Tier 2.5 (Req 2)
  { id: "mixed-is-1", label: "セキュアクラウド", category: "mixed", status: "locked", x: (X.infra + X.security) / 2, y: -80, tier: 3, description: "クラウド環境の安全な構築。", children: [], requiredPoints: 0, requiredPointsMap: { infra: 2, security: 2 }, importance: 35 },
  { id: "mixed-sa-1", label: "AI攻撃検知", category: "mixed", status: "locked", x: (X.security + X.ai) / 2, y: -80, tier: 3, description: "機械学習を用いた異常検知と防御。", children: [], requiredPoints: 0, requiredPointsMap: { security: 2, ai: 2 }, importance: 35 },
  { id: "mixed-aw-1", label: "AI-API連携", category: "mixed", status: "locked", x: (X.ai + X.web) / 2, y: -80, tier: 3, description: "推論APIを組み込んだフロントエンド。", children: [], requiredPoints: 0, requiredPointsMap: { ai: 2, web: 2 }, importance: 35 },
  { id: "mixed-wd-1", label: "UI実装力", category: "mixed", status: "locked", x: (X.web + X.design) / 2, y: -80, tier: 3, description: "Figmaデザインを完璧なコードに落とし込む力。", children: [], requiredPoints: 0, requiredPointsMap: { web: 2, design: 2 }, importance: 35 },
  { id: "mixed-dg-1", label: "UIアニメーション", category: "mixed", status: "locked", x: (X.design + X.game) / 2, y: -80, tier: 3, description: "ゲームライクで心地よい画面遷移とフィードバック。", children: [], requiredPoints: 0, requiredPointsMap: { design: 2, game: 2 }, importance: 35 },

  // Tier 4.5 (Req 4)
  { id: "mixed-is-2", label: "DevSecOps", category: "mixed", status: "locked", x: (X.infra + X.security) / 2, y: -590, tier: 5, description: "CI/CDパイプライン全体へのセキュリティ統合。", children: [], requiredPoints: 0, requiredPointsMap: { infra: 4, security: 4 }, importance: 55 },
  { id: "mixed-sa-2", label: "AIセキュリティ", category: "mixed", status: "locked", x: (X.security + X.ai) / 2, y: -590, tier: 5, description: "プロンプトインジェクションに対する堅牢な防御。", children: [], requiredPoints: 0, requiredPointsMap: { security: 4, ai: 4 }, importance: 55 },
  { id: "mixed-aw-2", label: "AI駆動Webアプリ", category: "mixed", status: "locked", x: (X.ai + X.web) / 2, y: -590, tier: 5, description: "LLMを密接に組み込んだ次世代のサービス提供。", children: [], requiredPoints: 0, requiredPointsMap: { ai: 4, web: 4 }, importance: 55 },
  { id: "mixed-wd-2", label: "UXエンジニア", category: "mixed", status: "locked", x: (X.web + X.design) / 2, y: -590, tier: 5, description: "ユーザー体験と実装技術の最高レベルの融合。", children: [], requiredPoints: 0, requiredPointsMap: { web: 4, design: 4 }, importance: 55 },
  { id: "mixed-dg-2", label: "テクニカルアート", category: "mixed", status: "locked", x: (X.design + X.game) / 2, y: -590, tier: 5, description: "デザイナーのビジョンをプログラムとシェーダーで実現する。", children: [], requiredPoints: 0, requiredPointsMap: { design: 4, game: 4 }, importance: 55 },

  // Tier 6.5 (Req 6)
  { id: "mixed-is-3", label: "ゼロトラストSRE", category: "mixed", status: "locked", x: (X.infra + X.security) / 2, y: -1150, tier: 7, description: "すべての通信を検証する堅牢かつ高可用なインフラ運用。", children: [], requiredPoints: 0, requiredPointsMap: { infra: 6, security: 6 }, importance: 75 },
  { id: "mixed-sa-3", label: "Adversarial ML", category: "mixed", status: "locked", x: (X.security + X.ai) / 2, y: -1150, tier: 7, description: "敵対的サンプルに対するAIモデルの堅牢化技術。", children: [], requiredPoints: 0, requiredPointsMap: { security: 6, ai: 6 }, importance: 75 },
  { id: "mixed-aw-3", label: "MLOps on Web", category: "mixed", status: "locked", x: (X.ai + X.web) / 2, y: -1150, tier: 7, description: "Webシステム全体のメトリクスによるAIの自己改善ループ。", children: [], requiredPoints: 0, requiredPointsMap: { ai: 6, web: 6 }, importance: 75 },
  { id: "mixed-wd-3", label: "デザインエンジニア", category: "mixed", status: "locked", x: (X.web + X.design) / 2, y: -1150, tier: 7, description: "デザインシステムとWebコンポーネントの完全な統括。", children: [], requiredPoints: 0, requiredPointsMap: { web: 6, design: 6 }, importance: 75 },
  { id: "mixed-dg-3", label: "XRクリエイター", category: "mixed", status: "locked", x: (X.design + X.game) / 2, y: -1150, tier: 7, description: "VR/AR空間における没入感の高いユーザー体験設計。", children: [], requiredPoints: 0, requiredPointsMap: { design: 6, game: 6 }, importance: 75 },

  // Tier 8.5 (Req 8)
  { id: "mixed-is-4", label: "サイバー要塞", category: "mixed", status: "locked", x: (X.infra + X.security) / 2, y: -1750, tier: 9, description: "国家レベルの攻撃すら防ぐ無敵のインフラ基盤。", children: [], requiredPoints: 0, requiredPointsMap: { infra: 8, security: 8 }, importance: 95 },
  { id: "mixed-sa-4", label: "AGI防衛機構", category: "mixed", status: "locked", x: (X.security + X.ai) / 2, y: -1750, tier: 9, description: "汎用人工知能のリスクをコントロールする究極の防御網。", children: [], requiredPoints: 0, requiredPointsMap: { security: 8, ai: 8 }, importance: 95 },
  { id: "mixed-aw-4", label: "自律型Web帝国", category: "mixed", status: "locked", x: (X.ai + X.web) / 2, y: -1750, tier: 9, description: "AIが自ら設計・構築し拡張するWebシステムの創造。", children: [], requiredPoints: 0, requiredPointsMap: { ai: 8, web: 8 }, importance: 95 },
  { id: "mixed-wd-4", label: "デジタルアート最高神", category: "mixed", status: "locked", x: (X.web + X.design) / 2, y: -1750, tier: 9, description: "Web技術を用いて人類の感性を拡張する究極の表現者。", children: [], requiredPoints: 0, requiredPointsMap: { web: 8, design: 8 }, importance: 95 },
  { id: "mixed-dg-4", label: "メタバース創造主", category: "mixed", status: "locked", x: (X.design + X.game) / 2, y: -1750, tier: 9, description: "デザインとゲームエンジンの境地を超えた次なる現実の創造。", children: [], requiredPoints: 0, requiredPointsMap: { design: 8, game: 8 }, importance: 95 },
]

export function getNodeById(id: string): SkillNode | undefined {
  return SKILL_NODES.find((n) => n.id === id)
}
