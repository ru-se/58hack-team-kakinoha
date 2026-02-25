# Time Faker

「エンジニア時間」へ予定を入力するためのDiscordボットの起動の仕方を記述します。
Discord上で入力された予定を、バックエンドAPIサーバーへ送信する役割を担います。

## 🛠 前提条件

1. **APIサーバーが起動していること**
   - 先に `backend` ディレクトリでAPIサーバーを立ち上げておいてください。
2. **.envファイルの設定**
   - 本ディレクトリ直下に `.env` ファイルを作成し、Botのトークンを設定してください。

## 🚀 起動方法

### 1. 仮想環境 (venv) の作成
discord_botディレクトリに移動
```
cd ./TimeFaker/discord_bot
```

プロジェクトのフォルダ内でターミナル（またはコマンドプロンプト）を開き、OSに合わせて実行してください。

Mac / Linux / Raspberry Pi の場合:

``` Bash
python3 -m venv venv
```
Windows の場合:

```Bash
python -m venv venv
```

### 2. 仮想環境の有効化 (Activate)
仮想環境に入ります。コマンドラインの先頭に (venv) と表示されれば成功です。

Mac / Linux / Raspberry Pi の場合:

```Bash
source venv/bin/activate
```
Windows (コマンドプロンプト / cmd) の場合:

```Bash
venv\Scripts\activate
```
Windows (PowerShell) の場合:

```Bash
.\venv\Scripts\Activate.ps1
```

注意: PowerShellでセキュリティエラーが出る場合は、以下のコマンドを実行してから再試行してください:
`Set-ExecutionPolicy RemoteSigned -Scope Process`

### 3. ライブラリのインストール
必要なライブラリを一括でインストールします。(必ず仮想環境が有効になっている状態で行ってください)

```Bash
pip install -r ../requirements.txt
```

### 4. bot.pyの起動

```bash
cd discord_bot
python bot.py
```

## 🔑 .envファイルの設定

```text
# === サーバー接続 ===
SERVER_URL=https://your-server.com
RASPI_API_KEY=（server.pyの /api/raspi/register で発行される）
API_BASE_URL=http://[IP_ADDRESS]

# === ManageEngine MDM API 設定 ===
MDM_CLIENT_ID=your_mdm_client_id_here
MDM_CLIENT_SECRET=your_mdm_client_secret_here
MDM_REFRESH_TOKEN=your_mdm_refresh_token_here
MDM_DEVICE_ID=target_device_id_here

# URL設定
MDM_BASE_URL=https://mdm.manageengine.jp
ZOHO_AUTH_URL=https://accounts.zoho.jp/oauth/v2/token

# MDMプロファイルID
MDM_PROFILE_TOKYO=
MDM_PROFILE_GMT9_5=
MDM_PROFILE_GMT10=
MDM_PROFILE_GMT10_5=
MDM_PROFILE_GMT11=

# Google OAuth（カレンダー直接参照用）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

```
※ ラズパイではなく自分のPCでAPIを動かしてテストする場合は、`API_BASE_URL=http://127.0.0.1:8000` としてください。