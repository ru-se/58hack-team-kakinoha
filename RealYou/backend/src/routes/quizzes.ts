// /Users/ryu/58/58hack-team-kakinoha/RealYou/backend/src/routes/quizzes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { quizService } from '../services/quizService';
import { QuizSubmitRequestSchema } from '../schemas/quizSchema';

const router = Router();

router.post('/:quiz_id/submit', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quizId = req.params.quiz_id;

        // 1. Request Validation (Zod)
        const parsedRequest = QuizSubmitRequestSchema.parse(req.body);

        // 2. Execute Service (quiz_idも渡す仕様に拡張可能ですが今回はそのまま)
        const responseDto = await quizService.submitQuiz(parsedRequest);

        // 3. Send Response
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
