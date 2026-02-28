import { userRepository } from '../repositories/userRepository';
import { gameRepository } from '../repositories/gameRepository';
import { generateAnalysisResult } from '../analysis/scoreCalculator';
import { analysisResultRepository, AnalysisResultRow } from '../repositories/analysisResultRepository';

import { getMbtiScores } from '../analysis/mbtiScoreTable';
import { BaselineScores, ResultResponse } from '../types';

export const resultService = {
    async getTotalExp(userId: string): Promise<{
        total_exp: {
            web: number;
            ai: number;
            security: number;
            infrastructure: number;
            design: number;
            game: number;
        };
    }> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw { status: 404, code: 'user_not_found', message: 'User not found' };
        }

        return {
            total_exp: {
                web: user.exp_web ?? 0,
                ai: user.exp_ai ?? 0,
                security: user.exp_security ?? 0,
                infrastructure: user.exp_infrastructure ?? 0,
                design: user.exp_design ?? 0,
                game: user.exp_game ?? 0,
            },
        };
    },

    async getResult(userId: string): Promise<ResultResponse> {
        // ユーザー取得
        const user = await userRepository.findById(userId);
        if (!user) {
            throw { status: 404, code: 'user_not_found', message: 'User not found' };
        }

        // 1. ベースラインスコア取得 (アンケート結果)
        let baseline_scores: BaselineScores = {
            caution: user.baseline_caution,
            calmness: user.baseline_calmness,
            logic: user.baseline_logic,
            cooperativeness: user.baseline_coop,
            positivity: user.baseline_positive,
        };

        // 2. MBTI理論値スコア取得
        const mbti_scores = user.self_mbti ? getMbtiScores(user.self_mbti) : null;

        // 3. MBTIが回答されている場合、ベースラインを理論値で補正する（極端な値を抑える）
        if (mbti_scores) {
            baseline_scores = this.blendScores(baseline_scores, mbti_scores);
        }

        // キャッシュ確認：analysis_results にあればそこから返す
        const cached = await analysisResultRepository.findByUserId(userId);
        if (cached) {
            return this.buildResponseFromCache(userId, user.self_mbti, baseline_scores, cached);
        }

        // キャッシュなし → ゲームログから計算
        const gameLogs = await gameRepository.findLogsByUserId(userId);
        if (gameLogs.length < 3) {
            throw { status: 400, code: 'incomplete_games', message: 'All games must be completed' };
        }

        // 分析（analysis/ に委譲）
        const game1Data = gameLogs.find(log => log.game_type === 1);
        const game2Data = gameLogs.find(log => log.game_type === 2);
        const game3Data = gameLogs.find(log => log.game_type === 3);

        const analysisResult = generateAnalysisResult(
            userId,
            user.self_mbti ?? undefined,
            game1Data?.raw_data,
            game2Data?.raw_data,
            game3Data?.raw_data,
            baseline_scores
        );

        // analysis_results にキャッシュとして保存
        const cacheRow: AnalysisResultRow = {
            user_id: userId,
            score_caution: analysisResult.scores.caution,
            score_calmness: analysisResult.scores.calmness,
            score_logic: analysisResult.scores.logic,
            score_coop: analysisResult.scores.cooperativeness,
            score_positive: analysisResult.scores.positivity,
            mbti_caution: mbti_scores?.caution ?? null,
            mbti_calmness: mbti_scores?.calmness ?? null,
            mbti_logic: mbti_scores?.logic ?? null,
            mbti_coop: mbti_scores?.cooperativeness ?? null,
            mbti_positive: mbti_scores?.positivity ?? null,
            gap_caution: analysisResult.gaps.caution,
            gap_calmness: analysisResult.gaps.calmness,
            gap_logic: analysisResult.gaps.logic,
            gap_coop: analysisResult.gaps.cooperativeness,
            gap_positive: analysisResult.gaps.positivity,
            feedback_title: analysisResult.feedback.title,
            feedback_description: analysisResult.feedback.description,
            feedback_gap_point: analysisResult.feedback.gap_point,
            game_contributions: analysisResult.game_breakdown,
            accuracy_score: analysisResult.accuracy_score,
            phase_summaries: analysisResult.phase_summaries,
            details: analysisResult.details,
        };

        await analysisResultRepository.save(cacheRow);

        return {
            ...analysisResult,
            self_mbti: user.self_mbti,
            mbti_scores
        };
    },

    /**
     * キャッシュ済みデータからレスポンスを組み立てる
     */
    buildResponseFromCache(
        userId: string,
        selfMbti: string | null,
        baselineScores: BaselineScores,
        cached: AnalysisResultRow,
    ): ResultResponse {
        return {
            user_id: userId,
            self_mbti: selfMbti,
            mbti_scores: (cached.mbti_caution !== null) ? {
                caution: cached.mbti_caution,
                calmness: cached.mbti_calmness!,
                logic: cached.mbti_logic!,
                cooperativeness: cached.mbti_coop!,
                positivity: cached.mbti_positive!,
            } : null,
            scores: {
                caution: cached.score_caution,
                calmness: cached.score_calmness,
                logic: cached.score_logic,
                cooperativeness: cached.score_coop,
                positivity: cached.score_positive,
            },
            baseline_scores: baselineScores,
            gaps: {
                caution: cached.gap_caution,
                calmness: cached.gap_calmness,
                logic: cached.gap_logic,
                cooperativeness: cached.gap_coop,
                positivity: cached.gap_positive,
            },
            game_breakdown: cached.game_contributions,
            feedback: {
                title: cached.feedback_title,
                description: cached.feedback_description,
                gap_point: cached.feedback_gap_point,
            },
            accuracy_score: cached.accuracy_score,
            phase_summaries: cached.phase_summaries,
            details: cached.details,
        };
    },

    /**
     * アンケート結果とMBTI理論値をブレンドして、ベースラインの極端な値を調整する
     */
    blendScores(survey: BaselineScores, mbti: BaselineScores): BaselineScores {
        // 比重: アンケート 70%, 理論値 30%
        const blend = (s: number, m: number) => Math.round(s * 0.7 + m * 0.3);

        return {
            caution: blend(survey.caution, mbti.caution),
            calmness: blend(survey.calmness, mbti.calmness),
            logic: blend(survey.logic, mbti.logic),
            cooperativeness: blend(survey.cooperativeness, mbti.cooperativeness),
            positivity: blend(survey.positivity, mbti.positivity),
        };
    },
};

