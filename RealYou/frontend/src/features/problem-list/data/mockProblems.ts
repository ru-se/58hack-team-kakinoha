export type ProblemStatus = 'unanswered' | 'answered' | 'perfect';

export interface Problem {
    id: string;
    title: string;
    status: ProblemStatus;
    date: string; // YYYY-MM-DD
}

// 今日の日付を取得（デモ用データの基準日となる 2026-02-28）
const today = '2026-02-28';
const yesterday = '2026-02-27';
const twoDaysAgo = '2026-02-26';

export const MOCK_PROBLEMS: Problem[] = [
    {
        id: 'p1',
        title: 'ビジネスマナーの基本と実践',
        status: 'unanswered',
        date: today,
    },
    {
        id: 'p2',
        title: 'コンプライアンス遵守とリスク管理',
        status: 'answered',
        date: today,
    },
    {
        id: 'p3',
        title: '情報セキュリティ研修（2026年度版）',
        status: 'perfect',
        date: yesterday,
    },
    {
        id: 'p4',
        title: 'ハラスメント防止について',
        status: 'unanswered',
        date: yesterday,
    },
    {
        id: 'p5',
        title: '新入社員向け：電話応対の基本',
        status: 'perfect',
        date: twoDaysAgo,
    },
    {
        id: 'p6',
        title: '社内システムの正しい使い方',
        status: 'answered',
        date: twoDaysAgo,
    },
    {
        id: 'p7',
        title: 'コミュニケーションスキル向上講座',
        status: 'unanswered',
        date: '2026-02-20',
    },
];
