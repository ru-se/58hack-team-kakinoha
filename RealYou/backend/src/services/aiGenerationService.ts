import { GoogleGenerativeAI } from '@google/generative-ai';

// --- 型定義 ---
export type GeneratedQuizData = {
    title: string;
    max_points: number;           // 10〜100 の10刻み
    genres: Record<string, number>; // 1〜2ジャンル、合計1.0
    questions: {
        order_num: number;
        question_text: string;
        options: string[];           // 必ず4要素
        correct_index: number;       // 0〜3
    }[];
};

// --- 定数 ---
const VALID_GENRES = ['web', 'ai', 'security', 'infrastructure', 'design', 'game'];

const SYSTEM_PROMPT = `あなたは技術系LTの内容からクイズを生成するAIです。
制約
問題数: 3〜8問（プレゼン内容の密度に応じて判断）
選択肢: 各問題につき必ず4択
correct_index: 0〜3の整数（options配列のインデックス）
max_points: 10〜100の範囲で10刻みの整数（問題の難易度・量に応じて判断）

ジャンル選定ルール
プレゼン内容を分析し、最も関連するジャンルを1〜2つ選ぶこと
3つ以上選ばないこと
値の合計が必ず1.0になること
1ジャンルだけの場合: { "web": 1.0 }
2ジャンルの場合: 関連度に応じて按分 例) { "web": 0.7, "ai": 0.3 }

使用可能ジャンル（このキー名のみ使用すること）
web          : Web開発
ai           : AI/機械学習
security     : セキュリティ
infrastructure: インフラ/DevOps
design       : UI/UXデザイン
game         : ゲーム開発

出力形式
JSONのみを出力すること。説明文・マークダウン・コードブロックは一切含めないこと。
出力スキーマ
{
  "title": "クイズのタイトル（プレゼンタイトルを参考に簡潔に）",
  "max_points": 数値,
  "genres": { "ジャンル名": 割合 },
  "questions": [
    {
      "order_num": 1,
      "question_text": "問題文",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "correct_index": 正解のインデックス
    }
  ]
}
出力例
{
  "title": "React Hooks 入門クイズ",
  "max_points": 60,
  "genres": { "web": 0.8, "ai": 0.2 },
  "questions": [
    {
      "order_num": 1,
      "question_text": "useState の返り値は何ですか？",
      "options": ["オブジェクト1つ", "配列2要素", "関数1つ", "undefined"],
      "correct_index": 1
    }
  ]
}`;

// --- Gemini API 初期化 ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
        responseMimeType: 'application/json', // JSON安定化の核心
        temperature: 0.7,
    },
});

// --- バリデーション ---
function validate(data: unknown): asserts data is GeneratedQuizData {
    if (typeof data !== 'object' || data === null) {
        throw new Error('AI生成データが不正です: オブジェクトではありません');
    }
    const d = data as Record<string, unknown>;

    // questions
    if (!Array.isArray(d.questions) || d.questions.length < 3 || d.questions.length > 8) {
        throw new Error('AI生成データが不正です: questionsは3〜8件である必要があります');
    }
    for (const q of d.questions as Record<string, unknown>[]) {
        if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error('AI生成データが不正です: optionsは必ず4要素である必要があります');
        }
        if (typeof q.correct_index !== 'number' || q.correct_index < 0 || q.correct_index > 3) {
            throw new Error('AI生成データが不正です: correct_indexは0〜3である必要があります');
        }
    }

    // max_points
    if (typeof d.max_points !== 'number' || d.max_points < 10 || d.max_points > 100 || d.max_points % 10 !== 0) {
        throw new Error('AI生成データが不正です: max_pointsは10〜100の10刻みである必要があります');
    }

    // genres
    const genres = d.genres as Record<string, number>;
    const genreKeys = Object.keys(genres);
    if (genreKeys.length < 1 || genreKeys.length > 2) {
        throw new Error('AI生成データが不正です: ジャンルは1〜2つである必要があります');
    }
    if (!genreKeys.every(k => VALID_GENRES.includes(k))) {
        throw new Error('AI生成データが不正です: 不正なジャンルキーが含まれています');
    }
    const total = Object.values(genres).reduce((sum, v) => sum + v, 0);
    if (total < 0.99 || total > 1.01) {
        throw new Error('AI生成データが不正です: genresの合計が1.0ではありません');
    }
}

// --- genres 正規化（浮動小数点誤差対策）---
function normalizeGenres(genres: Record<string, number>): Record<string, number> {
    const total = Object.values(genres).reduce((sum, v) => sum + v, 0);
    return Object.fromEntries(
        Object.entries(genres).map(([k, v]) => [k, v / total])
    );
}

// --- メイン関数 ---
export async function generateQuizFromPresentation(
    presentationText: string
): Promise<GeneratedQuizData> {
    const userPrompt = `以下のLTプレゼン内容からクイズを生成してください：\n\n${presentationText}`;

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('AIの出力がJSON形式ではありませんでした');
    }

    validate(parsed);
    parsed.genres = normalizeGenres(parsed.genres);

    return parsed;
}
