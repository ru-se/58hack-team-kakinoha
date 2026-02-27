import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/userRepository';
import { BaselineAnswers, BaselineScores } from '../types';
import { supabase } from '../db/client';
import { ChimeraRegisterDTO } from '../schemas/authSchema';

// 回答 → スコア変換マップ
const SCORE_MAP: Record<string, number> = {
    'A': 100, // Strongly Agree
    'B': 75,  // Agree
    'C': 25,  // Disagree (Skip 50 to force choice)
    'D': 0,   // Strongly Disagree
};

function convertAnswersToScores(answers: BaselineAnswers): BaselineScores {
    const convert = (value: string): number => SCORE_MAP[value] ?? 50;
    return {
        caution: convert(answers.q1_caution),
        calmness: convert(answers.q2_calmness),
        logic: convert(answers.q3_logic),
        cooperativeness: convert(answers.q4_cooperativeness),
        positivity: convert(answers.q5_positivity),
    };
}

export const registerService = {
    async registerUser(mbti: string | null | undefined, baselineAnswers: BaselineAnswers) {
        // バリデーション
        if (mbti) {
            const mbtiRegex = /^[IE][SN][TF][JP]$/i;
            if (!mbtiRegex.test(mbti)) {
                throw { status: 400, code: 'invalid_mbti', message: 'MBTI must be a valid 4-letter type (e.g., INTJ, ESFP)' };
            }
        }

        if (!baselineAnswers) {
            throw { status: 400, code: 'invalid_request', message: 'baseline_answers is required' };
        }

        const requiredKeys = ['q1_caution', 'q2_calmness', 'q3_logic', 'q4_cooperativeness', 'q5_positivity'];
        const providedKeys = Object.keys(baselineAnswers);
        const missingKeys = requiredKeys.filter(k => !providedKeys.includes(k));

        if (missingKeys.length > 0) {
            throw { status: 400, code: 'invalid_request', message: `Missing baseline_answers keys: ${missingKeys.join(', ')}` };
        }

        const validValues = ['A', 'B', 'C', 'D'];
        const invalidKeys = requiredKeys.filter(k => !validValues.includes((baselineAnswers as any)[k]));
        if (invalidKeys.length > 0) {
            // エラーメッセージで有効な値を案内
            throw { status: 400, code: 'invalid_answers', message: `Answers must be one of [${validValues.join(', ')}]. Invalid keys: ${invalidKeys.join(', ')}` };
        }

        // A-E → 数値に変換
        const baselineScores = convertAnswersToScores(baselineAnswers);

        const userId = uuidv4();
        await userRepository.create(userId, mbti || null, baselineScores);

        return userId;
    }
};

// ダミー認証用ユーザー登録（キメラプロジェクト向け）
export async function registerChimeraUser(dto: ChimeraRegisterDTO): Promise<string> {
    if (dto.auth_type === 'dummy') {
        const { data, error } = await supabase
            .from('users')
            .insert({
                name: dto.name,
                auth_type: dto.auth_type,
                auth_payload: dto.auth_payload ?? null,
            })
            .select('id')
            .single();

        if (error || !data) {
            throw { status: 500, code: 'db_error', message: error?.message ?? 'ユーザーの登録に失敗しました' };
        }

        return data.id as string;
    }

    throw { status: 400, code: 'unsupported_auth_type', message: `auth_type '${dto.auth_type}' は現在サポートされていません` };
}
