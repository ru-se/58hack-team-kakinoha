// src/services/expService.ts
// 採点・経験値計算・履歴保存サービス (#40)

import { supabase } from '../db/client';

export type SubmitAnswers = Record<string, number>;

export type ExpGrantResult = {
    earned_points: number;   // 初回以外は0
    total_exp: {
        web: number;
        ai: number;
        security: number;
        infrastructure: number;
        design: number;
        game: number;
    };
};

// =========================================================
// 採点関数
// =========================================================
export async function scoreAnswers(
    quizId: string,
    answers: SubmitAnswers
): Promise<{ correctCount: number; totalQuestions: number }> {
    const { data: questions, error } = await supabase
        .from('questions')
        .select('id, correct_index, order_num')
        .eq('quiz_id', quizId);

    if (error || !questions) throw new Error('問題の取得に失敗しました');

    let correctCount = 0;
    for (const [key, value] of Object.entries(answers)) {
        const match = key.match(/^q_(\d+)$/);
        if (!match) continue;
        const orderNum = parseInt(match[1], 10);
        const q = questions.find(q => q.order_num === orderNum);
        // value is 1-based (1-4), correct_index is 0-based (0-3)
        if (q && q.correct_index === value - 1) {
            correctCount++;
        }
    }

    return { correctCount, totalQuestions: questions.length };
}

// =========================================================
// 初回判定関数
// TODO: 将来的に「最高スコア更新時のみ加算」に変更予定
// =========================================================
async function isFirstAttempt(userId: string, quizId: string): Promise<boolean> {
    const { data } = await supabase
        .from('quiz_results')
        .select('id')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .limit(1);

    return !data || data.length === 0;
}

// =========================================================
// earned_points 計算関数
// =========================================================
function calcEarnedPoints(
    correctCount: number,
    totalQuestions: number,
    maxPoints: number
): number {
    // 正答率に応じてmax_pointsを按分
    return Math.floor((correctCount / totalQuestions) * maxPoints);
}

// =========================================================
// メイン関数: 採点 → 初回判定 → 履歴保存 → EXP加算
// =========================================================
export async function processExpGrant(
    userId: string,
    quizId: string,
    correctCount: number,
    totalQuestions: number,
): Promise<ExpGrantResult> {
    // 1. クイズ情報取得（max_points, genres）
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('max_points, genres')
        .eq('id', quizId)
        .single();

    if (quizError || !quiz) throw new Error('クイズの取得に失敗しました');

    // 2. 初回判定（採点結果を受け取り済みのためscoreAnswers呼び出しなし）
    const firstAttempt = await isFirstAttempt(userId, quizId);
    const earnedPoints = firstAttempt
        ? calcEarnedPoints(correctCount, totalQuestions, quiz.max_points)
        : 0;

    // 4. quiz_results に INSERT（初回・2回目以降問わず毎回記録）
    await supabase.from('quiz_results').insert({
        user_id: userId,
        quiz_id: quizId,
        correct_count: correctCount,
        total_questions: totalQuestions,
        earned_points: earnedPoints,
    });

    // 5. exp 加算（初回のみ）
    if (firstAttempt && earnedPoints > 0) {
        const { data: user } = await supabase
            .from('users')
            .select('exp_web, exp_ai, exp_security, exp_infrastructure, exp_design, exp_game')
            .eq('id', userId)
            .single();

        const updates: Record<string, number> = {};
        for (const [genre, ratio] of Object.entries(quiz.genres as Record<string, number>)) {
            const col = `exp_${genre}`;
            updates[col] = ((user as Record<string, number>)?.[col] ?? 0) + Math.floor(earnedPoints * ratio);
        }

        await supabase.from('users').update(updates).eq('id', userId);
    }

    // 6. 更新後の total_exp を取得して返す
    const { data: updatedUser } = await supabase
        .from('users')
        .select('exp_web, exp_ai, exp_security, exp_infrastructure, exp_design, exp_game')
        .eq('id', userId)
        .single();

    return {
        earned_points: earnedPoints,
        total_exp: {
            web: updatedUser?.exp_web ?? 0,
            ai: updatedUser?.exp_ai ?? 0,
            security: updatedUser?.exp_security ?? 0,
            infrastructure: updatedUser?.exp_infrastructure ?? 0,
            design: updatedUser?.exp_design ?? 0,
            game: updatedUser?.exp_game ?? 0,
        },
    };
}
