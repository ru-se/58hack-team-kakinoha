import { supabase } from '../db/client';
import { BaselineScores } from '../types';

export const userRepository = {
    async create(id: string, mbti: string | null, baselineScores: BaselineScores) {
        const { error } = await supabase
            .from('users')
            .insert({
                id,
                self_mbti: mbti || null,
                baseline_caution: baselineScores.caution,
                baseline_calmness: baselineScores.calmness,
                baseline_logic: baselineScores.logic,
                baseline_coop: baselineScores.cooperativeness,
                baseline_positive: baselineScores.positivity,
            });

        if (error) throw error;
    },

    async findById(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        // PGRST116 = 行が見つからない → null を返す（エラーではない）
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data;
    },

    async exists(userId: string): Promise<boolean> {
        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        return !!data;
    }
};
