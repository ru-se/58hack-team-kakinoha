import { supabase } from '../db/client';
import { v4 as uuidv4 } from 'uuid';

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
    async getQuizList(userId: string) {
        const { data, error } = await supabase
            .from('quizzes')
            .select('id, title, genres, max_points, created_at')
            .eq('created_by', userId)
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

    // チュートリアルクイズの生成
    async createTutorialQuiz(userId: string) {
        const quizId = uuidv4();

        // 1. クイズ自体の作成
        const { error: quizError } = await supabase
            .from('quizzes')
            .insert({
                id: quizId,
                created_by: userId,
                title: '【チュートリアル】遊び方',
                genres: {},
                max_points: 10, // 10 points * 3 questions
            });

        if (quizError) {
            console.error('Failed to insert tutorial quiz:', quizError);
            return { error: quizError };
        }

        // 2. 設問の作成
        const questions = [
            {
                id: uuidv4(),
                quiz_id: quizId,
                order_num: 1,
                question_text: 'ここに問題が表示されるよ！見えたかな？',
                options: [
                    '見えた！',
                    'ばっちり！',
                    '文字が読める',
                    '次へ進む'
                ],
                correct_index: 0,
            },
            {
                id: uuidv4(),
                quiz_id: quizId,
                order_num: 2,
                question_text: 'そして、今あなたが選んでいるのが「選択肢」だよ！ここから好きなものを選んで、「回答する」ボタンを押してね。',
                options: [
                    'これにする',
                    'こっちかな',
                    '適当に選ぼう',
                    '迷うなあ'
                ],
                correct_index: 0,
            },
            {
                id: uuidv4(),
                quiz_id: quizId,
                order_num: 3,
                question_text: 'すべての問題に回答し終わると、最後にAIからの「フィードバック」と「経験値」がもらえるよ！さっそく遊んでみる？',
                options: [
                    '遊んでみる！',
                    '準備OK！',
                    'やってみよう！',
                    'さあ、始めよう！'
                ],
                correct_index: 0,
            }
        ];

        const { error: questionsError } = await supabase
            .from('questions')
            .insert(questions);

        if (questionsError) {
            console.error('Failed to insert tutorial questions:', questionsError);
            return { error: questionsError };
        }

        return { data: quizId, error: null };
    },
};
