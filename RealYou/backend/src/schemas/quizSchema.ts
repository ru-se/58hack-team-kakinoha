import { z } from 'zod';

// Zodスキーマの定義
export const QuizSubmitRequestSchema = z.object({
    user_id: z.string().uuid("Invalid UUID format"),
    self_evaluation_level: z.number().int().min(1).max(5),
    // 任意の数の問題（q_1, q_2, ...）に対応し、選択肢は1〜4に制限
    answers: z.record(
        z.string().regex(/^q_\d+$/, "Keys must be in the format 'q_1', 'q_2', etc."),
        z.number().int().min(1).max(4)
    )
});

export type QuizSubmitRequestDTO = z.infer<typeof QuizSubmitRequestSchema>;

export const QuizSubmitResponseSchema = z.object({
    actual_score: z.number(),
    gap: z.number(),
    feedback_message: z.string(),
    chimera_parameters: z.object({
        lucky: z.number().int().min(0).max(100),
        happy: z.number().int().min(0).max(100),
        nice: z.number().int().min(0).max(100),
        cute: z.number().int().min(0).max(100),
        cool: z.number().int().min(0).max(100)
    }),
    rival_parameters: z.object({
        lucky: z.number().int().min(0).max(100),
        happy: z.number().int().min(0).max(100),
        nice: z.number().int().min(0).max(100),
        cute: z.number().int().min(0).max(100),
        cool: z.number().int().min(0).max(100)
    })
});

export type QuizSubmitResponseDTO = z.infer<typeof QuizSubmitResponseSchema>;
