import { Router, Request, Response, NextFunction } from 'express';
import { registerService, registerChimeraUser } from '../services/registerService';
import { RegisterRequest, RegisterResponse } from '../types';
import { ChimeraRegisterSchema } from '../schemas/authSchema';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { mbti, baseline_answers } = req.body as RegisterRequest;
        const userId = await registerService.registerUser(mbti, baseline_answers);

        const response: RegisterResponse = { user_id: userId, status: 'success' };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
});

router.post('/chimera', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = ChimeraRegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'バリデーションエラー', details: parsed.error.issues });
            return;
        }

        const user_id = await registerChimeraUser(parsed.data);
        res.status(201).json({ user_id, message: '登録成功' });
    } catch (error) {
        next(error);
    }
});

export default router;

