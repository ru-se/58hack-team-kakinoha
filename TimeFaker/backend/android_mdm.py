import os
import requests
from datetime import datetime

# .envの設定
CLIENT_ID = os.getenv("MDM_CLIENT_ID")
CLIENT_SECRET = os.getenv("MDM_CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("MDM_REFRESH_TOKEN")
DEVICE_ID = os.getenv("MDM_DEVICE_ID")
BASE_URL = os.getenv("MDM_BASE_URL", "https:xxx")
AUTH_URL = os.getenv("ZOHO_AUTH_URL")

def get_access_token():
    if not AUTH_URL:
        print("⚠️ Auth URL not set")
        return None
    params = {
        "refresh_token": REFRESH_TOKEN,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "refresh_token"
    }
    try:
        resp = requests.post(AUTH_URL, params=params, timeout=5)
        data = resp.json()
        if "access_token" in data:
            return data["access_token"]
        else:
            print(f"Token Error: {data}")
    except Exception as e:
        print(f"Request Error: {e}")
        pass
    return None

def execute_attack(offset_minutes: int, timestamp: datetime):
    """
    攻撃実行
    :param offset_minutes: ずらす時間（分）
    :param timestamp: ボタンが押された時刻
    """
    print(f"😈 [攻撃実行] Time: {timestamp}, Offset: {offset_minutes}分")
    print(f"   -> Device {DEVICE_ID} に対してリクエストを送信します...")

    token = get_access_token()
    if not token:
        print("✅ [模擬] トークンなしのため通信スキップ")
        return {"status": "mock_success", "time": timestamp, "offset": offset_minutes}

    # ここに実際のMDM APIコールが入ります
    # requests.post(...)

    return {"status": "success", "sent_at": timestamp, "offset": offset_minutes}

def stop_attack():
    print(f"😇 [復旧] 時間を元に戻します...")
    return {"status": "recovered"}