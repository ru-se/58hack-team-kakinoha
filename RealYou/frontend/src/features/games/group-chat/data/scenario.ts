/**
 * ============================================================
 * 📝 scenario.ts — グループチャット ゲーム シナリオ定義ファイル
 * ============================================================
 *
 * このファイルだけ編集すれば、グループチャットゲームの
 * テキスト・選択肢・キャラクター・グループ設定をすべて変更できます。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ⚠️ 編集ルール
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 【選択肢の数】
 *   各ステージの options は何個でも追加できます（2〜6つ推奨）。
 *   UIのグリッド列数は自動で調整されます。
 *
 * 【選択肢の type】
 *   各選択肢に type: 'cooperative' | 'independent' を指定します。
 *   'cooperative'  → 多数派・空気を読む行動
 *   'independent'  → 自分の意見・空気を読まない行動
 *
 * 【cooperativeCount】
 *   バックエンドのスコア計算は「先頭N個が協調」として判定します。
 *   cooperative な選択肢を必ず先頭にまとめ、
 *   cooperativeCount にその個数を指定してください。
 *   例: cooperative×2 + independent×2 の場合 → cooperativeCount: 2
 *
 * 【ステージ数】
 *   SCENARIO_STAGES の配列要素を増減するだけでステージ数が変わります。
 *   stages.ts の TOTAL_STAGES は自動で更新されます（編集不要）。
 *
 * 【typingBotId】
 *   trackTypingIndicator: true のとき表示するBotを SCENARIO_BOTS の
 *   id で指定します（false なら null）。
 *   ※ スコア計算に使う反応時間の計測対象はステージ3のみです。
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import type { BotCharacter, StageDefinition } from './stages';

// ============================================================
// 🏷️ グループ設定
// ============================================================

/** チャットヘッダーに表示されるグループ名 */
export const SCENARIO_GROUP_NAME = '第3営業部';

/** カッコ内に表示されるグループメンバー数 */
export const SCENARIO_GROUP_MEMBER_COUNT = 5;

// ============================================================
// 🧑‍🤝‍🧑 ボットキャラクター定義
// ============================================================
// id          : messages / typingBotId から参照するキー
// name        : 「○○が返信中」やアバター下の名前
// avatarLabel : アバター円に表示する1〜2文字
// color       : Tailwind CSS クラス（例: 'bg-red-500 text-white'）

export const SCENARIO_BOTS: BotCharacter[] = [
    {
        id: 'boss',
        name: '部長',
        avatarLabel: '部',
        color: 'bg-red-500 text-white',
    },
    {
        id: 'senpai',
        name: '先輩',
        avatarLabel: '先',
        color: 'bg-blue-500 text-white',
    },
    {
        id: 'colleague',
        name: '同期',
        avatarLabel: '同',
        color: 'bg-green-500 text-white',
    },
];

// ============================================================
// 🎬 ステージ定義
// ============================================================

export const SCENARIO_STAGES: StageDefinition[] = [
    // ----------------------------------------------------------
    // ステージ1: 沈黙（幹事の募集）
    // 選択肢4つ: cooperative×2, independent×2
    // ----------------------------------------------------------
    {
        stageId: 1,
        theme: '沈黙',
        dayLabel: 'DAY 1',
        messages: [
            {
                botId: 'boss',
                text: 'お疲れ様！来週の親睦会の幹事なんだけど、誰か頼めるかな？👀',
            },
        ],
        options: [
            { emoji: '🙋', label: 'やります！', type: 'cooperative' },
            { emoji: '👀', label: '（様子を見る）', type: 'cooperative' },
            { emoji: '👉', label: '○○さんどう？', type: 'independent' },
            { emoji: '😑', label: '既読スルー', type: 'independent' },
        ],
        cooperativeCount: 2,
        trackTypingIndicator: false,
        typingBotId: null,
    },

    // ----------------------------------------------------------
    // ステージ2: 祝賀（スタンプの同調）
    // 選択肢4つ: cooperative×2, independent×2
    // ----------------------------------------------------------
    {
        stageId: 2,
        theme: '祝賀',
        dayLabel: 'DAY 2',
        messages: [
            { botId: 'boss', text: '田中さん、昇進おめでとう！🎉' },
            { botId: 'senpai', text: '🎉' },
            { botId: 'colleague', text: '🎉' },
        ],
        options: [
            { emoji: '🎉', label: '', type: 'cooperative' },
            { emoji: '🎊', label: '', type: 'cooperative' },
            { emoji: '👍', label: '', type: 'independent' },
            { emoji: '😑', label: '', type: 'independent' },
        ],
        cooperativeCount: 2,
        trackTypingIndicator: false,
        typingBotId: null,
    },

    // ----------------------------------------------------------
    // ステージ3: 衝突（方針について意見を求められる）
    // 選択肢4つ: cooperative×2, independent×2
    // ※ typingIndicator の反応時間がスコア計算に使われる唯一のステージ
    // ----------------------------------------------------------
    {
        stageId: 3,
        theme: '衝突',
        dayLabel: 'DAY 3',
        messages: [
            { botId: 'boss', text: '次のプロジェクトの方針、みんなどう思う？' },
        ],
        options: [
            { emoji: '🤝', label: '先輩の意見を聞きたいです', type: 'cooperative' },
            { emoji: '👀', label: '自分もそう思います', type: 'cooperative' },
            { emoji: '💬', label: '自分はこう思います！', type: 'independent' },
            { emoji: '🤔', label: 'そもそも方針って必要？', type: 'independent' },
        ],
        cooperativeCount: 2,
        trackTypingIndicator: true,
        typingBotId: 'senpai',
    },

    // ----------------------------------------------------------
    // ステージ4: 食事（ランチの多数決）
    // 選択肢4つ: cooperative×2, independent×2
    // ----------------------------------------------------------
    {
        stageId: 4,
        theme: '食事',
        dayLabel: 'DAY 4',
        messages: [
            { botId: 'senpai', text: '今日のランチどこ行く？' },
            { botId: 'colleague', text: 'カレーがいいな🍛' },
            { botId: 'boss', text: '俺もカレーで！' },
        ],
        options: [
            { emoji: '🍛', label: 'カレーで！', type: 'cooperative' },
            { emoji: '😊', label: 'なんでもいいです！', type: 'cooperative' },
            { emoji: '🍜', label: 'ラーメンで！', type: 'independent' },
            { emoji: '🍝', label: 'パスタで！', type: 'independent' },
        ],
        cooperativeCount: 2,
        trackTypingIndicator: false,
        typingBotId: null,
    },

    // ----------------------------------------------------------
    // ステージ5: 退室（お疲れ様の挨拶）
    // 選択肢4つ: cooperative×2, independent×2
    // ----------------------------------------------------------
    {
        stageId: 5,
        theme: '退室',
        dayLabel: 'DAY 5',
        messages: [
            { botId: 'boss', text: '今日はここまでにしよう、お疲れ！' },
            { botId: 'senpai', text: 'お疲れ様でした！' },
        ],
        options: [
            { emoji: '👋', label: 'すぐ「お疲れ様」を送る', type: 'cooperative' },
            { emoji: '⏳', label: '少し待ってから送る', type: 'cooperative' },
            { emoji: '🚪', label: '無言で退室する', type: 'independent' },
            { emoji: '🙄', label: 'スルーして別の話をする', type: 'independent' },
        ],
        cooperativeCount: 2,
        trackTypingIndicator: true,
        typingBotId: 'colleague',
    },
];
