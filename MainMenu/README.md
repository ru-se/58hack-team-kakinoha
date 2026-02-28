# CHIMERA_OS (Main Menu)

CHIMERA_OS（メインメニュー）は、チームで開発した4つの異なるアプリケーション（TalkScope, RealYou, GrowTree, TimeFaker）を1か所に統合・ポイズン（浸食）させるポータルUIです。

- 🍱 **優先順配置 (Prioritized Bento Layout)**: スクロールなしの1画面に収めつつ、各アプリの優先度に基づく不均等サイズのグリッドレイアウト。
- 📱 **意味的分割グリッド (Semantic Split Grid)**: CSS変数による左・右、上・下の分割。スマホ（RealYou）、大樹（GrowTree）、横長時計（TimeFaker）、空間（TalkScope）の固有プロポーションを尊重。
- 📺 **シームレスなiframe連携**: アプリ起動時の軽量な Vanilla JS によるアニメーション付き `iframe` 遷移。
- 🧬 **ディープな没入感 (Deep Context UI)**: ホバー時に枠の限界まで拡大する固有のUIパーツ群とアプリごとの特殊背景（Vibrant Marble）。

## 🛠 前提条件

以下のツールを事前にインストールしてください。

| ツール | 推奨バージョン | 用途 |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18 以上 | Vite の実行およびパッケージ管理の基盤 |
| npm | 最新版 | 依存関係のインストール |

## 🚀 起動方法

1. フォルダへ移動し、パッケージをインストール

```bash
cd MainMenu
npm install
```

2. 開発サーバーを起動

```bash
npm run dev
```

3. ターミナルに表示される URL（通常は `http://localhost:3000` または `http://localhost:5173`）にアクセス

> **Note**: メニュー部分は React を使わない超軽量な Vanilla JS + CSS Grid 構成ですが、高速なビルドと開発体験のために Vite を採用しています。

## 📦 本番用ビルド

本番環境向けにアセットをバンドル・最適化する場合は以下のコマンドを実行します。

```bash
npm run build
```
出力先は `dist/` フォルダとなります。
