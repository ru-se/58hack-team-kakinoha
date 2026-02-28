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
    description: "無限の可能性を秘めた存在。ここから壮大な進化が始まる。",
    children: ["infra-1", "security-1", "ai-1", "web-1", "design-1", "game-1"],
    requiredPoints: 0,
    importance: 0,
  },

  // --- Infra ---
  { id: "infra-1", label: "見習いインフラエンジニア", category: "infra", status: "locked", x: X.infra, y: 250, tier: 1, description: "まだまだ駆け出し。これから果てしない技術の探求が始まる。", children: ["infra-2"], requiredPoints: 1, importance: 10 },
  { id: "infra-2", label: "ジュニアインフラエンジニア", category: "infra", status: "locked", x: X.infra, y: 50, tier: 2, description: "基礎を身につけ、実戦で経験を積み始めた期待の若手。", children: ["infra-3", "mixed-is-1"], requiredPoints: 2, importance: 20 },
  { id: "infra-3", label: "一人前インフラエンジニア", category: "infra", status: "locked", x: X.infra, y: -200, tier: 3, description: "自立したプロフェッショナル。現場の主力として力強く活躍する。", children: ["infra-4"], requiredPoints: 3, importance: 30 },
  { id: "infra-4", label: "シニアインフラエンジニア", category: "infra", status: "locked", x: X.infra, y: -450, tier: 4, description: "豊富な経験でチームを導き、困難な局面を打破する頼りになる存在。", children: ["infra-5", "mixed-is-2"], requiredPoints: 4, importance: 40 },
  { id: "infra-5", label: "エキスパートインフラエンジニア", category: "infra", status: "locked", x: X.infra, y: -720, tier: 5, description: "卓越した専門知識を持ち、あらゆる複雑な課題を独力で解決する。", children: ["infra-6"], requiredPoints: 5, importance: 50 },
  { id: "infra-6", label: "マスターインフラエンジニア", category: "infra", status: "locked", x: X.infra, y: -1000, tier: 6, description: "その道を完全に極めし者。洗練された技術は周囲を圧倒する。", children: ["infra-7", "mixed-is-3"], requiredPoints: 6, importance: 60 },
  { id: "infra-7", label: "レジェンドインフラエンジニア", category: "infra", status: "locked", x: X.infra, y: -1300, tier: 7, description: "業界に名を轟かせる生ける伝説。もはやその辞書に不可能の文字はない。", children: ["infra-8"], requiredPoints: 7, importance: 70 },
  { id: "infra-8", label: "インフラの創造神", category: "infra", status: "locked", x: X.infra, y: -1600, tier: 8, description: "全てを統べる神の領域。世界そのものを一から創造・改変する絶対的な力を持つ。", children: ["mixed-is-4"], requiredPoints: 8, importance: 80 },

  // --- Security ---
  { id: "security-1", label: "見習いセキュリティエンジニア", category: "security", status: "locked", x: X.security, y: 250, tier: 1, description: "まだまだ駆け出し。これから果てしない技術の探求が始まる。", children: ["security-2"], requiredPoints: 1, importance: 10 },
  { id: "security-2", label: "ジュニアセキュリティエンジニア", category: "security", status: "locked", x: X.security, y: 50, tier: 2, description: "基礎を身につけ、実戦で経験を積み始めた期待の若手。", children: ["security-3", "mixed-is-1", "mixed-sa-1"], requiredPoints: 2, importance: 20 },
  { id: "security-3", label: "一人前セキュリティエンジニア", category: "security", status: "locked", x: X.security, y: -200, tier: 3, description: "自立したプロフェッショナル。現場の主力として力強く活躍する。", children: ["security-4"], requiredPoints: 3, importance: 30 },
  { id: "security-4", label: "シニアセキュリティエンジニア", category: "security", status: "locked", x: X.security, y: -450, tier: 4, description: "豊富な経験でチームを導き、困難な局面を打破する頼りになる存在。", children: ["security-5", "mixed-is-2", "mixed-sa-2"], requiredPoints: 4, importance: 40 },
  { id: "security-5", label: "エキスパートセキュリティエンジニア", category: "security", status: "locked", x: X.security, y: -720, tier: 5, description: "卓越した専門知識を持ち、あらゆる複雑な課題を独力で解決する。", children: ["security-6"], requiredPoints: 5, importance: 50 },
  { id: "security-6", label: "マスターセキュリティエンジニア", category: "security", status: "locked", x: X.security, y: -1000, tier: 6, description: "その道を完全に極めし者。洗練された技術は周囲を圧倒する。", children: ["security-7", "mixed-is-3", "mixed-sa-3"], requiredPoints: 6, importance: 60 },
  { id: "security-7", label: "レジェンドセキュリティエンジニア", category: "security", status: "locked", x: X.security, y: -1300, tier: 7, description: "業界に名を轟かせる生ける伝説。もはやその辞書に不可能の文字はない。", children: ["security-8"], requiredPoints: 7, importance: 70 },
  { id: "security-8", label: "セキュリティの創造神", category: "security", status: "locked", x: X.security, y: -1600, tier: 8, description: "全てを統べる神の領域。世界そのものを一から創造・改変する絶対的な力を持つ。", children: ["mixed-is-4", "mixed-sa-4"], requiredPoints: 8, importance: 80 },

  // --- AI ---
  { id: "ai-1", label: "見習いAIエンジニア", category: "ai", status: "locked", x: X.ai, y: 250, tier: 1, description: "まだまだ駆け出し。これから果てしない技術の探求が始まる。", children: ["ai-2"], requiredPoints: 1, importance: 10 },
  { id: "ai-2", label: "ジュニアAIエンジニア", category: "ai", status: "locked", x: X.ai, y: 50, tier: 2, description: "基礎を身につけ、実戦で経験を積み始めた期待の若手。", children: ["ai-3", "mixed-sa-1", "mixed-aw-1"], requiredPoints: 2, importance: 20 },
  { id: "ai-3", label: "一人前AIエンジニア", category: "ai", status: "locked", x: X.ai, y: -200, tier: 3, description: "自立したプロフェッショナル。現場の主力として力強く活躍する。", children: ["ai-4"], requiredPoints: 3, importance: 30 },
  { id: "ai-4", label: "シニアAIエンジニア", category: "ai", status: "locked", x: X.ai, y: -450, tier: 4, description: "豊富な経験でチームを導き、困難な局面を打破する頼りになる存在。", children: ["ai-5", "mixed-sa-2", "mixed-aw-2"], requiredPoints: 4, importance: 40 },
  { id: "ai-5", label: "エキスパートAIエンジニア", category: "ai", status: "locked", x: X.ai, y: -720, tier: 5, description: "卓越した専門知識を持ち、あらゆる複雑な課題を独力で解決する。", children: ["ai-6"], requiredPoints: 5, importance: 50 },
  { id: "ai-6", label: "マスターAIエンジニア", category: "ai", status: "locked", x: X.ai, y: -1000, tier: 6, description: "その道を完全に極めし者。洗練された技術は周囲を圧倒する。", children: ["ai-7", "mixed-sa-3", "mixed-aw-3"], requiredPoints: 6, importance: 60 },
  { id: "ai-7", label: "レジェンドAIエンジニア", category: "ai", status: "locked", x: X.ai, y: -1300, tier: 7, description: "業界に名を轟かせる生ける伝説。もはやその辞書に不可能の文字はない。", children: ["ai-8"], requiredPoints: 7, importance: 70 },
  { id: "ai-8", label: "AIの創造神", category: "ai", status: "locked", x: X.ai, y: -1600, tier: 8, description: "全てを統べる神の領域。世界そのものを一から創造・改変する絶対的な力を持つ。", children: ["mixed-sa-4", "mixed-aw-4"], requiredPoints: 8, importance: 80 },

  // --- Web ---
  { id: "web-1", label: "見習いWebエンジニア", category: "web", status: "locked", x: X.web, y: 250, tier: 1, description: "まだまだ駆け出し。これから果てしない技術の探求が始まる。", children: ["web-2"], requiredPoints: 1, importance: 10 },
  { id: "web-2", label: "ジュニアWebエンジニア", category: "web", status: "locked", x: X.web, y: 50, tier: 2, description: "基礎を身につけ、実戦で経験を積み始めた期待の若手。", children: ["web-3", "mixed-aw-1", "mixed-wd-1"], requiredPoints: 2, importance: 20 },
  { id: "web-3", label: "一人前Webエンジニア", category: "web", status: "locked", x: X.web, y: -200, tier: 3, description: "自立したプロフェッショナル。現場の主力として力強く活躍する。", children: ["web-4"], requiredPoints: 3, importance: 30 },
  { id: "web-4", label: "シニアWebエンジニア", category: "web", status: "locked", x: X.web, y: -450, tier: 4, description: "豊富な経験でチームを導き、困難な局面を打破する頼りになる存在。", children: ["web-5", "mixed-aw-2", "mixed-wd-2"], requiredPoints: 4, importance: 40 },
  { id: "web-5", label: "エキスパートWebエンジニア", category: "web", status: "locked", x: X.web, y: -720, tier: 5, description: "卓越した専門知識を持ち、あらゆる複雑な課題を独力で解決する。", children: ["web-6"], requiredPoints: 5, importance: 50 },
  { id: "web-6", label: "マスターWebエンジニア", category: "web", status: "locked", x: X.web, y: -1000, tier: 6, description: "その道を完全に極めし者。洗練された技術は周囲を圧倒する。", children: ["web-7", "mixed-aw-3", "mixed-wd-3"], requiredPoints: 6, importance: 60 },
  { id: "web-7", label: "レジェンドWebエンジニア", category: "web", status: "locked", x: X.web, y: -1300, tier: 7, description: "業界に名を轟かせる生ける伝説。もはやその辞書に不可能の文字はない。", children: ["web-8"], requiredPoints: 7, importance: 70 },
  { id: "web-8", label: "Webの創造神", category: "web", status: "locked", x: X.web, y: -1600, tier: 8, description: "全てを統べる神の領域。世界そのものを一から創造・改変する絶対的な力を持つ。", children: ["mixed-aw-4", "mixed-wd-4"], requiredPoints: 8, importance: 80 },

  // --- Design ---
  { id: "design-1", label: "見習いUI/UXデザイナー", category: "design", status: "locked", x: X.design, y: 250, tier: 1, description: "まだまだ駆け出し。これから果てしない技術の探求が始まる。", children: ["design-2"], requiredPoints: 1, importance: 10 },
  { id: "design-2", label: "ジュニアUI/UXデザイナー", category: "design", status: "locked", x: X.design, y: 50, tier: 2, description: "基礎を身につけ、実戦で経験を積み始めた期待の若手。", children: ["design-3", "mixed-wd-1", "mixed-dg-1"], requiredPoints: 2, importance: 20 },
  { id: "design-3", label: "一人前UI/UXデザイナー", category: "design", status: "locked", x: X.design, y: -200, tier: 3, description: "自立したプロフェッショナル。現場の主力として力強く活躍する。", children: ["design-4"], requiredPoints: 3, importance: 30 },
  { id: "design-4", label: "シニアUI/UXデザイナー", category: "design", status: "locked", x: X.design, y: -450, tier: 4, description: "豊富な経験でチームを導き、困難な局面を打破する頼りになる存在。", children: ["design-5", "mixed-wd-2", "mixed-dg-2"], requiredPoints: 4, importance: 40 },
  { id: "design-5", label: "エキスパートUI/UXデザイナー", category: "design", status: "locked", x: X.design, y: -720, tier: 5, description: "卓越した専門知識を持ち、あらゆる複雑な課題を独力で解決する。", children: ["design-6"], requiredPoints: 5, importance: 50 },
  { id: "design-6", label: "マスターUI/UXデザイナー", category: "design", status: "locked", x: X.design, y: -1000, tier: 6, description: "その道を完全に極めし者。洗練された技術は周囲を圧倒する。", children: ["design-7", "mixed-wd-3", "mixed-dg-3"], requiredPoints: 6, importance: 60 },
  { id: "design-7", label: "レジェンドUI/UXデザイナー", category: "design", status: "locked", x: X.design, y: -1300, tier: 7, description: "業界に名を轟かせる生ける伝説。もはやその辞書に不可能の文字はない。", children: ["design-8"], requiredPoints: 7, importance: 70 },
  { id: "design-8", label: "デザインの創造神", category: "design", status: "locked", x: X.design, y: -1600, tier: 8, description: "全てを統べる神の領域。世界そのものを一から創造・改変する絶対的な力を持つ。", children: ["mixed-wd-4", "mixed-dg-4"], requiredPoints: 8, importance: 80 },

  // --- Game ---
  { id: "game-1", label: "見習いゲームクリエイター", category: "game", status: "locked", x: X.game, y: 250, tier: 1, description: "まだまだ駆け出し。これから果てしない技術の探求が始まる。", children: ["game-2"], requiredPoints: 1, importance: 10 },
  { id: "game-2", label: "ジュニアゲームクリエイター", category: "game", status: "locked", x: X.game, y: 50, tier: 2, description: "基礎を身につけ、実戦で経験を積み始めた期待の若手。", children: ["game-3", "mixed-dg-1"], requiredPoints: 2, importance: 20 },
  { id: "game-3", label: "一人前ゲームクリエイター", category: "game", status: "locked", x: X.game, y: -200, tier: 3, description: "自立したプロフェッショナル。現場の主力として力強く活躍する。", children: ["game-4"], requiredPoints: 3, importance: 30 },
  { id: "game-4", label: "シニアゲームクリエイター", category: "game", status: "locked", x: X.game, y: -450, tier: 4, description: "豊富な経験でチームを導き、困難な局面を打破する頼りになる存在。", children: ["game-5", "mixed-dg-2"], requiredPoints: 4, importance: 40 },
  { id: "game-5", label: "エキスパートゲームクリエイター", category: "game", status: "locked", x: X.game, y: -720, tier: 5, description: "卓越した専門知識を持ち、あらゆる複雑な課題を独力で解決する。", children: ["game-6"], requiredPoints: 5, importance: 50 },
  { id: "game-6", label: "マスターゲームクリエイター", category: "game", status: "locked", x: X.game, y: -1000, tier: 6, description: "その道を完全に極めし者。洗練された技術は周囲を圧倒する。", children: ["game-7", "mixed-dg-3"], requiredPoints: 6, importance: 60 },
  { id: "game-7", label: "レジェンドゲームクリエイター", category: "game", status: "locked", x: X.game, y: -1300, tier: 7, description: "業界に名を轟かせる生ける伝説。もはやその辞書に不可能の文字はない。", children: ["game-8"], requiredPoints: 7, importance: 70 },
  { id: "game-8", label: "ゲームの創造神", category: "game", status: "locked", x: X.game, y: -1600, tier: 8, description: "全てを統べる神の領域。世界そのものを一から創造・改変する絶対的な力を持つ。", children: ["mixed-dg-4"], requiredPoints: 8, importance: 80 },

  // === Mixed Nodes (Achievements / Epithets) ===

  // Tier 2.5 (Req 3, Imp 100)
  { id: "mixed-is-1", label: "【鉄壁の雲守】 セキュア・ガーディアン", category: "mixed", status: "locked", x: (X.infra + X.security) / 2, y: -80, tier: 3, description: "クラウド環境の安全な構築。", children: [], requiredPoints: 0, requiredPointsMap: { infra: 3, security: 3 }, importance: 100 },
  { id: "mixed-sa-1", label: "【機械の瞳】 アノマリー・ウォッチャー", category: "mixed", status: "locked", x: (X.security + X.ai) / 2, y: -80, tier: 3, description: "機械学習を用いた異常検知と防御。", children: [], requiredPoints: 0, requiredPointsMap: { security: 3, ai: 3 }, importance: 100 },
  { id: "mixed-aw-1", label: "【知能の橋渡】 AI・インテグレーター", category: "mixed", status: "locked", x: (X.ai + X.web) / 2, y: -80, tier: 3, description: "推論APIを組み込んだフロントエンド。", children: [], requiredPoints: 0, requiredPointsMap: { ai: 3, web: 3 }, importance: 100 },
  { id: "mixed-wd-1", label: "【美を刻む者】 ピクセル・メイカー", category: "mixed", status: "locked", x: (X.web + X.design) / 2, y: -80, tier: 3, description: "Figmaデザインを完璧なコードに落とし込む力。", children: [], requiredPoints: 0, requiredPointsMap: { web: 3, design: 3 }, importance: 100 },
  { id: "mixed-dg-1", label: "【魂の設計者】 モーション・ウィーバー", category: "mixed", status: "locked", x: (X.design + X.game) / 2, y: -80, tier: 3, description: "ゲームライクで心地よい画面遷移とフィードバック。", children: [], requiredPoints: 0, requiredPointsMap: { design: 3, game: 3 }, importance: 100 },

  // Tier 4.5 (Req 5, Imp 200)
  { id: "mixed-is-2", label: "【守護の自動化】 DevSecOpsマスター", category: "mixed", status: "locked", x: (X.infra + X.security) / 2, y: -590, tier: 5, description: "CI/CDパイプライン全体へのセキュリティ統合。", children: [], requiredPoints: 0, requiredPointsMap: { infra: 5, security: 5 }, importance: 200 },
  { id: "mixed-sa-2", label: "【深層の盾】 プロンプト・シールド", category: "mixed", status: "locked", x: (X.security + X.ai) / 2, y: -590, tier: 5, description: "プロンプトインジェクションに対する堅牢な防御。", children: [], requiredPoints: 0, requiredPointsMap: { security: 5, ai: 5 }, importance: 200 },
  { id: "mixed-aw-2", label: "【次代の喚起者】 コグニティブ・クリエイター", category: "mixed", status: "locked", x: (X.ai + X.web) / 2, y: -590, tier: 5, description: "LLMを密接に組み込んだ次世代のサービス提供。", children: [], requiredPoints: 0, requiredPointsMap: { ai: 5, web: 5 }, importance: 200 },
  { id: "mixed-wd-2", label: "【体験を統べる者】 UX・アーキテクト", category: "mixed", status: "locked", x: (X.web + X.design) / 2, y: -590, tier: 5, description: "ユーザー体験と実装技術の最高レベルの融合。", children: [], requiredPoints: 0, requiredPointsMap: { web: 5, design: 5 }, importance: 200 },
  { id: "mixed-dg-2", label: "【魔術的描画】 テクニカル・アルケミスト", category: "mixed", status: "locked", x: (X.design + X.game) / 2, y: -590, tier: 5, description: "デザイナーのビジョンをプログラムとシェーダーで実現する。", children: [], requiredPoints: 0, requiredPointsMap: { design: 5, game: 5 }, importance: 200 },

  // Tier 6.5 (Req 7, Imp 300)
  { id: "mixed-is-3", label: "【絶対不可侵】 ゼロトラスト・ロード", category: "mixed", status: "locked", x: (X.infra + X.security) / 2, y: -1150, tier: 7, description: "すべての通信を検証する堅牢かつ高可用なインフラ運用。", children: [], requiredPoints: 0, requiredPointsMap: { infra: 7, security: 7 }, importance: 300 },
  { id: "mixed-sa-3", label: "【欺瞞の看破者】 アンチ・アドバーサリアル", category: "mixed", status: "locked", x: (X.security + X.ai) / 2, y: -1150, tier: 7, description: "敵対的サンプルに対するAIモデルの堅牢化技術。", children: [], requiredPoints: 0, requiredPointsMap: { security: 7, ai: 7 }, importance: 300 },
  { id: "mixed-aw-3", label: "【無限の適応】 メトリクス・ルーラー", category: "mixed", status: "locked", x: (X.ai + X.web) / 2, y: -1150, tier: 7, description: "Webシステム全体のメトリクスによるAIの自己改善ループ。", children: [], requiredPoints: 0, requiredPointsMap: { ai: 7, web: 7 }, importance: 300 },
  { id: "mixed-wd-3", label: "【黄金の架け橋】 ビジュアル・エンジニア", category: "mixed", status: "locked", x: (X.web + X.design) / 2, y: -1150, tier: 7, description: "デザインシステムとWebコンポーネントの完全な統括。", children: [], requiredPoints: 0, requiredPointsMap: { web: 7, design: 7 }, importance: 300 },
  { id: "mixed-dg-3", label: "【現実の拡張者】 イリュージョン・ダイバー", category: "mixed", status: "locked", x: (X.design + X.game) / 2, y: -1150, tier: 7, description: "VR/AR空間における没入感の高いユーザー体験設計。", children: [], requiredPoints: 0, requiredPointsMap: { design: 7, game: 7 }, importance: 300 },

  // Tier 8.5 (Req 8, Imp 400) - Max points possible is 8, so requiring 8 means completing both full paths
  { id: "mixed-is-4", label: "【難攻不落の神盾】 サイバー・イージス", category: "mixed", status: "locked", x: (X.infra + X.security) / 2, y: -1750, tier: 9, description: "国家レベルの攻撃すら防ぐ無敵のインフラ基盤。", children: [], requiredPoints: 0, requiredPointsMap: { infra: 8, security: 8 }, importance: 400 },
  { id: "mixed-sa-4", label: "【知の特異点監視者】 シンギュラリティ・ウォッチ", category: "mixed", status: "locked", x: (X.security + X.ai) / 2, y: -1750, tier: 9, description: "汎用人工知能のリスクをコントロールする究極の防御網。", children: [], requiredPoints: 0, requiredPointsMap: { security: 8, ai: 8 }, importance: 400 },
  { id: "mixed-aw-4", label: "【帝国を創る者】 オートノマス・エンペラー", category: "mixed", status: "locked", x: (X.ai + X.web) / 2, y: -1750, tier: 9, description: "AIが自ら設計・構築し拡張するWebシステムの創造。", children: [], requiredPoints: 0, requiredPointsMap: { ai: 8, web: 8 }, importance: 400 },
  { id: "mixed-wd-4", label: "【電脳の創造神】 デジタル・デミウルゴス", category: "mixed", status: "locked", x: (X.web + X.design) / 2, y: -1750, tier: 9, description: "Web技術を用いて人類の感性を拡張する究極の表現者。", children: [], requiredPoints: 0, requiredPointsMap: { web: 8, design: 8 }, importance: 400 },
  { id: "mixed-dg-4", label: "【新世界の神】 メタバース・ジェネシス", category: "mixed", status: "locked", x: (X.design + X.game) / 2, y: -1750, tier: 9, description: "デザインとゲームエンジンの境地を超えた次なる現実の創造。", children: [], requiredPoints: 0, requiredPointsMap: { design: 8, game: 8 }, importance: 400 },
]

export function getNodeById(id: string): SkillNode | undefined {
  return SKILL_NODES.find((n) => n.id === id)
}
