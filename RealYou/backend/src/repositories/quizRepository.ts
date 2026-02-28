import { supabase } from '../db/client';

export const quizRepository = {
    async findById(quizId: string) {
        const { data, error } = await supabase
            .from('quizzes')
            .select('id')
            .eq('id', quizId)
            .single();
        return { data, error };
    },

    async getQuestionsByQuizId(quizId: string) {
        const { data, error } = await supabase
            .from('questions')
            .select('id, quiz_id, order_num, question_text, options, correct_index')
            .eq('quiz_id', quizId)
            .order('order_num', { ascending: true });
        return { data, error };
    },

    // クイズ一覧取得
    async getQuizList() {
        const { data, error } = await supabase
            .from('quizzes')
            .select('id, title, genres, max_points, created_at')
            .order('created_at', { ascending: false }); // デフォルト: 生成順（降順）
        return { data, error };
    },

    // ユーザーの回答済みquiz_idセット取得
    async getAnsweredQuizIds(userId: string) {
        const { data, error } = await supabase
            .from('quiz_results')
            .select('quiz_id')
            .eq('user_id', userId);
        return { data, error };
    },
};
