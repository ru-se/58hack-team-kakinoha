# 📋 分析ロジック引き継ぎガイド（for たまちゃ）

## このドキュメントは何？

あなたが触るのは `src/analysis/` フォルダだけです。  
このガイドでは「何を読めばどんなデータが手に入るか」「最終的に何を返せばいいか」を説明します。

---

## 🏗 全体像（3分で理解）

```
ユーザーがゲームを遊ぶ
    ↓
フロントエンドがゲームの行動データを送信
    ↓
POST /api/games/submit → game_logs テーブルに raw_data（JSON）として保存
    ↓
全ゲーム終了後（3ゲーム全て）、フロントが結果を取得
    ↓
GET /api/results/:user_id
    ↓
サーバーが game_logs からデータを取得
    ↓
★ ここであなたの関数が呼ばれる ★
    ↓
analysis/scoreCalculator.ts   → ゲームデータ → 5軸スコア(0-100)に変換
analysis/feedbackGenerator.ts → スコア + ギャップ → フィードバック文を生成
analysis/phaseSummaryBuilder.ts → raw_data → 行動要約テキストを生成
    ↓
analysis_results テーブルにキャッシュとして保存
    ↓
フロントに返却 → 結果画面に表示
```

---

## 📂 あなたが触るファイル

```
src/analysis/
├── scoreCalculator.ts      ← ゲームデータ → スコア変換（メイン作業）
├── feedbackGenerator.ts    ← スコア → フィードバック文生成
├── phaseSummaryBuilder.ts  ← raw_data → 行動要約テキスト生成
└── mbtiScoreTable.ts       ← MBTI→理論値変換（実装済み、触らなくてOK）
```

**依存するファイル（読むだけ、編集不要）：**
- `src/types/index.ts` — 型定義（`BaselineScores` など）

**触らなくていいファイル：**
- `routes/`, `services/`, `repositories/`, `db/` — データの保存・取得は全部こちらで済んでいます

---

## 📦 手に入るデータ（引数で渡ってくるもの）

あなたの関数には `rawData: any` が渡されます。  
これはフロントエンドが `POST /api/games/submit` で送った `data` フィールドの中身です。

### ゲーム1（利用規約ゲーム）の rawData

```json
{
  "totalTime": 120,
  "finalAction": "agree",
  "reachedBottom": true,
  "scrollEvents": [
    { "position": 0, "timestamp": 0 },
    { "position": 1200, "timestamp": 3500 },
    { "position": 3000, "timestamp": 8000 },
    { "position": 5000, "timestamp": 15000 }
  ],
  "hiddenInput": "確認済み",
  "checkboxStates": {
    "readConfirm": { "checked": true, "changed": true },
    "mailMagazine": { "checked": false, "changed": true },
    "thirdPartyShare": { "checked": false, "changed": true }
  },
  "popupStats": {
    "timeToClose": 1200,
    "clickCount": 1
  }
}
```

**フィールド説明：**
- `totalTime` (number): 滞在時間（秒）
- `finalAction` ("agree" | "disagree"): 同意 or 拒否
- `reachedBottom` (boolean): 最下部まで到達したか
- `scrollEvents` (array): スクロール位置と時刻のログ（速度計算用）
- `hiddenInput` (string | null): 隠し指示の入力欄に打った文字列（未入力なら null）
- `checkboxStates` (object): 各チェックボックスの最終状態
  - `readConfirm`: 第5条「読みました」チェックボックス
  - `mailMagazine`: 第8条「メルマガ受信」チェックボックス（初期値ON）
  - `thirdPartyShare`: 第8条「第三者提供」チェックボックス（初期値ON）
- `popupStats` (object): ポップアップ広告への対応データ

**このデータで測りたいもの：**
- � **慎重さ** — `reachedBottom`, `totalTime`, `checkboxStates`（不要チェックを外したか）
- � **論理性** — `hiddenInput`（隠し指示を発見・実行したか）
- 🔹 **冷静さ** — `popupStats`（短時間・少クリックで閉じたか）, `scrollEvents`の速度安定性

---

### ゲーム2（AIカスタマーサポート）の rawData

```json
{
  "inputMethod": "voice",
  "turnCount": 3,
  "turns": [
    {
      "turnIndex": 1,
      "inputMethod": "voice",
      "reactionTimeMs": 1200,
      "speechDurationMs": 8500,
      "silenceDurationMs": 500,
      "volumeDb": -25.3,
      "transcribedText": "ログインして移動したのに、ダッシュボードが真っ白で何も表示されません"
    },
    {
      "turnIndex": 2,
      "inputMethod": "voice",
      "reactionTimeMs": 800,
      "speechDurationMs": 12000,
      "silenceDurationMs": 300,
      "volumeDb": -22.1,
      "transcribedText": "いや、キャッシュの問題ではないと思います。なぜなら別のブラウザで試しても画面が出ないんです"
    },
    {
      "turnIndex": 3,
      "inputMethod": "text",
      "reactionTimeMs": null,
      "speechDurationMs": null,
      "silenceDurationMs": null,
      "volumeDb": null,
      "transcribedText": "もう解決しそうにないので、エンジニアの方に確認してもらえますか"
    }
  ]
}
```

**フィールド説明：**
- `inputMethod` ("voice" | "text"): 最初に選択した入力方式
- `turnCount` (number): やり取りの総回数
- `turns` (array): 各ターンの操作ログ
  - `turnIndex` (number): ターン番号（1始まり）
  - `inputMethod` ("voice" | "text"): そのターンの入力方式
  - `reactionTimeMs` (number | null): 録音開始から喋り出すまでの時間（ms）。テキスト入力時は null
  - `speechDurationMs` (number | null): 発話時間（ms）。テキスト入力時は null
  - `silenceDurationMs` (number | null): 発話中の沈黙合計時間（ms）。テキスト入力時は null
  - `volumeDb` (number | null): 平均音量（デシベル）。テキスト入力時は null
  - `transcribedText` (string): Web Speech API で変換されたテキスト or テキスト入力

**このデータで測りたいもの：**
- � **積極性** — `inputMethod`（音声を選んだか）, `reactionTimeMs`（反応速度）, `speechDurationMs`（発話時間）
- � **論理性** — `transcribedText`（接続詞の使用・具体的指摘・フィラーの少なさ）
- � **冷静さ** — `volumeDb`（音量の安定性）, `silenceDurationMs`（沈黙の多さ）

---

### ゲーム3（グループチャット）の rawData

```json
{
  "tutorialViewTime": 5200,
  "stages": [
    { "stageId": 1, "selectedOptionId": 2, "reactionTime": 3400, "isTimeout": false },
    { "stageId": 2, "selectedOptionId": 1, "reactionTime": 1800, "isTimeout": false },
    { "stageId": 3, "selectedOptionId": 3, "reactionTime": 4500, "isTimeout": false },
    { "stageId": 4, "selectedOptionId": 0, "reactionTime": 10000, "isTimeout": true },
    { "stageId": 5, "selectedOptionId": 1, "reactionTime": 2200, "isTimeout": false }
  ]
}
```

**フィールド説明：**
- `tutorialViewTime` (number): チュートリアル説明を閉じるまでの時間（ms）
- `stages` (array): 全5ステージの操作ログ
  - `stageId` (number): ステージ番号 (1～5)
  - `selectedOptionId` (number | null): 選んだ選択肢のID (1～4)。時間切れの場合は `0` または `null`
  - `reactionTime` (number): 選択肢が表示されてから決定（または時間切れ）までの時間（ms）
  - `isTimeout` (boolean): 時間切れで終了したか

**ステージ一覧：**

| # | シチュエーション | 概要 |
|---|---|---|
| 1 | 沈黙 | 誰も返信しない中、立候補するか待つか |
| 2 | 祝賀 | 周りに合わせたスタンプを押すか、違うものを押すか |
| 3 | 衝突 | 相手も入力中の時、譲るか送信するか |
| 4 | 食事 | 全員同じメニューの中、自分の注文を選ぶ |
| 5 | 退室 | どのタイミングで「お疲れ様」を送るか |

**このデータで測りたいもの：**
- � **協調性** — `selectedOptionId`（他者と同じ選択=同調）, ステージ3で譲る行動
- � **積極性** — 独自の選択, `reactionTime`（即答=主導権）, `isTimeout`（時間切れ=優柔不断）

---

## ✅ あなたのチェックリスト

### 必須タスク

- [ ] **`calculateGame1Scores(rawData)`** のスコア計算を書き直す
  - 現在の仮実装は旧仕様の raw_data を参照しているので、上記の最新仕様に合わせる
  - 返り値: `{ caution: number, logic: number, calmness: number }`

- [ ] **`calculateGame2Scores(rawData)`** のスコア計算を書き直す
  - 現在の仮実装は旧仕様の `voiceTurns` 等を参照しているので、`turns` に書き換え
  - 返り値: `{ positivity: number, logic: number, calmness: number }`

- [ ] **`calculateGame3Scores(rawData)`** のスコア計算を実装する
  - 現在はスタブ（空 `{}` を返すだけ）
  - 返り値: `{ cooperativeness: number, positivity: number }`

- [ ] **`generateFeedback()`** を改善する
  - ギャップの方向（正/負）に応じたテキスト分岐
  - 例: 自己申告80 → 実測20 → 「慎重だと思っていたが大胆でした」
  - 例: 自己申告20 → 実測80 → 「大胆だと思っていたが実は慎重でした」

- [ ] **`buildPhaseSummaries(game1Raw, game2Raw, game3Raw)`** を実装する
  - 現在はスタブ（「分析結果を準備中...」を返すだけ）
  - 返り値: `{ phase_1: string, phase_2: string, phase_3: string }`
  - 例: `{ phase_1: "規約を2秒で読み飛ばし、即座に同意ボタンを押しました" }`

### 済み（触らなくてOK）

- [x] **`calculateGame3Scores()`** のスタブ作成・配線 — ryu対応済み
- [x] **`combineScores()`** のゲーム3対応 — ryu対応済み（引数に `game3Scores` 追加済み）
- [x] **`resultService.ts`** でゲーム3の呼び出し — ryu対応済み

---

## 📐 5軸スコアの基準

全て **0～100** の整数値。

| スコア | 意味 |
|--------|------|
| 0 | その傾向が非常に弱い |
| 50 | 平均的 |
| 100 | その傾向が非常に強い |

返り値は必ず `Math.min(100, Math.max(0, Math.round(値)))` で 0～100 に収めてください。

---

## ❓ 困ったら

- `types/index.ts` の `BaselineScores` インターフェースを見れば、5軸のキー名がわかります
- `rawData` の中身がわからないときはフロントチームに「何を送るか」を確認してください
- ゲームの仕様は Notion/Discord の企画資料を参照してください
