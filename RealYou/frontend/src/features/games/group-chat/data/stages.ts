/**
 * Game 3: 空気読みグループチャット
 * 5ステージ分のBotメッセージ・選択肢・制限時間・Bot情報
 */

export const STAGE_TIME_LIMIT_MS = 10_000;
export const TOTAL_STAGES = 5;
export const CUTIN_DURATION_MS = 1_200;

export const GROUP_NAME = '第3営業部';
export const GROUP_MEMBER_COUNT = 5;

export interface BotCharacter {
  id: string;
  name: string;
  avatarLabel: string;
  color: string;
}

export const BOTS: BotCharacter[] = [
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

export interface ChatMessageItem {
  botId: string;
  text: string;
}

export interface OptionItem {
  emoji: string;
  label: string;
}

export interface StageDefinition {
  stageId: number;
  theme: string;
  dayLabel: string;
  messages: ChatMessageItem[];
  options: OptionItem[];
  trackTypingIndicator: boolean;
  typingBotId: string | null;
}

// 選択肢の並び順ルール:
//   1, 2番目 = 協調的（多数派に合わせる・空気を読む行動）
//   3, 4番目 = 独自性（自分の意見を通す・空気を読まない行動）
// バックエンドの scoreCalculator が selectedOptionId 1,2 を同調と判定する

export const STAGES: StageDefinition[] = [
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
      { emoji: '🙋', label: 'やります！' }, // 協調: 場の空気に応えて引き受ける
      { emoji: '👀', label: '（様子を見る）' }, // 協調: 波風立てず待つ
      { emoji: '👉', label: '○○さんどう？' }, // 独自: 自分から他者を指名
      { emoji: '😑', label: '既読スルー' }, // 独自: 関わらない
    ],
    trackTypingIndicator: false,
    typingBotId: null,
  },
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
      { emoji: '🎉', label: '' }, // 協調: みんなと同じスタンプ
      { emoji: '🎊', label: '' }, // 協調: 祝賀の同系統スタンプ
      { emoji: '👍', label: '' }, // 独自: 雰囲気と違うスタンプ
      { emoji: '😑', label: '' }, // 独自: 既読スルー
    ],
    trackTypingIndicator: false,
    typingBotId: null,
  },
  {
    stageId: 3,
    theme: '衝突',
    dayLabel: 'DAY 3',
    messages: [
      { botId: 'boss', text: '次のプロジェクトの方針、みんなどう思う？' },
    ],
    options: [
      { emoji: '🤝', label: '先輩の意見を聞きたいです' }, // 協調: 相手を立てる返信
      { emoji: '👀', label: '自分もそう思います' }, // 協調: 同調する返信
      { emoji: '💬', label: '自分はこう思います！' }, // 独自: 自分の意見を主張する返信
      { emoji: '🤔', label: 'そもそも方針って必要？' }, // 独自: 場の流れに逆らう返信
    ],
    trackTypingIndicator: true,
    typingBotId: 'senpai',
  },
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
      { emoji: '🍛', label: 'カレーで！' }, // 協調: みんなと同じ
      { emoji: '😊', label: 'なんでもいいです！' }, // 協調: 合わせる姿勢
      { emoji: '🍜', label: 'ラーメンで！' }, // 独自: 自分の好み
      { emoji: '🍝', label: 'パスタで！' }, // 独自: 自分の好み
    ],
    trackTypingIndicator: false,
    typingBotId: null,
  },
  {
    stageId: 5,
    theme: '退室',
    dayLabel: 'DAY 5',
    messages: [
      { botId: 'boss', text: '今日はここまでにしよう、お疲れ！' },
      { botId: 'senpai', text: 'お疲れ様でした！' },
    ],
    options: [
      { emoji: '👋', label: 'すぐ「お疲れ様」を送る' }, // 協調: 流れに合わせてすぐ返す
      { emoji: '⏳', label: '少し待ってから送る' }, // 協調: タイミングを見て合わせる
      { emoji: '🚪', label: '無言で退室する' }, // 独自: 挨拶なしで抜ける
      { emoji: '🙄', label: 'スルーして別の話をする' }, // 独自: 空気を読まない
    ],
    trackTypingIndicator: true,
    typingBotId: 'colleague',
  },
];
