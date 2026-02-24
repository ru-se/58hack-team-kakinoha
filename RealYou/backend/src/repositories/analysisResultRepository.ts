import { supabase } from '../db/client';
import { GameBreakdown, PhaseSummaries } from '../types';

export interface AnalysisResultRow {
    user_id: string;
    // 実測スコア
    score_caution: number;
    score_calmness: number;
    score_logic: number;
    score_coop: number;
    score_positive: number;
    // MBTI理論値
    mbti_caution: number | null;
    mbti_calmness: number | null;
    mbti_logic: number | null;
    mbti_coop: number | null;
    mbti_positive: number | null;
    // ギャップ
    gap_caution: number;
    gap_calmness: number;
    gap_logic: number;
    gap_coop: number;
    gap_positive: number;
    // フィードバック
    feedback_title: string;
    feedback_description: string;
    feedback_gap_point: string;
    // その他
    game_contributions: GameBreakdown;
    accuracy_score: number;
    phase_summaries: PhaseSummaries;
    details: any; // JSONB カラム
    created_at?: string;
}

export const analysisResultRepository = {
    /**
     * 結果をキャッシュとして保存（UPSERT）
     */
    async save(result: AnalysisResultRow) {
        const { error } = await supabase
            .from('analysis_results')
            .upsert(result, { onConflict: 'user_id' });

        if (error) throw error;
    },

    /**
     * ユーザーIDからキャッシュ済み結果を取得
     */
    async findByUserId(userId: string): Promise<AnalysisResultRow | null> {
        const { data, error } = await supabase
            .from('analysis_results')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data;
    },

    /**
     * キャッシュが存在するか確認
     */
    async exists(userId: string): Promise<boolean> {
        const { data } = await supabase
            .from('analysis_results')
            .select('user_id')
            .eq('user_id', userId)
            .limit(1);

        return (data?.length ?? 0) > 0;
    },
};
