import os
import requests
from dotenv import load_dotenv

load_dotenv()

print("🚀 MDM接続 最終診断テストを開始します...")

# 1. トークン取得
print("🔑 トークンを取得中...")
token_url = "https://accounts.zoho.jp/oauth/v2/token"
payload = {
    "refresh_token": os.getenv("MDM_REFRESH_TOKEN"),
    "client_id": os.getenv("MDM_CLIENT_ID"),
    "client_secret": os.getenv("MDM_CLIENT_SECRET"),
    "grant_type": "refresh_token"
}
res = requests.post(token_url, data=payload)
token = res.json().get("access_token")

if not token:
    print("❌ トークン取得失敗")
    exit()

print("✅ トークン取得成功")

device_id = os.getenv("MDM_DEVICE_ID")
profile_id = os.getenv("MDM_PROFILE_TOKYO")
data = {"profile_ids": [profile_id]}

# ManageEngine MDM 公式の正しいURL（/mdm が必要です）
url = f"https://mdm.manageengine.jp/api/v1/mdm/devices/{device_id}/profiles"

print(f"📡 公式URLへ送信中: {url}")

# パターン1: 公式推奨の Accept ヘッダー付き
headers1 = {
    "Authorization": f"Zoho-oauthtoken {token}",
    "Content-Type": "application/json",
    "Accept": "application/vnd.manageengine.mdm.v1+json"  # 👈 これが必須なケースが多い
}

# パターン2: Bearerトークン仕様
headers2 = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print("\n--- 診断1: 公式推奨ヘッダー ---")
r1 = requests.post(url, headers=headers1, json=data)
print(f"Status: {r1.status_code}")
print(f"Response: {r1.text}")

print("\n--- 診断2: Bearer トークン ---")
r2 = requests.post(url, headers=headers2, json=data)
print(f"Status: {r2.status_code}")
print(f"Response: {r2.text}")