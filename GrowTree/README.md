# Grow Tree

ユーザーの外部サービス活動実績とポートフォリオを元に、現在のエンジニアとしての立ち位置（ランク）を判定し、RPG風の成長要素（スキルツリー・バッジ）と、そこから導き出される「パーソナライズされた演習生成」を提供する。

## 🛠 前提条件

- Docker
- Docker Compose
  Dockerを使わない場合以下を

| ツール                                                                       | 推奨バージョン | 用途                              |
| ---------------------------------------------------------------------------- | -------------- | --------------------------------- |
| [Bun](https://bun.sh/)                                                       | 1.3.9 以上     | Frontend のパッケージ管理・実行   |
| [Node.js](https://nodejs.org/)                                               | 18 以上        | Next.js / TypeScript のビルド基盤 |
| [Python](https://www.python.org/)                                            | 3.10 以上      | Backend の実行環境                |
| [Poetry](https://python-poetry.org/) または [uv](https://docs.astral.sh/uv/) | 最新版         | Backend の依存管理・仮想環境      |

## 🚀 起動方法

` docker-compose up --build`

データがない場合は、初回起動後に以下を実行してテストデータを投入してください。

```bash
docker compose exec backend poetry install
docker compose exec backend poetry run alembic upgrade head
```

(dockerを使用しない場合は、最後のpoetryコマンドをローカル環境で実行してください)

## 🔑 .envファイルの設定

backend/.env.example をコピーして backend/.env を作成し、必要な環境変数を設定してください。特に、GitHub APIキーはスキルツリー生成APIのテストに必要です。
