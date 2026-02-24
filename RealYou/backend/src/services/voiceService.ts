/**
 * voiceService.ts
 *
 * 戦略:
 * 1. Gemini にリクエスト（最大5秒タイムアウト）
 * 2. 失敗時はエラーをスロー（モック/フォールバックは使用しない）
 */

const GEMINI_TIMEOUT_MS = 5000;

// プロンプトは短く・速く
const SYSTEM_PROMPT = `あなたはカスタマーサポート担当です。少し知識が中途半端で、ピントのずれた回答をします。回答は必ず「～かもしれません」「～だと思います」といった曖昧な文章で終わらせてください。短く、1〜2文（50文字程度）で返答してください。`;

const PRIMARY_MODEL = 'gemini-2.0-flash-lite';

interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface VoiceResponse {
    response: string;
    emotion: string;
    confidence: number;
}

function estimateEmotion(text: string): string {
    if (text.includes('多分') || text.includes('思います') || text.includes('かも')) return 'confused';
    if (text.includes('ありがとう') || text.includes('承りました')) return 'confident';
    if (text.includes('すみません') || text.includes('申し訳')) return 'apologetic';
    return 'neutral';
}

/**
 * 1つのモデルにリクエストを送る（タイムアウト付き）
 * エラー時は reject する
 */
async function requestToModel(
    modelName: string,
    contents: any[],
    apiKey: string,
    signal: AbortSignal,
): Promise<VoiceResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            generationConfig: {
                maxOutputTokens: 80,
                temperature: 0.7, // ランダム性を少し抑えて文章崩壊を防ぐ
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`${modelName}: HTTP ${response.status}`);
    }

    const data = await response.json();
    const text: string = data.candidates[0].content.parts[0].text;

    return {
        response: text.trim(),
        emotion: estimateEmotion(text),
        confidence: 0.6,
    };
}

/**
 * 単独モデルにリクエストし、タイムアウトで弾く
 */
async function callGeminiSequential(
    message: string,
    conversationHistory: ConversationMessage[],
    apiKey: string,
): Promise<VoiceResponse> {
    // 会話履歴は直近1件のみ（速度優先）
    const recentHistory = conversationHistory.slice(-1);
    const contents: any[] = [];
    for (const msg of recentHistory) {
        contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    // タイムアウト用 AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
        const result = await requestToModel(PRIMARY_MODEL, contents, apiKey, controller.signal);
        clearTimeout(timer);
        console.log(`[voiceService] Gemini (${PRIMARY_MODEL}) OK`);
        return result;
    } catch (err: any) {
        clearTimeout(timer);
        console.error(`[voiceService] Gemini failed. Inner error:`, err.errors || err.message);
        throw err;
    }
}

// ============================
// メインの voiceService
// ============================

import { getKeywordFallback } from './fallbackService';

export const voiceService = {
    async generateAiResponse(
        message: string,
        conversationHistory?: ConversationMessage[],
    ): Promise<VoiceResponse> {
        if (!message) {
            throw { status: 400, code: 'invalid_request', message: 'message is required' };
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn('[voiceService] GEMINI_API_KEY not set. Using fallback.');
            return getKeywordFallback(message);
        }

        try {
            return await callGeminiSequential(message, conversationHistory ?? [], apiKey);
        } catch (err: any) {
            const reason = err?.name === 'AbortError' ? 'タイムアウト' : err?.message || '不明なエラー';
            console.warn('[voiceService] Gemini failed:', reason, '- Using fallback response.');
            return getKeywordFallback(message);
        }
    },
};
