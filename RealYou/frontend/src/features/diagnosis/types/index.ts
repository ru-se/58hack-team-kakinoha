export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export type QuestionKey =
  | 'q1_caution'
  | 'q2_calmness'
  | 'q3_logic'
  | 'q4_cooperativeness'
  | 'q5_positivity';

export type BaselineAnswers = Record<QuestionKey, AnswerOption>;

export type QuestionOption = {
  value: AnswerOption;
  label: string;
};

export type Question = {
  key: QuestionKey;
  label: string;
  options: QuestionOption[];
};

export const QUESTIONS: Question[] = [
  {
    key: 'q1_caution',
    label: '初めての街でランチ。お店選びは？',
    options: [
      { value: 'A', label: '口コミを熟読して予約する' },
      { value: 'B', label: '歩きながらスマホで比較する' },
      { value: 'C', label: '外観の雰囲気で決める' },
      { value: 'D', label: '直感でパッと飛び込む' },
    ],
  },
  {
    key: 'q2_calmness',
    label: '感動的な映画を見終わった直後は？',
    options: [
      { value: 'A', label: 'ストーリーの構成を分析する' },
      { value: 'B', label: '心の中で静かに余韻に浸る' },
      { value: 'C', label: '「最高だった！」と熱く語る' },
      { value: 'D', label: '感情移入して思い切り泣く' },
    ],
  },
  {
    key: 'q3_logic',
    label: '新しい服を買うときの決め手は？',
    options: [
      { value: 'A', label: '着回しやすさや素材の良さ' },
      { value: 'B', label: '今の流行や使い勝手' },
      { value: 'C', label: 'デザインの第一印象' },
      { value: 'D', label: '一目惚れで即決' },
    ],
  },
  {
    key: 'q4_cooperativeness',
    label: '大人数での食事。自分の注文は？',
    options: [
      { value: 'A', label: '全体のバランスを見て合わせる' },
      { value: 'B', label: '浮かない範囲で好きなものを頼む' },
      { value: 'C', label: '周りを気にせず食べたいものを頼む' },
      { value: 'D', label: '自分のイチオシをみんなにも勧める' },
    ],
  },
  {
    key: 'q5_positivity',
    label: '初対面の人が多いパーティーでは？',
    options: [
      { value: 'A', label: '自分からどんどん話しかける' },
      { value: 'B', label: '目が合った人に挨拶してみる' },
      { value: 'C', label: '話しかけられるのを笑顔で待つ' },
      { value: 'D', label: '聞き役に徹して相槌を打つ' },
    ],
  },
];
