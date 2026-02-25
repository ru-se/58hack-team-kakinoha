# Game 2: カスタマーサポートチャット — データ収集仕様

## ゲーム概要

ユーザー視点では「ぽんこつな人間のカスタマーサポート担当」と、トラブル（例: ログイン後ダッシュボードが表示されない）について会話する。音声入力・テキスト入力の行動と、音声メトリクス（Web Audio API）・テキストメトリクス（タイピング間隔）を収集する。判定ロジック（スコア計算）はバックエンド側で行う。

**音声処理:** テキスト変換は Web Speech API、音声メトリクス（音量・沈黙・反応速度）は Web Audio API でフロントエンド側のみで処理。バックエンドへの音声ファイル送信は不要。

## 収集データ一覧

| データ                                    | 説明                                                        | 参考: 関連する判定指標 |
| ----------------------------------------- | ----------------------------------------------------------- | ---------------------- |
| `inputMethod`                             | 最初に選択した入力方式（"voice" \| "text"）                 | 積極性                 |
| `turnCount`                               | やり取りの総回数                                            | —                      |
| `turns[].turnIndex`                       | ターン番号（1始まり）                                       | —                      |
| `turns[].inputMethod`                     | そのターンの入力方式                                        | —                      |
| `turns[].reactionTimeMs`                  | 録音開始から喋り出すまでの反応速度（ms）。テキスト時は null | 積極性                 |
| `turns[].speechDurationMs`                | 発話時間（ms）。テキスト時は null                           | 積極性・冷静さ         |
| `turns[].silenceDurationMs`               | 発話中の沈黙合計時間（ms）。テキスト時は null               | 冷静さ                 |
| `turns[].volumeDb`                        | 平均音量（dB）。テキスト時は null                           | 冷静さ                 |
| `turns[].transcribedText`                 | 音声認識テキスト or テキスト入力                            | 論理性                 |
| `textInputMetrics.typingIntervalVariance` | 1文字打つ間隔の分散（テキストターンがない場合は null）      | 冷静さ                 |

**判定への対応:**

- **積極性:** `inputMethod`（音声を選んだか）、`reactionTimeMs`（反応速度）、`speechDurationMs`（発話時間）
- **論理性:** `transcribedText`（接続詞・具体的指摘・フィラーの少なさ）
- **冷静さ:** `volumeDb`、`silenceDurationMs`、`speechDurationMs`、`textInputMetrics.typingIntervalVariance`

## Game2Data 型定義

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
      "transcribedText": "ログイン画面でパスワードを入力しても弾かれます"
    },
    {
      "turnIndex": 2,
      "inputMethod": "voice",
      "reactionTimeMs": 800,
      "speechDurationMs": 12000,
      "silenceDurationMs": 300,
      "volumeDb": -22.1,
      "transcribedText": "いや、それは違います。なぜならパスワードリセットのリンクが表示されないんです"
    },
    {
      "turnIndex": 3,
      "inputMethod": "text",
      "reactionTimeMs": null,
      "speechDurationMs": null,
      "silenceDurationMs": null,
      "volumeDb": null,
      "transcribedText": "もういいです、別の方法を試します"
    }
  ],
  "textInputMetrics": {
    "typingIntervalVariance": 1250.5
  }
}
```

**フィールド詳細:**

- `inputMethod` ("voice" | "text", required): 最初に選択した入力方式
- `turnCount` (number, required): やり取りの総回数
- `turns` (array, required): 各ターンの操作ログ
  - `turnIndex` (number, required): ターン番号（1始まり）
  - `inputMethod` ("voice" | "text", required): そのターンの入力方式
  - `reactionTimeMs` (number | null, required): 録音開始から喋り出すまでの反応速度（ms）。テキスト入力時は null
  - `speechDurationMs` (number | null, required): 発話時間（ms）。テキスト入力時は null
  - `silenceDurationMs` (number | null, required): 発話中の沈黙合計時間（ms）。テキスト入力時は null
  - `volumeDb` (number | null, required): 平均音量（dB）。テキスト入力時は null
  - `transcribedText` (string, required): Web Speech API で変換されたテキスト or テキスト入力
- `textInputMetrics` (object | null, required): テキスト入力時のメトリクス。テキスト入力ターンがない場合は null
  - `typingIntervalVariance` (number): 1文字打つ間隔の分散（タイピングの焦り具合を計測）

## ゲームルール（フロント実装）

- 会話ラリー: **3回固定**。1ラリーの制限時間は **20秒固定**（音声時のみ適用）。
- 会話開始: **サポート担当側の発言**（「どうされましたか？」系）から開始。
- 音声入力: 20秒経過で自動的にラリー終了。
- テキスト入力: 時間経過ではラリー終了しない。送信ボタンで終了。
- デフォルト入力: 音声。テキスト入力への切り替えは画面左下に小さめボタンで提供。

## API連携

### 1. ゲームデータ送信

**エンドポイント:** `POST /api/games/submit`

**トリガー:** ゲームが終了した瞬間（3ラリー完了後）

**リクエスト:**

```json
{
  "user_id": "localStorageから取得",
  "game_type": 2,
  "data": { ... Game2Data ... }
}
```

**レスポンス:**

```json
{
  "status": "success",
  "message": "Game 2 data saved"
}
```

**Loading表示:** API送信中は次の画面への遷移を無効化し、「送信中...」テキストまたはスピナーを表示。

**エラー表示:** APIエラー時は「データ送信に失敗しました」トースト、「リトライ」ボタン、続く場合は「スキップして次へ」オプションを表示。

**成功時:** Game 3 画面（`/games/group-chat`）へ自動遷移。

### 2. AI返答生成（サポート担当の応答）

**エンドポイント:** `POST /api/voice/respond`

**トリガー:** ユーザーの1ラリー完了後、次のサポート担当返答を表示する際に呼び出す

**重要:** 返答内容は演出用であり、性格診断のスコア計算には使用しない。

**リクエスト:**

```json
{
  "user_id": "uuid-1234-5678",
  "message": "パスワードを忘れました",
  "conversation_history": [
    { "role": "user", "content": "ログインできません" },
    { "role": "assistant", "content": "どのような問題でしょうか？" }
  ]
}
```

- `user_id` (string, required): ユーザーID
- `message` (string, required): ユーザーの直近の発言
- `conversation_history` (array, optional): 過去のやり取り（最大5〜10ターン）

**レスポンス（成功 200）:**

```json
{
  "response": "パスワードリセットは設定画面から行えます！（多分）",
  "emotion": "confused",
  "confidence": 0.6
}
```

- `response` (string): サポート担当の返答テキスト
- `emotion` (string): 表情変化用（UI演出、optional）
- `confidence` (number): 回答の自信度（UI演出、optional）

**エラー（400）:** `{ "status": "error", "error": "invalid_user_id", "message": "..." }`

**エラー（500）:** `{ "status": "error", "error": "ai_generation_failed", "message": "..." }`

**現在の仮実装:** `supportResponses.ts` にハードコードされた固定応答で代替。バックエンド接続時にAPI呼び出しへ切り替える。
