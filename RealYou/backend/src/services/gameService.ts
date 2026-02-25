import { userRepository } from '../repositories/userRepository';
import { gameRepository } from '../repositories/gameRepository';
import { GameType, GAME_TYPES } from '../types';

export const gameService = {
    async submitGame(userId: string, gameType: GameType, data: Record<string, any>) {
        // バリデーション
        if (!userId || !gameType || !data) {
            throw { status: 400, code: 'invalid_request', message: 'user_id, game_type, and data are required' };
        }

        if (Object.keys(data).length === 0) {
            throw { status: 400, code: 'invalid_request', message: 'data cannot be empty' };
        }

        if (!Object.values(GAME_TYPES).includes(gameType)) {
            throw { status: 400, code: 'invalid_game_type', message: `game_type must be one of: ${Object.values(GAME_TYPES).join(', ')}` };
        }

        // ユーザー存在確認
        const exists = await userRepository.exists(userId);
        if (!exists) {
            throw { status: 400, code: 'invalid_user_id', message: 'User not found' };
        }

        // 重複送信チェック
        const alreadySubmitted = await gameRepository.existsLog(userId, gameType);
        if (alreadySubmitted) {
            throw { status: 409, code: 'duplicate_submission', message: `Game ${gameType} is already submitted` };
        }

        // 保存
        await gameRepository.saveLog(userId, gameType, data);
    }
};
