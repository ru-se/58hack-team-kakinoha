import { BaselineScores } from '../types';

/**
 * MBTI 16タイプ → 5軸理論値スコアの変換テーブル
 * 各軸: 0-100
 * 参考: MBTI各因子の傾向に基づく推定値
 *
 * I/E → 積極性 (Introvert低, Extrovert高)
 * S/N → 慎重さ (Sensing高, iNtuition低)
 * T/F → 論理性 (Thinking高, Feeling低) / 冷静さ (Thinking高, Feeling低)
 * J/P → 協調性 (Judging高, Perceiving低) / 慎重さ (Judging高, Perceiving低)
 */
const MBTI_SCORE_TABLE: Record<string, BaselineScores> = {
    // 分析家グループ (NT)
    INTJ: { caution: 80, calmness: 85, logic: 95, cooperativeness: 30, positivity: 25 },
    INTP: { caution: 60, calmness: 80, logic: 90, cooperativeness: 25, positivity: 20 },
    ENTJ: { caution: 55, calmness: 75, logic: 90, cooperativeness: 45, positivity: 90 },
    ENTP: { caution: 30, calmness: 60, logic: 80, cooperativeness: 30, positivity: 85 },

    // 外交官グループ (NF)
    INFJ: { caution: 75, calmness: 70, logic: 50, cooperativeness: 80, positivity: 30 },
    INFP: { caution: 65, calmness: 55, logic: 40, cooperativeness: 75, positivity: 20 },
    ENFJ: { caution: 50, calmness: 65, logic: 45, cooperativeness: 90, positivity: 85 },
    ENFP: { caution: 25, calmness: 45, logic: 35, cooperativeness: 70, positivity: 90 },

    // 番人グループ (SJ)
    ISTJ: { caution: 95, calmness: 85, logic: 80, cooperativeness: 60, positivity: 20 },
    ISFJ: { caution: 90, calmness: 75, logic: 45, cooperativeness: 85, positivity: 25 },
    ESTJ: { caution: 70, calmness: 70, logic: 75, cooperativeness: 55, positivity: 80 },
    ESFJ: { caution: 65, calmness: 55, logic: 40, cooperativeness: 90, positivity: 80 },

    // 探検家グループ (SP)
    ISTP: { caution: 50, calmness: 90, logic: 75, cooperativeness: 20, positivity: 30 },
    ISFP: { caution: 55, calmness: 60, logic: 30, cooperativeness: 65, positivity: 25 },
    ESTP: { caution: 15, calmness: 55, logic: 60, cooperativeness: 25, positivity: 95 },
    ESFP: { caution: 10, calmness: 40, logic: 25, cooperativeness: 60, positivity: 95 },
};

/**
 * MBTIタイプから5軸の理論値スコアを取得する
 * @param mbti MBTIタイプ文字列 (例: "ENTP")
 * @returns 5軸スコア or null (不明なMBTIの場合)
 */
export function getMbtiScores(mbti: string): BaselineScores | null {
    const normalized = mbti.toUpperCase().trim();
    return MBTI_SCORE_TABLE[normalized] || null;
}
