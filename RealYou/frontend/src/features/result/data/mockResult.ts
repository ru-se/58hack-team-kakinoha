import type { ResultResponse } from '../types';

/**
 * @deprecated 現在未使用。useResult.ts は実APIに切り替え済み。
 * ローカル開発・テスト時のリファレンスとして残している。
 */
export const MOCK_RESULT: ResultResponse = {
  user_id: 'uuid-1234-5678',
  self_mbti: 'ENTP',
  mbti_scores: {
    caution: 30,
    calmness: 60,
    logic: 80,
    cooperativeness: 40,
    positivity: 90,
  },
  scores: {
    caution: 20,
    calmness: 80,
    logic: 60,
    cooperativeness: 10,
    positivity: 90,
  },
  baseline_scores: {
    caution: 100,
    calmness: 50,
    logic: 80,
    cooperativeness: 30,
    positivity: 70,
  },
  gaps: {
    caution: -80,
    calmness: 30,
    logic: -20,
    cooperativeness: -20,
    positivity: 20,
  },
  game_breakdown: {
    game_1: { caution: 20 },
    game_2: { logic: 60, calmness: 80, positivity: 90 },
    game_3: { cooperativeness: 10, positivity: 85 },
  },
  feedback: {
    title: '暴走する機関車',
    description:
      'あなたは自称リーダーですが、協調性が皆無です。規約は読まない！ AIには即ギレ！ でも窮地での「冷静さ」はスーパーヒーロー級です！',
    gap_point: '慎重さ',
  },
  accuracy_score: 50,
  phase_summaries: {
    phase_1: '規約を2秒で読み飛ばし、即座に同意ボタンを押しました',
    phase_2: 'AIの理不尽な対応に0.5秒で反応し、論理的に反論しました',
    phase_3: 'グループの空気を読んで、全員と同じ選択をしました',
  },
  details: {
    game_1: {
      title: '利用規約ゲーム',
      feature_scores: [
        { axis: 'caution', name: '慎重さ', score: 20 },
        { axis: 'logic', name: '論理性', score: 45 },
        { axis: 'calmness', name: '冷静さ', score: 85 },
      ],
      metrics: [
        {
          label: '読了速度(px/s)',
          user: 4500,
          average: 800,
          category: 'scroll',
        },
        { label: '総滞在時間(秒)', user: 1.2, average: 15.0, category: 'time' },
        {
          label: '決断前迷い(ms)',
          user: 200,
          average: 1200,
          category: 'mouse',
        },
        { label: 'チェック変更(回)', user: 1, average: 3.2, category: 'input' },
        { label: '逆行確認(回)', user: 0, average: 2.1, category: 'scroll' },
        {
          label: 'マウスブレ(px)',
          user: 45.5,
          average: 12.0,
          category: 'mouse',
        },
        { label: '無駄クリック(回)', user: 0, average: 1.5, category: 'mouse' },
      ],
    },
    game_2: {
      title: 'AIカスタマーサポート',
      feature_scores: [
        { axis: 'positivity', name: '積極性', score: 90 },
        { axis: 'calmness', name: '冷静さ', score: 75 },
        { axis: 'logic', name: '論理性', score: 60 },
      ],
      metrics: [
        { label: '反応潜時(ms)', user: 500, average: 2500, category: 'time' },
        { label: '発話時間(秒)', user: 12.5, average: 4.2, category: 'time' },
        { label: '食い気味度(ms)', user: 200, average: 800, category: 'time' },
        {
          label: '平均音量(dB)',
          user: -12.4,
          average: -25.0,
          category: 'voice',
        },
        { label: '論理的接続詞(回)', user: 2, average: 0.5, category: 'logic' },
      ],
    },
    game_3: {
      title: '空気読みグループチャット',
      feature_scores: [
        { axis: 'cooperativeness', name: '協調性', score: 10 },
        { axis: 'positivity', name: '積極性', score: 85 },
      ],
      metrics: [
        { label: '同調率(%)', user: 20, average: 75, category: 'social' },
        { label: '反応潜時(ms)', user: 800, average: 3500, category: 'time' },
        { label: '本音ホバー(回)', user: 0, average: 2.4, category: 'mouse' },
        { label: '譲り合い待機(ms)', user: 0, average: 2000, category: 'time' },
        {
          label: '過去ログ遡及(回)',
          user: 0,
          average: 1.2,
          category: 'scroll',
        },
      ],
    },
  },
};
