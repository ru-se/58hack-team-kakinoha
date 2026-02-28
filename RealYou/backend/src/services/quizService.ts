// /Users/ryu/58/58hack-team-kakinoha/RealYou/backend/src/services/quizService.ts
import { QuizSubmitRequestDTO, QuizSubmitResponseDTO } from '../schemas/quizSchema';
import { calculateQuizScore } from '../analysis/quizScorer';
import { analyzeGap } from '../analysis/gapAnalyzer';
import { quizRepository } from '../repositories/quizRepository';

export const quizService = {
    async submitQuiz(request: QuizSubmitRequestDTO): Promise<QuizSubmitResponseDTO> {
        // 1. 解答の採点 (実際の点数算出)
        // src/analysis/quizScorer.tsの純粋な関数を呼び出す
        const actualScore = calculateQuizScore(request.answers);

        // 2. ギャップ分析とフィードバックの生成
        // src/analysis/gapAnalyzer.tsの純粋な関数を呼び出す
        const analysisResult = analyzeGap(actualScore, request.self_evaluation_level);

        // 3. Response DTO にマッピングして返す
        return {
            actual_score: actualScore,
            gap: analysisResult.gap,
            feedback_message: analysisResult.feedbackMessage,
            chimera_parameters: analysisResult.chimeraParameters,
            rival_parameters: analysisResult.rivalParameters
        };
    },

    async getQuizList(userId: string) {
        // 1. クイズ一覧取得
        const { data: quizzes, error: quizzesError } = await quizRepository.getQuizList();
        if (quizzesError) throw new Error(`クイズ一覧の取得に失敗しました: ${quizzesError.message}`);

        // 2. 回答済みquiz_idのセット作成
        const { data: results, error: resultsError } = await quizRepository.getAnsweredQuizIds(userId);
        if (resultsError) throw new Error(`回答履歴の取得に失敗しました: ${resultsError.message}`);

        const answeredSet = new Set(results?.map(r => r.quiz_id) ?? []);

        // 3. answered フラグを付与して返す
        return (quizzes ?? []).map(q => ({
            quiz_id: q.id,
            title: q.title,
            genres: q.genres,
            max_points: q.max_points,
            created_at: q.created_at,
            answered: answeredSet.has(q.id),
        }));
    },
};
