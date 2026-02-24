import { PhaseSummaries } from '../types';

/**
 * 各フェーズの行動データから、結果画面に表示するサマリーテキストを生成する
 *
 * ★ たまちゃへ：ここを実装してください
 * - 各ゲームの raw_data を受け取って、ユーザーの行動を日本語テキストにまとめる
 * - 例: 「利用規約を12秒で同意しました。読了率8%」
 * - raw_data の構造は ANALYSIS_GUIDE.md を参照
 */
export function buildPhaseSummaries(
    game1Raw: any | undefined,
    game2Raw: any | undefined,
    game3Raw: any | undefined,
): PhaseSummaries {
    
    // --- Phase 1: 利用規約ゲームの要約 ---
    let phase1Text = 'データなし';
    if (game1Raw) {
        const timeSec = (game1Raw.totalTime || 0).toFixed(1);
        const speed = game1Raw.scrollMetrics?.averageSpeed || 0;
        const speedText = speed > 2000 ? '爆速でスクロールし' : speed < 1000 ? 'じっくりと読み込み' : '平均的な速度で確認し';
        
        let trapText = '';
        const mailChecked = game1Raw.checkboxStates?.mailMagazine?.final;
        if (mailChecked) trapText = 'メルマガの罠に見事に引っかかりました。';
        else trapText = '不要なチェックは見逃さず外しました。';

        phase1Text = `規約を${speedText}、わずか${timeSec}秒で同意ボタンを押しました。${trapText}`;
    }

    // --- Phase 2: AIチャットの要約 ---
    let phase2Text = 'データなし';
    if (game2Raw) {
        const method = game2Raw.inputMethod === 'voice' ? '音声で堂々と' : 'テキストで冷静に';
        const turns = game2Raw.turns || [];
        
        // 平均反応速度を計算
        const avgReaction = turns.length > 0 
            ? turns.reduce((sum: number, t: any) => sum + (t.reactionTimeMs || 2000), 0) / turns.length 
            : 2000;
        
        const reactionText = avgReaction < 800 ? 'AIの理不尽な対応に即座に反応し' : 'AIの対応に対して一呼吸おいてから';
        
        phase2Text = `${reactionText}、${method}反論を展開しました。`;
    }

    // --- Phase 3: グループチャットの要約 ---
    let phase3Text = 'データなし';
    if (game3Raw) {
        const stages = game3Raw.stages || [];
        
        // 多数派（仮に選択肢1と2を多数派とする）を選んだ回数で同調率を算出
        const conformCount = stages.filter((s: any) => s.selectedOptionId === 1 || s.selectedOptionId === 2).length;
        const conformRate = (conformCount / (stages.length || 1)) * 100;
        
        const socialText = conformRate >= 60 ? 'グループの空気を敏感に察知して周りに合わせ' : '周りに流されず我が道をゆく選択肢を取り';
        
        const avgReaction = stages.length > 0
            ? stages.reduce((sum: number, s: any) => sum + (s.reactionTime || 2000), 0) / stages.length
            : 2000;
        const speedText = avgReaction < 2000 ? '即決でアクションを起こしました。' : '慎重にタイミングを伺いました。';

        phase3Text = `${socialText}、${speedText}`;
    }

    return {
        phase_1: phase1Text,
        phase_2: phase2Text,
        phase_3: phase3Text,
    };
}