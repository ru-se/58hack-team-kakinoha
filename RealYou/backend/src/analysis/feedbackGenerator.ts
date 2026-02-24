import { BaselineScores } from '../types';

export function generateFeedback(
    scores: BaselineScores,
    gaps: BaselineScores
): { title: string; description: string; gap_point: string } {
    
    // 最大ギャップ（絶対値）を見つける
    const gapEntries = Object.entries(gaps).map(([key, value]) => ({
        key,
        value: value, // 元のプラスマイナスを保持
        abs: Math.abs(value)
    }));
    gapEntries.sort((a, b) => b.abs - a.abs);
    const maxGap = gapEntries[0];

    const gapKey = maxGap.key;
    const isOverestimated = maxGap.value < 0; // 自認より実測が低い（自己評価が高すぎた）場合
    
    //タイトルと説明文の定義
    const feedbackText: Record<string, { over: { title: string, desc: string }, under: { title: string, desc: string } }> = {
        caution: {
            over: { title: '予想外の大胆さ', desc: 'あなたは自分を慎重だと思っていましたが、実際の行動では迷いなく大胆な判断を下していました。' },
            under: { title: '隠れた慎重派', desc: 'あなたは自分を大胆だと思っていましたが、行動ログには石橋を叩いて渡る慎重さが表れています。' }
        },
        calmness: {
            over: { title: '隠れパニックメーカー', desc: 'あなたは冷静なつもりでも、想定外の事態が起きると無意識に焦りが行動（操作）に表れてしまうようです。' },
            under: { title: '氷のメンタル', desc: 'あなたは自分を感情的だと思っていましたが、トラブル時にも極めて冷静に処理を行えていました。' }
        },
        logic: {
            over: { title: '直感ドリブン', desc: 'あなたは論理的に考えているつもりでも、いざという時はフィーリング（直感）で決定を下すことが多いようです。' },
            under: { title: '隠れた知性', desc: 'あなたは自分を直感的だと思っていましたが、データに基づき非常に論理的な判断を下していました。' }
        },
        cooperativeness: {
            over: { title: '孤高のソロプレイヤー', desc: 'あなたは協調的だと思っていましたが、実際には周囲に流されず自分の意見を貫く強さ（あるいは頑固さ）を持っています。' },
            under: { title: '究極のバランサー', desc: 'あなたは自分を独立心が強いと思っていましたが、実際には無意識に周囲の空気を読み、調和を重んじています。' }
        },
        positivity: {
            over: { title: '石橋を叩き割る守護者', desc: 'あなたは積極的だと思い込んでいますが、無意識のうちに失敗を恐れ、行動が遅れる傾向があります。' },
            under: { title: '前のめりな挑戦者', desc: 'あなたは自分を消極的だと思っていましたが、チャンスがあれば誰よりも早く（食い気味に）行動を起こしています。' }
        }
    };

    // 日本語の軸名マッピング
    const axisNames: Record<string, string> = {
        caution: '慎重さ',
        calmness: '冷静さ',
        logic: '論理性',
        cooperativeness: '協調性',
        positivity: '積極性'
    };

    // ギャップが少なすぎる（±10以内）場合はバランス型のメッセージを返す
    if (maxGap.abs <= 10) {
        return {
            title: '自己認識の達人',
            description: 'あなたの自己認識と実際の行動にはほとんどズレがありません。自分自身を極めて客観的に把握できています。',
            gap_point: 'なし（バランス型）'
        };
    }

    const selectedFeedback = isOverestimated ? feedbackText[gapKey].over : feedbackText[gapKey].under;

    return {
        title: selectedFeedback.title,
        description: selectedFeedback.desc,
        gap_point: axisNames[gapKey]
    };
}