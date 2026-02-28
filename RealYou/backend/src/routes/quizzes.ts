// /Users/ryu/58/58hack-team-kakinoha/RealYou/backend/src/routes/quizzes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { quizService } from '../services/quizService';
import { QuizSubmitRequestSchema } from '../schemas/quizSchema';
import { generateQuizFromPresentation, saveQuizToDb } from '../services/aiGenerationService';

const router = Router();

// =========================================================
// 問題生成 (POST /generate) ※AI生成 + DB保存の本実装
// =========================================================
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, presentation_text } = req.body;

        // バリデーション
        if (!user_id || !presentation_text) {
            return res.status(400).json({ error: 'user_id と presentation_text は必須です' });
        }
        if (typeof presentation_text !== 'string' || presentation_text.trim().length === 0) {
            return res.status(400).json({ error: 'presentation_text が空です' });
        }

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
// モックAPI: 問題一覧取得 (GET /:quiz_id/questions)
// =========================================================
router.get('/:quiz_id/questions', (req: Request, res: Response) => {
    const quiz_id = req.params.quiz_id;
    res.status(200).json({
        questions: [
            {
                id: "dummy-q-1",
                quiz_id,
                order_num: 1,
                question_text: "（ダミー1）このハッカソンで一番大事なことは？",
                options: ["睡眠", "気合い", "フロントを止めないこと", "おやつ"],
                correct_index: 2
            },
            {
                id: "dummy-q-2",
                quiz_id,
                order_num: 2,
                question_text: "（ダミー2）最強のデバッグ方法は？",
                options: ["console.log", "祈る", "再起動", "先輩に聞く"],
                correct_index: 0
            },
            {
                id: "dummy-q-3",
                quiz_id,
                order_num: 3,
                question_text: "（ダミー3）締め切り前夜にすべきことは？",
                options: ["徹夜", "早寝", "現実逃避", "スコープ削減"],
                correct_index: 3
            }
        ]
    });
});

// =========================================================
// 採点・結果送信 (POST /:quiz_id/submit) ※既存処理を保持しモック値を追記
// =========================================================
router.post('/:quiz_id/submit', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quizId = req.params.quiz_id;

        // 1. Request Validation (Zod)
        const parsedRequest = QuizSubmitRequestSchema.parse(req.body);

        // 2. Execute Service (quiz_idも渡す仕様に拡張可能ですが今回はそのまま)
        const responseDto = await quizService.submitQuiz(parsedRequest);

        // 3. Send Response（モック値を追記）
        res.status(200).json({
            ...responseDto,
            earned_points: 40,
            total_exp: { web: 150, ai: 200, security: 50, infrastructure: 80, design: 120, game: 90 }
        });
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
