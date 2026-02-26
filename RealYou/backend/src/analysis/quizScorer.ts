// /Users/ryu/58/58hack-team-kakinoha/RealYou/backend/src/analysis/quizScorer.ts

/**
 * ユーザーの解答を受け取り、実際の点数（0〜100点）を算出する
 * ※現在はダミーの採点ロジックです。将来的に本物の採点ロジックに置き換えてください。
 */
export function calculateQuizScore(answers: Record<string, number>): number {
    const answerValues = Object.values(answers);

    // 何も解答がない場合は0点
    if (answerValues.length === 0) {
        return 0;
    }

    // ダミーロジック: 全ての解答の数値の合計を解答数で割った平均値（最大100になるように調整など）
    // （実際の仕様に合わせて実装を変更してください）
    const sum = answerValues.reduce((acc, val) => acc + val, 0);
    const average = sum / answerValues.length;

    // とりあえずダミーとして、0〜100に収まるように適当な計算を返す
    // 実際の正解判定であれば、正解数 / 全問題数 * 100 になります。
    const mockScore = Math.min(100, Math.max(0, Math.round(average * 20))); // 1-5の選択肢と仮定して*20

    return mockScore;
}
