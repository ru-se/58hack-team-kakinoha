FROM python:3.11-slim

WORKDIR /app

# 必要なシステムパッケージのインストール（BluetoothとWi-Fi制御用）
RUN apt-get update && apt-get install -y \
    bluez \
    bluetooth \
    network-manager \
    && rm -rf /var/lib/apt/lists/*

# Pythonライブラリのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 全ファイルをコピー
COPY . .

# backendフォルダをルートとしてUvicornを起動
CMD ["uvicorn", "main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000", "--reload"]