/**
 * fallbackData.ts
 * キーワードと返答パターンのデータだけを管理するファイル。
 * 返答は話し言葉・TTS読み上げ向け（括弧表記なし）
 *
 * 3ラリー想定:
 * ラリー1: ユーザーが状況を説明する
 * ラリー2: AIの的外れ返答にユーザーが反応・補足する
 * ラリー3: ユーザーが諦める・怒る・別手段を探す
 */

export interface FallbackEntry {
  keywords: string[];
  responses: Array<{ response: string; emotion: string }>;
}

export const FALLBACK_TABLE: FallbackEntry[] = [
  // ===== ラリー1系: 状況説明キーワード =====
  {
    keywords: ['ダッシュボード', 'メイン画面', 'ログイン後', '表示されない', '見えない', '出ない', '真っ白', '白い', '画面移行'],
    responses: [
      { response: 'ページを更新してみてください。F5キーを押すと更新できます。', emotion: 'confident' },
      { response: 'キャッシュが原因の可能性がございます。コントロールとシフトとデリートで削除できます。', emotion: 'confused' },
      { response: 'こちらの環境では正常に表示されておりますので、お客様の環境の問題かと思われます。', emotion: 'apologetic' },
      { response: '別のタブで開き直してみるとうまくいくかもしれません。', emotion: 'neutral' },
    ],
  },
  {
    keywords: ['ログイン', 'パスワード', 'サインイン', 'ログアウト', '認証', 'アカウント', '入れない'],
    responses: [
      { response: 'パスワードは半角英数字で入力していただく必要がございます。たぶん。', emotion: 'confident' },
      { response: 'ログイン画面を一度閉じて、もう一度開いてみてください。', emotion: 'confident' },
      { response: 'パスワードの大文字小文字は区別されますので、ご確認いただけますでしょうか。', emotion: 'neutral' },
      { response: 'ブラウザのCookieをクリアしてみてください。それで直ると思います。', emotion: 'confused' },
      { response: 'ブラウザを変えてみるのが早いかもしれません。根拠はないですけど。', emotion: 'confused' },
    ],
  },
  {
    keywords: ['エラー', 'エラーコード', '500', '404', '403', '不具合', 'バグ', 'おかしい'],
    responses: [
      { response: 'エラーコードはこちらからは確認できないんですよね。申し訳ございません。', emotion: 'apologetic' },
      { response: 'しばらく時間をおいてから再度お試しいただければと思います。', emotion: 'confused' },
      { response: 'そのエラーはですね、まあ、よくあるやつかもしれないです。再読み込みを試してください。', emotion: 'confused' },
      { response: '担当の者に申し伝えるようにいたします。いつ対応できるかはちょっとわからないですが。', emotion: 'apologetic' },
    ],
  },
  {
    keywords: ['メール', '通知', '届かない', '受信', 'スパム', '迷惑メール'],
    responses: [
      { response: '迷惑メールフォルダに届いている可能性がございます。ご確認いただけますでしょうか。', emotion: 'confident' },
      { response: 'メールアドレスの登録内容に誤りがないか、確認してみてください。', emotion: 'confused' },
      { response: '通知設定がオフになっているかもしれません。設定画面からご確認をお願いします。', emotion: 'neutral' },
    ],
  },
  {
    keywords: ['遅い', '重い', '動かない', 'フリーズ', 'クラッシュ', '落ちる', '止まる'],
    responses: [
      { response: 'アプリを一度終了して、再起動してみてください。大体それで直ります。', emotion: 'confident' },
      { response: '端末の空き容量が少なくなっているのかもしれません。違ったらすみません。', emotion: 'confused' },
      { response: 'インターネット回線の状態はいかがでしょうか。Wi-Fiの再接続を試してみてください。', emotion: 'neutral' },
    ],
  },
  {
    keywords: ['解約', '退会', '削除', 'キャンセル', '返金', '課金', '請求'],
    responses: [
      { response: '解約は設定画面のマイページからできると思います。たぶんですけど。', emotion: 'confused' },
      { response: '返金につきましては、規約をご確認いただくのがよいかと思います。', emotion: 'neutral' },
      { response: 'こちらでは解約の手続きがですね、少し難しい状況でして。', emotion: 'apologetic' },
    ],
  },

  // ===== ラリー2系: 補足・反論・追加説明キーワード =====
  {
    keywords: ['でも', 'だって', 'それでも', 'やってみた', '試した', 'やった', 'しても'],
    responses: [
      { response: 'なるほど、それでもだめでしたか。では別の方法を考えてみます。', emotion: 'confused' },
      { response: 'そうですか、試していただいたんですね。もう少し状況を教えていただけますか。', emotion: 'apologetic' },
      { response: 'うーん、それで解決しないとなると、少し難しいかもしれないです。', emotion: 'confused' },
      { response: 'ありがとうございます。では改めて別の観点からご案内できればと思います。', emotion: 'neutral' },
    ],
  },
  {
    keywords: ['なぜなら', 'なぜかというと', 'というのも', 'つまり', 'だから', 'そもそも'],
    responses: [
      { response: 'おっしゃっている内容は把握いたしました。ご説明ありがとうございます。', emotion: 'neutral' },
      { response: 'なるほど、そういう状況なんですね。少し確認させてください。', emotion: 'confused' },
      { response: 'ご丁寧に説明いただきありがとうございます。確認してみます。', emotion: 'confident' },
    ],
  },
  {
    keywords: ['リセット', '再起動', 'やり直し', 'もう一度', '再度', 'リロード', '更新'],
    responses: [
      { response: 'それでも解消されない場合は、設定を初期化してみるのも一つの手かもしれません。', emotion: 'confused' },
      { response: 'もう一度試していただけますか。タイミングによっては直ることもあります。', emotion: 'confident' },
      { response: '再起動はされましたでしょうか。アプリではなく端末ごと再起動すると効果的です。', emotion: 'neutral' },
    ],
  },
  {
    keywords: ['違う', '間違い', 'そうじゃない', 'そういうことじゃなくて', '聞いてない', '関係ない'],
    responses: [
      { response: 'ご不便をおかけして大変申し訳ございません。もう少し詳しく教えていただけますか。', emotion: 'apologetic' },
      { response: 'おっしゃる通りでございます。改めて状況を整理させていただけますでしょうか。', emotion: 'confused' },
      { response: '私の説明が至らず失礼いたしました。どのような状況かをもう一度教えてください。', emotion: 'apologetic' },
      { response: 'ご指摘ありがとうございます。別の方法をご案内できればと思います。', emotion: 'neutral' },
    ],
  },
  {
    keywords: ['確認した', '確認しました', '見た', '見ました', '確かめた'],
    responses: [
      { response: 'ご確認いただいたんですね。それでもだめでしたか。うーん。', emotion: 'confused' },
      { response: 'ありがとうございます。では次のステップとして、別の箇所もご確認いただけますか。', emotion: 'neutral' },
      { response: '確認していただいたにもかかわらず申し訳ございません。別の原因かもしれません。', emotion: 'apologetic' },
    ],
  },

  // ===== ラリー3系: 諦め・怒り・別手段キーワード =====
  {
    keywords: ['もういい', 'いいです', '自分でやる', '諦める', 'あきらめ'],
    responses: [
      { response: 'ご不便をおかけして大変申し訳ございませんでした。', emotion: 'apologetic' },
      { response: 'お力になれず申し訳ございません。またいつでもご連絡ください。', emotion: 'apologetic' },
      { response: 'ご迷惑をおかけしてしまい、誠に申し訳ございませんでした。', emotion: 'apologetic' },
    ],
  },
  {
    keywords: ['別の方法', '他の方法', '他の手段', '直接', '電話', '問い合わせ'],
    responses: [
      { response: 'お問い合わせフォームからもご連絡いただけますよ。たぶん誰かが見てます。', emotion: 'confused' },
      { response: '公式サイトのサポートページにも情報が載っているかもしれません。', emotion: 'neutral' },
      { response: '直接のお電話については、番号がちょっと今手元になくてですね。', emotion: 'apologetic' },
    ],
  },
  {
    keywords: ['解決しない', '解決しました', '直らない', '治らない', '変わらない'],
    responses: [
      { response: '解決しないんですね。こちらとしてもできることが限られておりまして。', emotion: 'apologetic' },
      { response: '引き続き調査いたします。いつになるかはわからないですが。', emotion: 'confused' },
      { response: 'ご報告いただきありがとうございます。技術担当に伝えてみます。', emotion: 'neutral' },
    ],
  },
  {
    keywords: ['最悪', '使えない', 'ひどい', 'おかしい', '意味ない', 'なんで'],
    responses: [
      { response: 'ご不便をおかけして大変申し訳ございません。精一杯対応いたします。', emotion: 'apologetic' },
      { response: 'おっしゃる通りで、こちらとしても反省しております。', emotion: 'apologetic' },
      { response: 'ご迷惑をおかけしてしまい、誠に申し訳ございません。改善に努めます。', emotion: 'apologetic' },
    ],
  },
  {
    keywords: ['急ぎ', '困って', '大事', '緊急', 'すぐ', '早く'],
    responses: [
      { response: 'ご不便をおかけして申し訳ございません。できる限り早急に対応したいと思います。', emotion: 'apologetic' },
      { response: '緊急の場合は、担当部署に直接連絡していただくのが早いかもしれません。', emotion: 'confused' },
      { response: '状況は承りました。優先的に確認するよう努めます。', emotion: 'neutral' },
    ],
  },
  {
    keywords: ['わかった', 'わかりました', 'なるほど', 'そうか', 'そうですか', 'ありがとう'],
    responses: [
      { response: 'ご理解いただきありがとうございます。他にご不明な点があればお気軽にどうぞ。', emotion: 'confident' },
      { response: 'こちらこそ、ご連絡いただきありがとうございました。', emotion: 'neutral' },
      { response: 'お役に立てたなら幸いです。またいつでもご相談ください。', emotion: 'confident' },
    ],
  },
];

export const DEFAULT_RESPONSES: Array<{ response: string; emotion: string }> = [
  { response: 'なるほど、少々お待ちください。今確認しております。', emotion: 'confused' },
  { response: 'ご状況は承りました。弊社のご案内ページをご確認いただけますでしょうか。', emotion: 'confident' },
  { response: 'そのお問い合わせは担当者が対応いたします。', emotion: 'apologetic' },
  { response: 'こちらで確認いたします。しばらくお待ちいただけますでしょうか。', emotion: 'neutral' },
  { response: 'まことに申し訳ございません。もう少し詳しく状況を教えていただけますか。', emotion: 'apologetic' },
  { response: 'ご連絡いただきありがとうございます。確認してご連絡いたします。', emotion: 'neutral' },
  { response: 'おっしゃっている内容は把握いたしました。対応方法を検討いたします。', emotion: 'confused' },
];