# Game 1: 利用規約ゲーム — データ収集仕様

## ゲーム概要

一般的な「長くて読む気が失せる利用規約画面」を模倣し、ユーザーの行動データを収集する。
フロントエンドはデータ収集・送信に集中し、判定ロジック（スコア計算）はバックエンド側で行う。

## 収集データ一覧

| データ                           | 説明                                                                    | 参考: 関連する判定指標 |
| -------------------------------- | ----------------------------------------------------------------------- | ---------------------- |
| `totalTime`                      | ゲーム開始から同意/拒否ボタン押下までの滞在時間（秒）                   | 慎重さ                 |
| `finalAction`                    | `"agree"` or `"disagree"`                                               | —                      |
| `reachedBottom`                  | スクロールが最下部（90%以上）に到達したか                               | 慎重さ                 |
| `scrollEvents`                   | スクロール位置と経過時間のログ（200ms間隔で記録）                       | 冷静さ（速度安定性）   |
| `hiddenInput`                    | 第12条の隠し指示に対するユーザーの入力値（未入力なら `null`）           | 論理性                 |
| `checkboxStates.readConfirm`     | 第5条「読みました」チェックボックスの状態                               | 慎重さ                 |
| `checkboxStates.mailMagazine`    | 第8条「メルマガ受信」チェックボックスの状態（初期値ON）                 | 慎重さ                 |
| `checkboxStates.thirdPartyShare` | 第8条「第三者提供」チェックボックスの状態（初期値ON）                   | 慎重さ                 |
| `popupStats.timeToClose`         | ポップアップ表示から閉じるまでの時間（ms）                              | 冷静さ                 |
| `popupStats.clickCount`          | ポップアップを閉じるまでのクリック回数                                  | 冷静さ                 |
| `popupStats.mouseJitter`         | ポップアップ表示中のマウス余剰移動距離（px）。総移動距離 − 最短直線距離 | 冷静さ                 |
| `agreeButtonHoverTimeMs`         | 「同意する」ボタンにホバーしてからクリックまでの時間（ms）              | 冷静さ                 |

## Game1Data 型定義

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
    "clickCount": 1,
    "mouseJitter": 45.5
  },
  "agreeButtonHoverTimeMs": 800
}
```

**フィールド詳細:**

- `totalTime` (number): 滞在時間（秒）
- `finalAction` ("agree" | "disagree"): 同意 or 拒否
- `reachedBottom` (boolean): 最下部まで到達したか
- `scrollEvents` (array): スクロール位置と時刻のログ
  - `position` (number): スクロール位置（px）
  - `timestamp` (number): 経過時間（ms）
- `hiddenInput` (string | null): 隠し指示への入力（未入力なら null）
- `checkboxStates` (object): 各チェックボックスの最終状態
  - 各要素: `{ "checked": boolean, "changed": boolean }`
- `popupStats` (object): ポップアップ広告への対応
  - `timeToClose` (number): 閉じるまでの時間（ms）
  - `clickCount` (number): 閉じるまでのクリック回数
  - `mouseJitter` (number): マウス余剰移動距離（px）。総移動距離 − 最短直線距離
- `agreeButtonHoverTimeMs` (number): 「同意する」ボタンにホバーしてからクリックまでの時間（ms）

## API連携

**エンドポイント:** `POST /api/games/submit`

**リクエスト:**

```json
{
  "user_id": "uuid-1234-5678",
  "game_type": 1,
  "data": { ... Game1Data ... }
}
```

**レスポンス:**

```json
{
  "status": "success",
  "message": "Game 1 data saved"
}
```
