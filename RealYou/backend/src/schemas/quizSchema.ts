import { z } from 'zod';

// Zodスキーマの定義
export const QuizSubmitRequestSchema = z.object({
    user_id: z.string().uuid("Invalid UUID format"),
    self_evaluation_level: z.number().int().min(1).max(5),
    answers: z.record(
        z.string().regex(/^q_\d+$/, "Keys must be in format 'q_1', 'q_2', etc."),
        z.number().int().min(1).max(4)
    )
});

export type QuizSubmitRequestDTO = z.infer<typeof QuizSubmitRequestSchema>;

export const QuizSubmitResponseSchema = z.object({
    actual_score: z.number().int().min(0).max(100),
    gap: z.number().int(),
    feedback_message: z.string(),
    earned_points: z.number().int().min(0),
    total_exp: z.record(z.string(), z.number().int().min(0)),
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
