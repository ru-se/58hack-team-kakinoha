# Backend API

ゲーム行動データを収集・分析して、5軸の性格スコアを算出するバックエンドサーバー。

## セットアップ

```bash
npm install
cp .env.example .env  # 環境変数を設定
npm run dev            # 開発サーバー起動 (http://localhost:3001)
```

## 環境変数 (.env)

| 変数名 | 説明 |
|--------|------|
| `PORT` | サーバーポート (デフォルト: 3001) |
| `SUPABASE_URL` | Supabase プロジェクトURL |
| `SUPABASE_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | Google Gemini API Key |

---

## アーキテクチャ

3層 + 分析層で責務を分離しています。

```
リクエスト → routes/ → services/ → repositories/ → Supabase
                            ↓
                       analysis/
```

```
src/
├── routes/          # HTTPリクエストの受け口（Controller層）
├── services/        # ビジネスロジックの組み立て（Service層）
├── repositories/    # DB操作のみ（Repository層）
│   ├── userRepository.ts
│   ├── gameRepository.ts
│   └── analysisResultRepository.ts  ← 結果キャッシュ用
├── analysis/        # 分析・スコア計算ロジック
├── db/              # Supabase接続クライアント
├── types/           # 型定義（FE/BE共通）
└── index.ts         # エントリーポイント
```

### なぜこの構造？

| 層 | 責務 | ルール |
|----|------|--------|
| **routes/** | HTTP受付 + レスポンス返却 | DB・分析ロジックに直接触らない |
| **services/** | バリデーション + 処理の流れの組み立て | repositories と analysis を呼ぶ |
| **repositories/** | Supabase への読み書き | ビジネスロジックを持たない |
| **analysis/** | スコア計算 + フィードバック生成 | `types/` のみに依存。DB無依存 |

**設計意図:**
- **単一責任の原則 (SRP):** 各層は1つの責務だけを持つ。routes は HTTP、repositories は DB、analysis は分析。
- **依存性逆転の原則 (DIP):** routes → services → repositories の順で依存。上位層が下位層に依存し、逆方向の依存はない。
- **開放閉鎖の原則 (OCP):** ゲーム3の分析追加時は `analysis/scoreCalculator.ts` に関数を追加するだけ。routes や repositories の変更は不要。
- **YAGNI:** 今必要ない抽象化（DI コンテナ、interface の多用など）は入れていない。

### analysis/ の独立性

`analysis/` は **DB やHTTPに一切依存しない** 純粋な計算モジュールです。引数でデータを受け取り、結果を返すだけ。このため：

- 他メンバーが独立して開発・テスト可能
- ユニットテストが書きやすい
- フロントのデータ構造が変わっても、ここだけ修正すればOK

---

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `POST` | `/api/register` | ユーザー登録 + ベースラインスコア保存 |
| `POST` | `/api/games/submit` | ゲームプレイデータ送信 |
| `GET` | `/api/results/:user_id` | 診断結果取得 |
| `POST` | `/api/voice/respond` | AI返答生成 (Gemini) |
| `GET` | `/health` | ヘルスチェック |

### リクエスト/レスポンス例

<details>
<summary>POST /api/register</summary>

```json
// Request
{
  "mbti": "ENTP",
  "baseline_answers": {
    "q1_caution": "A",
    "q2_calmness": "D",
    "q3_logic": "B",
    "q4_cooperativeness": "C",
    "q5_positivity": "A"
  }
}

// Response (201)
{ "user_id": "uuid-xxxx", "status": "success" }
```
</details>

<details>
<summary>POST /api/games/submit</summary>

```json
// Request
{
  "user_id": "uuid-xxxx",
  "game_type": 1,
  "data": { /* ゲーム固有のJSON */ }
}

// Response (200)
{ "status": "success", "message": "Game 1 data saved" }
```
</details>

<details>
<summary>POST /api/voice/respond</summary>

```json
// Request
{
  "user_id": "uuid-xxxx",
  "message": "パスワードを忘れました",
  "conversation_history": [
    {"role": "user", "content": "ログインできません"},
    {"role": "assistant", "content": "どのような問題でしょうか？"}
  ]
}

// Response (200)
{
  "response": "パスワードリセットは設定画面から行えます！（多分）",
  "emotion": "confused",
  "confidence": 0.6
}
```
</details>

---

## 分析ロジック

ゲーム3のスコア計算の配線は **実装済み** です。
分析担当は `calculateGame3Scores()` の中身を実装するだけでOK。

**実装済みの配線：**
- `calculateGame3Scores()` のスタブが存在（空 `{}` を返す）
- `combineScores(game1, game2, game3)` に game3 引数が追加済み
- `resultService.ts` で game3 の呼び出しと `game_breakdown.game_3` への格納が済み

**分析担当が実装するファイル：**
- `analysis/scoreCalculator.ts` — 各ゲームのスコア計算ロジック
- `analysis/feedbackGenerator.ts` — フィードバック文生成
- `analysis/phaseSummaryBuilder.ts` — 行動要約テキスト生成

詳細は [ANALYSIS_GUIDE.md](docs/ANALYSIS_GUIDE.md) を参照。

### 結果キャッシュ（analysis_results テーブル）

初回の `GET /api/results/:user_id` で計算→ `analysis_results` に保存。  
2回目以降はキャッシュから返却。`analysisResultRepository.ts` が CRUD を提供。

---

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（ホットリロード付き） |
| `npm run build` | TypeScript → JavaScript コンパイル |
| `npm start` | 本番サーバー起動 |
