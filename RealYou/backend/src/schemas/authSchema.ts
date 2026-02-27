import { z } from 'zod';

export const ChimeraRegisterSchema = z.object({
    name: z.string().min(1),
    auth_type: z.enum(['dummy', 'pose']).default('dummy'),
    auth_payload: z.any().optional(),
});

export type ChimeraRegisterDTO = z.infer<typeof ChimeraRegisterSchema>;
