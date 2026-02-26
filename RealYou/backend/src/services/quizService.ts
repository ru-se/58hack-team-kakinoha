// /Users/ryu/58/58hack-team-kakinoha/RealYou/backend/src/services/quizService.ts
import { QuizSubmitRequestDTO, QuizSubmitResponseDTO } from '../schemas/quizSchema';
import { calculateQuizScore } from '../analysis/quizScorer';
import { analyzeGap } from '../analysis/gapAnalyzer';

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
    }
};
