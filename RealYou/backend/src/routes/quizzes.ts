// /Users/ryu/58/58hack-team-kakinoha/RealYou/backend/src/routes/quizzes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { quizService } from '../services/quizService';
import { QuizSubmitRequestSchema } from '../schemas/quizSchema';
import { quizRepository } from '../repositories/quizRepository';
import { generateQuizFromPresentation, saveQuizToDb } from '../services/aiGenerationService';
import { processExpGrant, scoreAnswers } from '../services/expService';

const router = Router();

// =========================================================
// 問題生成 (POST /generate) ※AI生成 + DB保存の本実装
// =========================================================
const GenerateRequestSchema = z.object({
    user_id: z.string().uuid(),
    presentation_text: z.string().min(1).max(10000),
});

router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = GenerateRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'バリデーションエラー', details: parsed.error.issues });
        }
        const { user_id, presentation_text } = parsed.data;

        // AI生成
        const generated = await generateQuizFromPresentation(presentation_text);

        // DB保存
        const { quiz_id } = await saveQuizToDb(user_id, generated);

        res.status(201).json({
            quiz_id,
            max_points: generated.max_points,
            genres: generated.genres,
            message: 'クイズを生成しました',
        });
    } catch (err) {
        next(err);
    }
});

// =========================================================
// クイズ一覧取得 (GET /api/quizzes?user_id=xxx)
// =========================================================
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = req.query;

        // バリデーション
        if (!user_id || typeof user_id !== 'string') {
            return res.status(400).json({ error: 'user_id は必須です' });
        }

        const quizzes = await quizService.getQuizList(user_id);

        res.status(200).json({ quizzes });
    } catch (err) {
        next(err);
    }
});

// =========================================================
// 問題一覧取得 (GET /:quiz_id/questions) 本実装
// =========================================================
router.get('/:quiz_id/questions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quiz_id = req.params.quiz_id as string;

        if (!quiz_id) {
            return res.status(400).json({ error: 'quiz_id は必須です' });
        }

        // quiz の存在確認
        const { data: quiz, error: quizError } = await quizRepository.findById(quiz_id);
        if (quizError || !quiz) {
            return res.status(404).json({ error: '指定されたクイズが存在しません' });
        }

        // questions 取得
        const { data: questions, error: questionsError } = await quizRepository.getQuestionsByQuizId(quiz_id);
        if (questionsError) {
            throw new Error(`問題の取得に失敗しました: ${questionsError.message}`);
        }

        res.status(200).json({ questions: questions ?? [] });
    } catch (err) {
        next(err);
    }
});

// =========================================================
// 採点・結果送信 (POST /:quiz_id/submit) ※既存処理を保持しモック値を追記
// =========================================================
router.post('/:quiz_id/submit', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quizId = req.params.quiz_id as string;

        // 1. Request Validation (Zod)
        const parsedRequest = QuizSubmitRequestSchema.parse(req.body);

        // 2. 採点（1回のみDBクエリ）
        const { correctCount, totalQuestions } = await scoreAnswers(quizId, parsedRequest.answers);

        // 3. 経験値計算・履歴保存（新規）: 先に実行して結果を得る
        const { earned_points, total_exp } = await processExpGrant(
            parsedRequest.user_id,
            quizId,
            correctCount,
            totalQuestions,
        );

        // 4. Execute Service (既存ギャップ分析): 採点結果と経験値を渡して完了形を作る
        const responseDto = await quizService.submitQuiz(
            correctCount,
            totalQuestions,
            parsedRequest,
            earned_points,
            total_exp
        );

        // 5. Send Response（完了済みのDTOをそのまま返す）
        res.status(200).json(responseDto);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: "Validation failed",
                details: error.issues
            });
            return;
        }
        next(error);
    }
});


export default router;
