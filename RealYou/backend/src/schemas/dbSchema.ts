import { z } from 'zod';

// --- 1. Users ---
export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    auth_type: z.string().default('dummy'),
    auth_payload: z.any().optional(),
    exp_web: z.number().int().default(0),
    exp_ai: z.number().int().default(0),
    exp_security: z.number().int().default(0),
    exp_infrastructure: z.number().int().default(0),
    exp_design: z.number().int().default(0),
    exp_game: z.number().int().default(0),
    created_at: z.date().optional(),
});
export type UserDTO = z.infer<typeof UserSchema>;

// --- 2. Quizzes ---
export const GenreRatioSchema = z.record(
    z.enum(['web', 'ai', 'security', 'infrastructure', 'design', 'game']),
    z.number().min(0).max(1)
);

export const QuizSchema = z.object({
    id: z.string().uuid(),
    created_by: z.string().uuid(),
    title: z.string(),
    max_points: z.number().int().min(10).max(100),
    genres: GenreRatioSchema,
    created_at: z.date().optional(),
});
export type QuizDTO = z.infer<typeof QuizSchema>;

// --- 3. Questions ---
export const QuestionSchema = z.object({
    id: z.string().uuid(),
    quiz_id: z.string().uuid(),
    order_num: z.number().int().min(1),
    question_text: z.string(),
    options: z.array(z.string()).min(2),
    correct_index: z.number().int().min(0),
    created_at: z.date().optional(),
}).refine(
    (data) => data.correct_index < data.options.length,
    { message: "AIエラー: correct_index が options の配列サイズを超えています" }
);
export type QuestionDTO = z.infer<typeof QuestionSchema>;

// --- 4. Quiz Results ---
export const QuizResultSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    quiz_id: z.string().uuid(),
    correct_count: z.number().int().min(0),
    total_questions: z.number().int().min(1),
    earned_points: z.number().int().min(0),
    created_at: z.date().optional(),
}).refine(
    (data) => data.correct_count <= data.total_questions,
    { message: "エラー: 正解数が問題数を超えています（不正なデータです）" }
);
export type QuizResultDTO = z.infer<typeof QuizResultSchema>;
