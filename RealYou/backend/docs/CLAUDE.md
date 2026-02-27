# 🧠 プロジェクトコンテキスト：キメラプロダクト（バックエンド）

## プロジェクト概要
複数の既存アプリを融合させた「キメラプロダクト」のバックエンドです。
既存の「RealYou（性格診断アプリ）」のコードベースに、新機能（クイズ・スキルツリー）を追加しています。

---

## 技術スタック
- **Runtime**: Node.js / TypeScript
- **Framework**: Express v5
- **DB**: Supabase（PostgreSQL）
- **AI**: Google Gemini API
- **バリデーション**: Zod v4
- **パス**: `RealYou/backend/src/`

---

## アーキテクチャ（3層構造）
routes/ → services/ → repositories/ → Supabase
↓
analysis/（純粋な計算ロジック、DB無依存）
| 層 | 責務 |
|----|------|
| `routes/` | HTTPリクエスト受付・レスポンス返却 |
| `services/` | ビジネスロジック |
| `repositories/` | Supabaseへの読み書きのみ |
| `analysis/` | スコア計算・フィードバック生成（DB無依存） |
| `schemas/` | Zodスキーマ・DTO型定義 |

---

## DBスキーマ（Supabase）

### 既存テーブル（RealYouから流用・カラム追加済み）
```sql
users (
  id UUID PK,
  self_mbti VARCHAR,
  baseline_caution INT, baseline_calmness INT, baseline_logic INT,
  baseline_coop INT, baseline_positive INT,
  -- ↓ キメラ用に追加したカラム
  name TEXT NOT NULL,
  auth_type TEXT DEFAULT 'dummy',
  auth_payload JSONB DEFAULT '{}',
  exp_web INT DEFAULT 0,
  exp_ai INT DEFAULT 0,
  exp_security INT DEFAULT 0,
  exp_infrastructure INT DEFAULT 0,
  exp_design INT DEFAULT 0,
  exp_game INT DEFAULT 0,
  created_at TIMESTAMPTZ
)

game_logs (
  id SERIAL PK,
  user_id UUID FK -> users.id,
  game_type INT CHECK (1-3),
  raw_data JSONB,
  played_at TIMESTAMP,
  UNIQUE(user_id, game_type)
)

analysis_results (
  user_id UUID PK FK -> users.id,
  score_caution INT, score_calmness INT, score_logic INT,
  score_coop INT, score_positive INT,
  mbti_caution INT, mbti_calmness INT, mbti_logic INT,
  mbti_coop INT, mbti_positive INT,
  gap_caution INT, gap_calmness INT, gap_logic INT,
  gap_coop INT, gap_positive INT,
  feedback_title VARCHAR, feedback_description TEXT, feedback_gap_point VARCHAR,
  game_contributions JSONB, accuracy_score INT, phase_summaries JSONB,
  details JSONB, created_at TIMESTAMP
)
```

### 新規テーブル（キメラ用）
```sql
quizzes (
  id UUID PK DEFAULT gen_random_uuid(),
  created_by UUID FK -> users.id ON DELETE RESTRICT,
  title TEXT NOT NULL,
  max_points INT CHECK (10-100),
  genres JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ
)

questions (
  id UUID PK DEFAULT gen_random_uuid(),
  quiz_id UUID FK -> quizzes.id ON DELETE CASCADE,
  order_num INT CHECK (>= 1),
  question_text TEXT,
  options JSONB,
  correct_index INT CHECK (>= 0),
  created_at TIMESTAMPTZ
)

quiz_results (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK -> users.id ON DELETE CASCADE,
  quiz_id UUID FK -> quizzes.id ON DELETE CASCADE,
  correct_count INT CHECK (>= 0),
  total_questions INT CHECK (> 0),
  earned_points INT CHECK (>= 0),
  created_at TIMESTAMPTZ,
  CHECK (correct_count <= total_questions),
  UNIQUE(user_id, quiz_id)  -- 初回のみEXP獲得、2回目以降はスキップ
)
```

---

## Zodスキーマ（`src/schemas/`）
```typescript
// dbSchema.ts
UserSchema, QuizSchema, QuestionSchema, QuizResultSchema
// ポイント: QuestionSchemaにcorrect_index < options.lengthのrefine済み
// ポイント: QuizResultSchemaにcorrect_count <= total_questionsのrefine済み

// authSchema.ts
ChimeraRegisterSchema // name, auth_type('dummy'|'pose'), auth_payload

// quizSchema.ts
QuizSubmitRequestSchema // 既存のギャップ分析用
```

---

## APIエンドポイント一覧

### 既存（RealYouから流用・動作確認済み）
| Method | Path | 状態 |
|--------|------|------|
| POST | `/api/register` | 既存（mbti + baseline_answers） |
| POST | `/api/games/submit` | 既存 |
| GET | `/api/results/:user_id` | 既存 |
| POST | `/api/voice/respond` | 既存（Gemini連携済み） |
| GET | `/health` | 既存 |

### キメラ用（実装済み）
| Method | Path | 状態 |
|--------|------|------|
| POST | `/api/register/chimera` | ✅ 本実装済み |
| POST | `/api/quizzes/generate` | 🟡 モック（3秒遅延・固定JSON） |
| GET | `/api/quizzes/:quiz_id/questions` | 🟡 モック（ダミー3問） |
| POST | `/api/quizzes/:quiz_id/submit` | 🟡 一部モック（earned_points, total_expがモック値） |

---

## API仕様

### POST `/api/register/chimera`
```typescript
// Request
{ name: string, auth_type?: 'dummy'|'pose', auth_payload?: any }
// Response
{ user_id: string, message: string }
```

### POST `/api/quizzes/generate`
```typescript
// Request
{ user_id: string, presentation_text: string }
// Response
{ quiz_id: string, max_points: number, genres: GenreRatio, message: string }
```

### GET `/api/quizzes/:quiz_id/questions`
```typescript
// Response
{ questions: Array<{ id, quiz_id, order_num, question_text, options, correct_index }> }
```

### POST `/api/quizzes/:quiz_id/submit`
```typescript
// Request
{ user_id: string, self_evaluation: number(1-5), answers: Array<{ question_id: string, selected_index: number }> }
// Response
{
  actual_score: number, gap: number, feedback_message: string,
  chimera_parameters: { lucky, happy, nice, cute, cool },
  rival_parameters: { lucky, happy, nice, cute, cool },
  earned_points: number,  // 初回のみ加算、2回目以降は0
  total_exp: { web, ai, security, infrastructure, design, game }
}
```

---

## 今後の実装タスク（優先順）

1. **CORS設定の追加**（最優先・フロント結合前に必須）
2. **Geminiプロンプト設計とJSON出力の安定化**（`aiGenerationService.ts` 新規作成）
3. **AI生成結果のDBトランザクション保存処理**（quizzes→questionsへの順次INSERT、ロールバック対応）
4. **AI問題生成ルーター `/generate` の本実装**（モックを差し替え）
5. **`/:quiz_id/questions` の本実装**（Zod・型定義追加も含む）
6. **採点時の経験値計算・履歴保存サービス実装**（earned_pointsのモックを差し替え）
7. **Submitルーターと既存ギャップ分析の結合**（total_expのモックを差し替え）

---

## 重要な設計ルール

- **既存コードは絶対に削除・変更しない**（RealYouの既存機能を壊さない）
- **新しい処理は追記する形で実装する**
- **コミットメッセージは `feat: 日本語で何をしたか` 形式**
- **earned_pointsは初回プレイのみ加算（UNIQUE制約で2回目以降はスキップ）**
- **genres の割合はバックエンドで合計1.0に正規化して返す**
- **採点はバックエンドで実施（correct_indexとの照合はサーバー側）**