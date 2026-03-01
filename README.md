# 58hack-team-kakinoha (キメラアプリプロジェクト)

4つの異なる特化型アプリケーション（RealYou, TalkScope, TimeFaker, GrowTree）を、1つの「サイバーパンク / ハッキング」テイストな世界観のポータル画面（MainMenu）へと統合させた「キメラアプリ」です。

## 🌟 本ブランチでの主なアップデート

### 1. MainMenu（ポータルUI）の強化
- **初期アクセス認証 (SYSTEM INITIALIZATION)** の追加:
  初回アクセス時のみ画面全体を覆うモック認証画面が表示され、ユーザーネーム（Designation）の入力が求められます。
  - **対象スクリプト**: `MainMenu/index.html`, `MainMenu/style.css`, `MainMenu/script.js`
  - **詳細ロジック**:
    - `script.js` にて起動時に `localStorage.getItem('chimera_username')` をチェック。存在しない場合は `#auth-overlay` の `hidden` クラスを解除して認証画面を被せます。
    - ユーザーが `#auth-confirm-btn` をクリックすると入力値を取得し（空の場合は 'ANONYMOUS'）、`#loading-overlay` を表示。
    - `setInterval` を用いてフェイクの進捗バー（`width` プロパティの更新）をアニメーションさせ、100%到達時に `#mock-start-btn`（ポータル移行ボタン）を出現させます。
    - 最終的にボタンを押下すると、入力値が LocalStorage に保存され、オーバーレイが除去されて `portalView` が表示されます。また、このタイミングで `triggerFlash()` や `terminalShake` アニメーションを呼び出してサイバー感を演出しています。
- **Semantic Split Gridレイアウト**: 
  - **対象スクリプト**: `MainMenu/style.css`
  - **詳細ロジック**: `:root` セレクタで `--grid-left-width: 1.2fr`、`--grid-right-realyou-width: 1fr` などの変数を定義。`grid-template-areas` と `grid-template-columns`/`rows` を組み合わせて、各アプリのプロモーション画像（大樹、縦長スマホなど）に最もフィットする不等幅・不等高の Bento Grid レイアウトを構成しました。
  - その他、ホバーされていない非アクティブなカードをCSSでボカすフォーカスエフェクトを実装しました。
- **UIコンポーネントのリッチ化・最適化**:
  - **TalkScope**: カード全体の透明な領域にもクリック判定（`pointer-events: auto`）を持たせ操作性を向上。さらに背景へ漂うキーワードバブル（`ts-bubble`）を25個へ大増量し、`backdrop-filter: blur` によるグラスモーフィズム効果とホバー時の活性化アニメーションを追加しました。
  - **RealYou**: スマホ風のチャットUIにおけるメッセージを自然な会話ベースに書き換え、アプリ名と説明文に `.large` `.emphasized` クラスを適用して訴求力を高めました。
  - **GrowTree**: 簡素な線画だった木のSVGを、幹と枝葉が分かれた緻密な「世界樹」風のデザインへ刷新。ホバー時に木全体が成長（スケールアップ）し、鮮やかなサイバーグリーンに発光する効果（`filter: drop-shadow`）を実装しました。
  - **全体レイアウト統制**: アプリカード間の「隙間」にホバーした際に全画面にノイズが誤爆する問題を、JS（`mouseenter` / `mouseleave`）による `.is-card-hovered` クラスの動的制御で解決。さらに `.chaos-grid` の余白を `margin: 6vh auto 0;` へ調整し、あらゆる画面サイズに対し上下中央にバランスよくマウントされるようレイアウトを最適化しました。

### 2. GrowTree（スキルツリー）の大規模拡張
- **1本道化＆自動解放システム**: 
  従来の分岐型・手動解放システムを廃止し、取得ポイント（到達度）に応じて直線的かつ自動的にノードが解放されていくシステムに刷新しました。
  - **対象スクリプト**: `frontend/src/app/skills/page.tsx`, `frontend/src/features/skill-tree/components/SkillNodePanel.tsx`
  - **詳細ロジック**:
    - 従来はユーザーがスキルパネルのボタン（`handleUnlock`）を押し、その場でポイント（コスト）を減算してステータスを `unlocked` へ書き換えていましたが、これを撤廃。
    - 新ロジックでは、現在の獲得ポイント数（`points.web-app` など）がノードの要求値（`requiredPoints` または `requiredPointsMap`）以上になった瞬間に、自動的にノードの状態が `completed` として再評価・描画されるよう修正しました。
    - また、`SkillNodePanel.tsx` 上でも手動の「解放する」ボタンを削除し、「ポイント到達により自動解放されます」というアナウンスのみを表示しています。
- **8階層・全69ノードの「世界樹」化**: 
  各ジャンルのスキル階層を4階層から一気に**8階層**までスケールアップ。さらに、隣接するジャンル間（例: WebとAI等）で両方のポイント条件を満たした際に解放される「**混合ノード（Achievement）**」を合計20個追加し、壮大なスキルツリーへと進化させました。
  - **対象スクリプト**: `frontend/src/features/skill-tree/types/data.ts`
  - **詳細ロジック**:
    - `SKILL_NODES` 配列の内容を大幅拡充。従来の分岐を整理して 1ジャンルあたり8階層の直線ルートを定義。
    - 階層に応じたマイナスY座標（最大 `y = -1750`）と隣接ジャンルの中間X座標を計算し、合計20個の `category: 'mixed'` ノードを織り込みました（例：Tier 2.5、4.5、6.5、8.5 に配置）。
    - 混合ノードは単一の `category` ポイント条件ではなく、`requiredPointsMap: { 'web-app': 4, ai: 4 }` といったオブジェクト形式で設定。両方のジャンルの条件を満たすことで自動解放条件が成立するように構成されています。
- **UIの無効化（Deprecated表示）**:
  - 現在の改造により機能しなくなった左側ボタン（HOME, QUESTS, STATS, RANK, LOGOUT）をすべて無効化しました。
  - **演出**: グレーアウト＋×印のオーバーレイに加え、クリック時に小刻みに揺れるシェイクアニメーションと赤点滅のエフェクトを実装し、システムダウンを演出しています。
- **ゲームバランス調整**:
  - 解放閾値（`requiredPoints`）を実情に合わせて大幅に引き上げ（序盤 60pt 〜 最深部 300pt）。
  - デバッグパネルのポイント付与量を 1クリック **+50pt** に増量。

### 3. TimeFaker（Temporal Override）
- **デイリーDiscord通知システムへの移行**:
  - 従来の「URLごとの遅延通知」から、**「毎日指定時間に固定URLを通知する」**仕様に変更しました。
  - **設定**: 通知時刻はMainMenuのTimeFaker設定（`AppSetting`）から、通知先URLは `.env` の `DISCORD_NOTIFY_URL` から取得します。
  - **重複防止**: その日の通知が完了したことをDBに記録し、1日1回のみ確実に実行されるよう制御しています。

### 4. RealYou（自己診断）
- **問題リストのフィルタリングUI整理**:
  - `ProblemListFlow.tsx` において、完答状況（未回答・満点以外）による絞り込みオプションを非表示化しました。
  - ロジック自体は保持しており、必要に応じて将来的に再有効化が可能です。

---

## 📦 プロジェクト構成

| ディレクトリ | 概要 |
|---|---|
| **MainMenu** | 4つのアプリを束ねるダッシュボード（CHIMERA_OS）。Vanilla JS + CSSで構築された超没入型UI。 |
| **GrowTree** | GitHub活動等からエンジニアの成長をRPG風のツリーとして可視化するアプリ。 |
| **TalkScope** | 講義や会議中の音声を文字起こしし、専門用語をリアルタイムで抽出・解説バブルとして表示する機能。 |
| **TimeFaker** | ターゲットの予定に合わせてデバイスの時計をズラす（Temporal Override）ドッキリ系システム。 |
| **RealYou** | 「空気読み」や理解度チェックをベースにし、自己理解を深めるためのアプリ。 |

## 🚀 起動概要
各アプリのUI開発用フロントエンドは基本的に以下のコマンドで起動・確認が可能です。詳細は各ディレクトリ内の `README.md` や `USER_FLOWS.md` をご確認ください。

```bash
cd [対象のディレクトリ (例: MainMenu)]
npm install
npm run dev
```