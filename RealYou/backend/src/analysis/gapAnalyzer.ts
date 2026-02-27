// /Users/ryu/58/58hack-team-kakinoha/RealYou/backend/src/analysis/gapAnalyzer.ts

export interface ChimeraParameters {
    lucky: number;
    happy: number;
    nice: number;
    cute: number;
    cool: number;
}

export interface ChimeraParameters {
    lucky: number;
    happy: number;
    nice: number;
    cute: number;
    cool: number;
}

export interface GapAnalysisResult {
    convertedSelfScore: number;
    gap: number;
    feedbackMessage: string;
    chimeraParameters: ChimeraParameters;
    rivalParameters: ChimeraParameters;
}

/**
 * キメラパラメータ（5軸レーダーチャート用）を生成する
 */
function generateChimeraParameters(
    convertedSelfScore: number,
    actualScore: number,
    gap: number
): ChimeraParameters {
    // lucky: 0-100の完全な乱数
    const lucky = Math.floor(Math.random() * 101);

    // happy: 事前評価レベル(換算値)と等しい
    const happy = convertedSelfScore;

    // nice: 実際のテスト点数と等しい
    const nice = actualScore;

    // cute: 過信（gap < 0）なら100、それ以外は0〜50の乱数
    const cute = gap < 0 ? 100 : Math.floor(Math.random() * 51);

    // cool: 謙遜（gap > 0）なら100、それ以外は0〜50の乱数
    const cool = gap > 0 ? 100 : Math.floor(Math.random() * 51);

    return { lucky, happy, nice, cute, cool };
}

/**
 * 自己評価（1〜5）を100点満点（0〜100）に換算する
 * 例: 1 -> 20, 2 -> 40, 3 -> 60, 4 -> 80, 5 -> 100
 */
export function convertSelfEvaluationToScore(level: number): number {
    const safeLevel = Math.max(1, Math.min(5, level));
    return safeLevel * 20;
}

/**
 * 実際の点数と自己評価のギャップからフィードバックメッセージを生成する
 * gap = actualScore - convertedSelfScore
 * gap > 0 : 実際の点数が高い（謙遜・過小評価）
 * gap < 0 : 自己評価が高い（過信・過大評価）
 */
export function generateGapFeedback(gap: number): string {
    const absGap = Math.abs(gap);

    // ギャップが±15点以内の場合は自己認識が正確とみなす
    if (absGap <= 15) {
        const messages = [
            "【自己認識の達人】自己評価と実際の理解度がぴったり一致しています。自分自身を客観的に把握できる素晴らしい結果です！",
            "【正確なメタ認知】自分の実力を正確に測れていますね。この調子で次のステップに進みましょう！",
            "【堅実タイプ】地に足のついた学習ができています。等身大の自分を理解している証拠です。"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    if (gap < 0) {
        const messages = [
            "分かっているつもりになっているかも！復習のチャンス！",
            "【過信タイプ】実際の理解度より自己評価が少し高めです。基礎をもう一度確認してみましょう。",
            "「知っている」と「できる」の壁にぶつかっているかも？もう一度スライドを読み直すと発見があるはず！",
            "惜しい！少しだけ理解に抜け漏れがあるようです。クイズの復習をして完璧を目指しましょう。"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    } else {
        const messages = [
            "【謙遜タイプ】自己評価よりも実際の理解度がはるかに高いです。十分な知識があるので、もっと自信を持って大丈夫です！",
            "【隠れた実力者】思っている以上に理解できていますよ！もっと自分を信じて発言・行動してみましょう。",
            "素晴らしい吸収力！ご自身が感じているよりもずっと深く内容を理解できています。",
            "【控えめタイプ】正確に理解できているのに、少し自信がないようです。テストの結果があなたの実力を証明しています！"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

function generateRivalParameters(): ChimeraParameters {
    return {
        lucky: Math.floor(Math.random() * 101),
        happy: Math.floor(Math.random() * 101),
        nice: Math.floor(Math.random() * 101),
        cute: Math.floor(Math.random() * 101),
        cool: Math.floor(Math.random() * 101),
    };
}

/**
 * ギャップを分析し、結果オブジェクトを返す
 */
export function analyzeGap(actualScore: number, selfEvaluationLevel: number): GapAnalysisResult {
    const convertedSelfScore = convertSelfEvaluationToScore(selfEvaluationLevel);
    const gap = actualScore - convertedSelfScore;
    const feedbackMessage = generateGapFeedback(gap);
    const chimeraParameters = generateChimeraParameters(convertedSelfScore, actualScore, gap);
    const rivalParameters = generateRivalParameters();

    return {
        convertedSelfScore,
        gap,
        feedbackMessage,
        chimeraParameters,
        rivalParameters
    };
}
