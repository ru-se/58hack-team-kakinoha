import { Router, Request, Response, NextFunction } from 'express';
import { resultService } from '../services/resultService';

const router = Router();

router.get('/:user_id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.user_id as string;
        const result = await resultService.getResult(userId);

        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
