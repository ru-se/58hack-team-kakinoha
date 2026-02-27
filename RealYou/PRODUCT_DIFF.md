# PRODUCT_DIFF.md — RealYou 改造変更履歴

> キメラアプリ化に向けた RealYou の改造内容をまとめた差分ドキュメントです。

---

## 変更サマリー

| # | 変更内容 | 影響ファイル |
|---|---|---|
| 1 | 起動フローの変更（トップ→ゲーム3へ直行） | `page.tsx` |
| 2 | グループチャット シナリオのスクリプタブル化 | `scenario.ts`（新規）, `stages.ts` |
| 3 | 選択肢数・ステージ数のスクリプタブル化 | `stages.ts`, `scenario.ts`, `GroupChatGameFlow.tsx` |
| 4 | 理解度フェーズ・復習フェーズの追加 | `quizContent.ts`（新規）, `quiz/page.tsx`（新規） |
| 5 | バックエンド依存パッケージの修正 | `package.json`（uuid v8へダウングレード） |

---

## 詳細

---

### 1. 起動フローの変更

**変更前:** トップ画面 → スタートボタン → `/games/terms`（利用規約ゲーム）

**変更後:** トップ画面 → スタートボタン → `/quiz`（理解度入力）

```diff
// frontend/src/app/page.tsx
- router.push('/games/terms');
+ router.push('/quiz');
```

---

### 2. グループチャット シナリオのスクリプタブル化

シナリオのテキスト・選択肢・Bot設定を `scenario.ts` に分離。`stages.ts` は型定義・定数のみに整理。

**新規ファイル:** `frontend/src/features/games/group-chat/data/scenario.ts`

編集可能な内容:
- グループ名・メンバー数 (`SCENARIO_GROUP_NAME`, `SCENARIO_GROUP_MEMBER_COUNT`)
- Botキャラクター定義 (`SCENARIO_BOTS`)
- 全ステージのメッセージ・選択肢 (`SCENARIO_STAGES`)

**変更ファイル:** `frontend/src/features/games/group-chat/data/stages.ts`

```diff
- // BOTS, STAGES, GROUP_NAME等のデータを直接定義していた
+ // 型定義・定数のみ。データは scenario.ts からインポート
+ export const BOTS = SCENARIO_BOTS;
+ export const STAGES = SCENARIO_STAGES;
```

---

### 3. 選択肢数・ステージ数のスクリプタブル化

#### 3-1. TOTAL_STAGES の自動導出

```diff
// stages.ts
- export const TOTAL_STAGES = 5;
+ export const TOTAL_STAGES: number = SCENARIO_STAGES.length;
```

`SCENARIO_STAGES` 配列の length から自動計算されるため、ステージ追加時に手動変更不要。

#### 3-2. OptionItem への `type` と `cooperativeCount` フィールド追加

```typescript
// stages.ts
interface OptionItem {
  emoji: string;
  label: string;
  type: 'cooperative' | 'independent'; // 追加
}

interface StageDefinition {
  // ...既存フィールド
  cooperativeCount: number; // 追加: 先頭N個が協調と判定される
}
```

#### 3-3. 絵文字グリッドの最大列数変更

```diff
// GroupChatGameFlow.tsx
- gridTemplateColumns: `repeat(${Math.min(currentStage.options.length, 4)}, ...)`,
+ gridTemplateColumns: `repeat(${Math.min(currentStage.options.length, 5)}, ...)`,
```

#### 3-4. カットインラベルの動的生成

```diff
// GroupChatGameFlow.tsx
- {['First', 'Second', 'Third', 'Fourth', 'Final'][currentStageIndex] ?? 'Unknown'}
+ {currentStageIndex === STAGES.length - 1 ? 'Final' : `${currentStageIndex + 1} / ${STAGES.length}`}
```

---

### 4. 理解度フェーズ・復習フェーズの追加

スタート画面から `/quiz` へ遷移する新しいフローを追加。

**画面遷移:**
```
/quiz → /result
```

**フェーズ構成:**

| フェーズ | 内容 |
|---|---|
| understanding-intro | 「理解度を答えてください」説明画面 |
| understanding | 5択で理解度を回答 |
| review-intro | 「復習問題を出します」説明画面 |
| review | 復習問題（正誤フィードバック付き）|
| completed | `/result` へ自動遷移 |

**新規ファイル:**
- `frontend/src/features/quiz/data/quizContent.ts` — 質問文・選択肢・復習問題データ（編集用）
- `frontend/src/app/quiz/page.tsx` — クイズページ本体（フェーズ管理）

**変更ファイル:**

```diff
// GroupChatGameFlow.tsx
- router.push('/result');
+ router.push('/quiz');
```

**コンテンツ編集方法:**

`quizContent.ts` の以下の変数を編集するだけで内容を変更できます。

| 変数 | 内容 |
|---|---|
| `UNDERSTANDING_INTRO` | 理解度フェーズ説明文 |
| `UNDERSTANDING_QUESTION` | 理解度の質問文 |
| `UNDERSTANDING_OPTIONS` | 5段階の選択肢（emoji, label, value） |
| `REVIEW_INTRO` | 復習フェーズ説明文 |
| `REVIEW_QUESTIONS` | 復習問題配列（問題文・選択肢・正解・解説） |

---

### 5. バックエンド依存パッケージの修正

`uuid` v13（ESM専用）と `ts-node-dev`（CommonJS）の非互換を解消。

```diff
// backend/package.json
- "uuid": "^13.0.0"
+ "uuid": "^8.3.2"
```

---

## 変更後のアプリフロー

```
[1] トップ画面
      ↓ スタート
[2] 空気読みグループチャット（/games/group-chat）
      ↓ 全ステージ完了
[3] 理解度チェック（/quiz）
    ├─ 理解度説明 → 5択回答
    └─ 復習説明 → 正誤問題（全問）
      ↓ 完了
[4] 結果レポート（/result）
```

---

## 編集ガイド — シナリオを変えたいとき

| やりたいこと | 編集するファイル |
|---|---|
| グループチャットのメッセージ・選択肢を変える | `scenario.ts` |
| ステージを増やす・減らす | `scenario.ts`（要素を追加/削除するだけ） |
| 理解度の質問・選択肢を変える | `quizContent.ts` |
| 復習問題を変える・追加する | `quizContent.ts` の `REVIEW_QUESTIONS` |
