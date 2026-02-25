# TalkScope

TalkScope は、専門性の高い会話の理解を補助する Web アプリケーションです。

- 🎙️ **音声認識**（Web Speech API）でリアルタイムに会話を文字起こし
- 🔍 **重要語・専門用語を自動抽出**し、スコアリングして強調表示
- 💬 **バブル UI** で単語の意味をワンタップで確認
- 📌 ピン留め・履歴機能で重要語を記録・再参照

Frontend（React）と Backend（Python / FastAPI）で構成され、形態素解析・係り受け解析・類似度計算などの重い NLP 処理を Backend が担います。

## 🛠 前提条件

以下のツールを事前にインストールしてください。

| ツール | 推奨バージョン | 用途 |
|---|---|---|
| [Bun](https://bun.sh/) | 1.3.9 以上 | Frontend のパッケージ管理・実行 |
| [Node.js](https://nodejs.org/) | 18 以上 | Vite / TypeScript のビルド基盤 |
| [Python](https://www.python.org/) | 3.10 以上 | Backend の実行環境 |
| [uv](https://docs.astral.sh/uv/) | 最新版 | Backend の依存管理・仮想環境 |
| [Docker](https://www.docker.com/)（任意） | 最新版 | Docker 実行時のみ必要 |

> **Note**: Frontend は Bun で動作します（npm / yarn 不可）。Bun 未インストールの場合は `curl -fsSL https://bun.sh/install | bash` でインストールできます。

## 🚀 起動方法
1. Frontend を起動

```bash
cd Frontend
bun install
bun run dev
```

2. Backend を起動

```bash
cd Backend
uv sync
uv run uvicorn main:app --reload
```

3. `http://localhost:5173` にアクセスして利用

## 🔑 .envファイルの設定
例）
```text
DISCORD_BOT_TOKEN=（共有されたDiscord Botのトークン）
API_BASE_URL=http://（ラズパイのIPアドレス）:8000
```