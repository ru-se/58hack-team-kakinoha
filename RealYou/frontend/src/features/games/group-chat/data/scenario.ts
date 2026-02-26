/**
 * ============================================================
 * 📝 scenario.ts — グループチャット ゲーム シナリオ定義ファイル
 * ============================================================
 *
 * このファイルだけ編集すれば、グループチャットゲームの
 * テキスト・選択肢・キャラクター・グループ設定をすべて変更できます。
 *
 * ⚠️ ルール（重要）
 * ---------------------------------------------------------
 * 【選択肢の並び順ルール】
 *   options[0], options[1] = 「協調的」な選択肢
 *     → 多数派に合わせる・場の空気を読む・相手を立てる行動
 *   options[2], options[3] = 「独自性」の選択肢
 *     → 自分の意見を通す・空気を読まない・関わらない行動
 *
 *   バックエンドの scoreCalculator が
 *   selectedOptionId 1, 2 を「協調」と判定します。
 *   この並び順を変えるとスコアが正しく計算されません！
 *
 * 【ステージ数のルール】
 *   STAGES の配列の長さが total ステージ数になります。
 *   stages.ts の TOTAL_STAGES と必ず一致させてください。
 *
 * 【typingIndicator のルール】
 *   trackTypingIndicator: true にすると、全メッセージ表示後に
 *   「○○が返信中...」インジケータが表示されます。
 *   typingBotId には BOTS の id を指定してください。
 *   ※ スコア計算に使うタイミング計測はステージ3のみが対象です。
 * ---------------------------------------------------------
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
// id   : stagesのmessages / typingBotId から参照するキー（変更時は下の STAGES も合わせて変更）
// name : 「○○が返信中」やアバター下に表示される名前
// avatarLabel : アバター円の中に表示される1〜2文字
// color       : Tailwind CSS クラス（背景色+テキスト色）

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
// stageId        : 1〜N の連番（変更しない）
// theme          : このステージのテーマ名（デバッグ用・画面には表示されない）
// dayLabel       : ステージ区切りに表示される日付ラベル（例: "DAY 1"）
// messages       : Botが順番に送るチャットメッセージの配列
//   - botId      : SCENARIO_BOTS の id を指定
//   - text       : 表示するメッセージ（絵文字も使用可）
// options        : ユーザーに提示する選択肢（必ず4つ）
//   - emoji      : ボタンに表示する絵文字
//   - label      : ボタンに表示するテキスト（空文字にすると絵文字のみ表示）
// trackTypingIndicator : true = 全メッセージ後に「返信中...」を表示
// typingBotId    : trackTypingIndicator が true のとき表示するBot（falseなら null）

export const SCENARIO_STAGES: StageDefinition[] = [
    // ----------------------------------------------------------
    // ステージ1: 沈黙（幹事の募集）
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
            { emoji: '🙋', label: 'やります！' },           // 協調: 場の空気に応えて引き受ける
            { emoji: '👀', label: '（様子を見る）' },        // 協調: 波風立てず待つ
            { emoji: '👉', label: '○○さんどう？' },          // 独自: 自分から他者を指名
            { emoji: '😑', label: '既読スルー' },            // 独自: 関わらない
        ],
        trackTypingIndicator: false,
        typingBotId: null,
    },

    // ----------------------------------------------------------
    // ステージ2: 祝賀（スタンプの同調）
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
            { emoji: '🎉', label: '' },  // 協調: みんなと同じスタンプ
            { emoji: '🎊', label: '' },  // 協調: 祝賀の同系統スタンプ
            { emoji: '👍', label: '' },  // 独自: 雰囲気と違うスタンプ
            { emoji: '😑', label: '' },  // 独自: 既読スルー
        ],
        trackTypingIndicator: false,
        typingBotId: null,
    },

    // ----------------------------------------------------------
    // ステージ3: 衝突（方針について意見を求められる）
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
            { emoji: '🤝', label: '先輩の意見を聞きたいです' },    // 協調: 相手を立てる返信
            { emoji: '👀', label: '自分もそう思います' },           // 協調: 同調する返信
            { emoji: '💬', label: '自分はこう思います！' },         // 独自: 自分の意見を主張する返信
            { emoji: '🤔', label: 'そもそも方針って必要？' },       // 独自: 場の流れに逆らう返信
        ],
        trackTypingIndicator: true,
        typingBotId: 'senpai',
    },

    // ----------------------------------------------------------
    // ステージ4: 食事（ランチの多数決）
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
            { emoji: '🍛', label: 'カレーで！' },            // 協調: みんなと同じ
            { emoji: '😊', label: 'なんでもいいです！' },    // 協調: 合わせる姿勢
            { emoji: '🍜', label: 'ラーメンで！' },          // 独自: 自分の好み
            { emoji: '🍝', label: 'パスタで！' },            // 独自: 自分の好み
        ],
        trackTypingIndicator: false,
        typingBotId: null,
    },

    // ----------------------------------------------------------
    // ステージ5: 退室（お疲れ様の挨拶）
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
            { emoji: '👋', label: 'すぐ「お疲れ様」を送る' },          // 協調: 流れに合わせてすぐ返す
            { emoji: '⏳', label: '少し待ってから送る' },               // 協調: タイミングを見て合わせる
            { emoji: '🚪', label: '無言で退室する' },                  // 独自: 挨拶なしで抜ける
            { emoji: '🙄', label: 'スルーして別の話をする' },          // 独自: 空気を読まない
        ],
        trackTypingIndicator: true,
        typingBotId: 'colleague',
    },
];
