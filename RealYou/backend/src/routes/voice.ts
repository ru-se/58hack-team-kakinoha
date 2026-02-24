import { Router, Request, Response, NextFunction } from 'express';
import { voiceService } from '../services/voiceService';
import { userRepository } from '../repositories/userRepository';

const router = Router();

router.post('/respond', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, message, conversation_history } = req.body;

        if (!user_id) {
            throw { status: 400, code: 'invalid_request', message: 'user_id is required' };
        }

        const exists = await userRepository.exists(user_id);
        if (!exists) {
            throw { status: 400, code: 'invalid_user_id', message: 'ユーザーIDが存在しません' };
        }

        const result = await voiceService.generateAiResponse(message, conversation_history);

        res.json({
            response: result.response,
            emotion: result.emotion,
            confidence: result.confidence,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

