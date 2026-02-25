import os
import requests
from dotenv import load_dotenv

# .envを読み込む
load_dotenv()

class MDMClient:
    def __init__(self):
        # 認証サーバー (日本DC)
        self.auth_url = "https://accounts.zoho.jp/oauth/v2/token"
        # MDM API エンドポイント (日本DC)
        self.base_url = "https://mdm.manageengine.jp/api/v1/mdm"
        
        self.client_id = (os.getenv("MDM_CLIENT_ID") or "").strip()
        self.client_secret = (os.getenv("MDM_CLIENT_SECRET") or "").strip()
        self.refresh_token = (os.getenv("MDM_REFRESH_TOKEN") or "").strip()
        self.device_id = (os.getenv("MDM_DEVICE_ID") or "").strip()

    def _missing_env_keys(self):
        missing = []
        if not self.client_id:
            missing.append("MDM_CLIENT_ID")
        if not self.client_secret:
            missing.append("MDM_CLIENT_SECRET")
        if not self.refresh_token:
            missing.append("MDM_REFRESH_TOKEN")
        if not self.device_id:
            missing.append("MDM_DEVICE_ID")
        return missing

    def _get_access_token(self):
        """アクセストークンを再取得する内部メソッド"""
        missing = self._missing_env_keys()
        if missing:
            print(f"[MDM] ❌ 必須環境変数が不足しています: {', '.join(missing)}")
            return None

        try:
            payload = {
                "refresh_token": self.refresh_token,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "refresh_token"
            }
            res = requests.post(self.auth_url, data=payload, timeout=20)

            if res.status_code != 200:
                print(f"[MDM] ❌ Token HTTP Error: {res.status_code}")
                print(f"[MDM] Response: {res.text}")
                return None

            body = res.json()
            token = body.get("access_token")
            if not token:
                print(f"[MDM] ❌ access_token がレスポンスにありません: {body}")
                return None

            return token
        except requests.exceptions.Timeout:
            print("[MDM] ❌ Token Timeout: 認証サーバー応答待ちでタイムアウトしました")
            return None
        except requests.exceptions.RequestException as e:
            print(f"[MDM] ❌ Token Request Error: {e}")
            return None
        except ValueError as e:
            print(f"[MDM] ❌ Token JSON Parse Error: {e}")
            print(f"[MDM] Raw Response: {res.text if 'res' in locals() else 'N/A'}")
            return None
        except Exception as e:
            print(f"[MDM] ❌ Token Unknown Error: {e}")
            return None

    def change_timezone(self, profile_id):
        """指定したプロファイルIDを適用してタイムゾーンを変更"""
        token = self._get_access_token()
        if not token:
            print("[MDM] 認証トークンの取得に失敗しました")
            return False

        if not self.device_id:
            print("[MDM] Device ID が設定されていません")
            return False

        url = f"{self.base_url}/devices/{self.device_id}/profiles"
        headers = {
            "Authorization": f"Zoho-oauthtoken {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        data = {"profile_ids": [profile_id]}

        try:
            res = requests.post(url, headers=headers, json=data, timeout=30)
            
            # 200: OK, 201: Created, 202: Accepted
            if res.status_code in [200, 201, 202]:
                print(f"[MDM] ✅ Success: Profile {profile_id} applied.")
                return True
            else:
                print(f"[MDM] ❌ Failed: {res.status_code} - {res.text}")
                return False
        except Exception as e:
            print(f"[MDM] Request Error: {e}")
            return False
