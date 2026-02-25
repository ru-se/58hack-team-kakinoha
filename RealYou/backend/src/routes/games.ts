import { Router, Request, Response, NextFunction } from 'express';
import { gameService } from '../services/gameService';
import { SubmitGameRequest, SubmitGameResponse } from '../types';

const router = Router();

router.post('/submit', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, game_type, data } = req.body as SubmitGameRequest;
        await gameService.submitGame(user_id, game_type, data);

        const response: SubmitGameResponse = {
            status: 'success',
            message: `Game ${game_type} data saved`,
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
});

export default router;
