# Engineer Time Discord Bot

「エンジニア時間」へ予定を入力するためのDiscordボットです。
Discord上で入力された予定を、バックエンドAPIサーバーへ送信する役割を担います。

## 🛠 前提条件

1. **APIサーバーが起動していること**
   - 先に `backend` ディレクトリでAPIサーバーを立ち上げておいてください。
2. **.envファイルの設定**
   - 本ディレクトリ直下に `.env` ファイルを作成し、Botのトークンを設定してください。

## 🚀 起動方法

仮想環境が有効な状態で、以下のコマンドを実行します。

```bash
cd discord_bot
python bot.py
```

## 🔑 .envファイルの設定

`discord_bot` ディレクトリ直下に `.env` ファイルを作成し、以下の内容を記述してください。

```text
DISCORD_BOT_TOKEN=（共有されたDiscord Botのトークン）
API_BASE_URL=http://（ラズパイのIPアドレス）:8000
```
※ ラズパイではなく自分のPCでAPIを動かしてテストする場合は、`API_BASE_URL=http://127.0.0.1:8000` としてください。