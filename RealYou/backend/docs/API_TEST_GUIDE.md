# API テストガイド

バックエンドAPIの動作確認を行うための `curl` コマンド集です。
ターミナルにコピペして実行することで、一連のフロー（登録 → ゲーム送信 → 結果取得）をテストできます。

## 事前準備
- サーバーを起動しておくこと: `npm run dev` (http://localhost:3001)
- データベース（Supabase）が正しく接続されていること
- Supabase に `users`, `game_logs`, `analysis_results` テーブルが作成されていること

---

## 1. ユーザー登録 (`POST /api/register`)

### 正常系
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "mbti": "INTJ",
    "baseline_answers": {
      "q1_caution": "A",
      "q2_calmness": "D",
      "q3_logic": "B",
      "q4_cooperativeness": "C",
      "q5_positivity": "A"
    }
  }'
```
**期待されるレスポンス:**
```json
{
  "user_id": "uuid-string...",
  "status": "success"
}
```

### 異常系（回答不足）
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "mbti": "INTJ",
    "baseline_answers": {
      "q1_caution": "A"
    }
  }'
```
**期待されるレスポンス:** 400 Bad Request

### 異常系（不正な回答値）
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "baseline_answers": {
      "q1_caution": "Z",
      "q2_calmness": "A",
      "q3_logic": "B",
      "q4_cooperativeness": "C",
      "q5_positivity": "D"
    }
  }'
```
**期待されるレスポンス:** 400 Bad Request (`invalid_answers` - "Answers must be one of [A, B, C, D]...")

---

## 2. ゲームデータ送信 (`POST /api/games/submit`)

※ `USER_ID` は登録時に返ってきたIDに置き換えてください。

### Game 1（利用規約ゲーム）
```bash
export USER_ID="ここにUUIDを入力"

curl -X POST http://localhost:3001/api/games/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'$USER_ID'",
    "game_type": 1,
    "data": {
      "totalTime": 120,
      "finalAction": "agree",
      "reachedBottom": true,
      "scrollEvents": [
        {"position": 0, "timestamp": 0},
        {"position": 5000, "timestamp": 15000}
      ],
      "hiddenInput": "確認済み",
      "checkboxStates": {
        "readConfirm": {"checked": true, "changed": true},
        "mailMagazine": {"checked": false, "changed": true},
        "thirdPartyShare": {"checked": false, "changed": true}
      },
      "popupStats": {"timeToClose": 1200, "clickCount": 1}
    }
  }'
```

### Game 2（AIチャット）
```bash
curl -X POST http://localhost:3001/api/games/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'$USER_ID'",
    "game_type": 2,
    "data": {
      "inputMethod": "voice",
      "turnCount": 2,
      "turns": [
        {
          "turnIndex": 1,
          "inputMethod": "voice",
          "reactionTimeMs": 1200,
          "speechDurationMs": 8500,
          "silenceDurationMs": 500,
          "volumeDb": -25.3,
          "transcribedText": "パスワードを入力しても弾かれます"
        },
        {
          "turnIndex": 2,
          "inputMethod": "text",
          "reactionTimeMs": null,
          "speechDurationMs": null,
          "silenceDurationMs": null,
          "volumeDb": null,
          "transcribedText": "別の方法を試します"
        }
      ]
    }
  }'
```

### Game 3（グループチャット）
```bash
curl -X POST http://localhost:3001/api/games/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'$USER_ID'",
    "game_type": 3,
    "data": {
      "tutorialViewTime": 5200,
      "stages": [
        {"stageId": 1, "selectedOptionId": 2, "reactionTime": 3400, "isTimeout": false},
        {"stageId": 2, "selectedOptionId": 1, "reactionTime": 1800, "isTimeout": false},
        {"stageId": 3, "selectedOptionId": 3, "reactionTime": 4500, "isTimeout": false},
        {"stageId": 4, "selectedOptionId": 0, "reactionTime": 10000, "isTimeout": true},
        {"stageId": 5, "selectedOptionId": 1, "reactionTime": 2200, "isTimeout": false}
      ]
    }
  }'
```

### 異常系（空データ）
```bash
curl -X POST http://localhost:3001/api/games/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'$USER_ID'",
    "game_type": 1,
    "data": {}
  }'
```
**期待されるレスポンス:** 400 Bad Request ("data cannot be empty")

---

## 3. 結果取得 (`GET /api/results/:user_id`)

```bash
curl -X GET http://localhost:3001/api/results/$USER_ID
```

**期待されるレスポンス:**
- `scores`: 計算された5軸スコア
- `baseline_scores`: 自己申告スコア
- `gaps`: 実測と自己申告の差分
- `game_breakdown`: ゲーム別スコア（`game_1`, `game_2`, `game_3`）
- `feedback`: 生成されたフィードバックテキスト
- `accuracy_score`: 自己認識精度スコア（0-100）
- `phase_summaries`: 各ゲームの行動要約テキスト

---

## 4. 音声対話 (`POST /api/voice/respond`)

### 通常会話
```bash
curl -X POST http://localhost:3001/api/voice/respond \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'$USER_ID'",
    "message": "パスワードを忘れました"
  }'
```

### 会話履歴付き
```bash
curl -X POST http://localhost:3001/api/voice/respond \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'$USER_ID'",
    "message": "それでは解決しません",
    "conversation_history": [
      {"role": "user", "content": "パスワードを忘れました"},
      {"role": "assistant", "content": "パスワードリセットは設定画面から行えます！（多分）"}
    ]
  }'
```

**期待されるレスポンス:**
```json
{
  "response": "AIの返答テキスト",
  "emotion": "confused",
  "confidence": 0.6
}
```

---

## 5. ヘルスチェック (`GET /health`)

```bash
curl -X GET http://localhost:3001/health
```

**期待されるレスポンス:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-20T00:00:00.000Z",
  "database": "connected",
  "uptime": 3600
}
```
