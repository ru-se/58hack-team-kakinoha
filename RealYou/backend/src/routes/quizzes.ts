// /Users/ryu/58/58hack-team-kakinoha/RealYou/backend/src/routes/quizzes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { quizService } from '../services/quizService';
import { QuizSubmitRequestSchema } from '../schemas/quizSchema';

const router = Router();

// =========================================================
// モックAPI: 問題生成 (POST /generate)
// フロントのローディングUIテスト用に3秒遅延させる
// =========================================================
router.post('/generate', async (req: Request, res: Response) => {
    await new Promise(r => setTimeout(r, 3000));
    res.status(200).json({
        quiz_id: "dummy-quiz-1234-5678",
        max_points: 50,
        genres: { web: 1, ai: 0, security: 0, infrastructure: 0, design: 0, game: 0 },
        message: "モック: 問題の生成が完了しました"
    });
});

// =========================================================
// 問題一覧取得 (GET /:quiz_id/questions) 本実装
// =========================================================
router.get('/:quiz_id/questions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { quiz_id } = req.params;

        // バリデーション
        if (!quiz_id) {
            return res.status(400).json({ error: 'quiz_id は必須です' });
        }

        const { supabase } = await import('../db/client');

        // quiz の存在確認
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('id')
            .eq('id', quiz_id)
            .single();

        if (quizError || !quiz) {
            return res.status(404).json({ error: '指定されたクイズが存在しません' });
        }

        // questions を order_num 昇順で取得
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('id, quiz_id, order_num, question_text, options, correct_index')
            .eq('quiz_id', quiz_id)
            .order('order_num', { ascending: true });

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
