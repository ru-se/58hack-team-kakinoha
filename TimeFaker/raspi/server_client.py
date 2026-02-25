"""
サーバーAPIとの通信を担当するクライアント。
ラズパイからサーバーのAPIを呼び出す際に使用する。
"""

import requests


class ServerClient:
    def __init__(self, server_url: str, api_key: str):
        """
        Args:
            server_url: サーバーのベースURL (例: "https://your-server.com")
            api_key: ラズパイ登録時に発行されたAPIキー
        """
        self.server_url = server_url.rstrip("/")
        self.api_key = api_key
        self.headers = {"X-API-Key": api_key}

    def get_my_users(self) -> list[dict]:
        """
        このラズパイに紐づくユーザー一覧を取得する。
        各ユーザーのDiscord IDとOAuthトークンが返る。

        Returns:
            [{"discord_user_id": "...", "google_access_token": "...", "google_refresh_token": "..."}, ...]
        """
        url = f"{self.server_url}/api/raspi/my-users"
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            if response.status_code == 401:
                print("❌ [ServerClient] APIキーが無効です。ラズパイの登録を確認してください。")
                return []
            response.raise_for_status()
            data = response.json()
            return data.get("users", [])
        except requests.exceptions.ConnectionError:
            print(f"❌ [ServerClient] サーバー ({self.server_url}) に接続できません")
            return []
        except Exception as e:
            print(f"❌ [ServerClient] ユーザー取得エラー: {e}")
            return []

    def refresh_tokens(self, discord_user_id: str, access_token: str, refresh_token: str) -> bool:
        """
        リフレッシュ後の新しいOAuthトークンをサーバーに書き戻す。

        Returns:
            成功した場合 True
        """
        url = f"{self.server_url}/api/raspi/token-refresh"
        payload = {
            "discord_user_id": discord_user_id,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
        try:
            response = requests.post(url, headers=self.headers, json=payload, timeout=15)
            if response.status_code == 200:
                print(f"🔄 [ServerClient] {discord_user_id} のトークンをサーバーに書き戻しました")
                return True
            else:
                print(f"⚠️ [ServerClient] トークン書き戻し失敗: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ [ServerClient] トークン書き戻しエラー: {e}")
            return False

    def ble_register(self, discord_user_id: str, mdm_device_id: str | None = None) -> bool:
        """
        BLE初期設定で受け取ったDiscord ID / MDM IDをサーバーに登録する。

        Returns:
            成功した場合 True
        """
        url = f"{self.server_url}/api/raspi/ble-register"
        payload = {
            "discord_user_id": discord_user_id,
            "mdm_device_id": mdm_device_id or "",
        }
        try:
            response = requests.post(url, headers=self.headers, json=payload, timeout=15)
            if response.status_code == 200:
                print(f"✅ [ServerClient] ユーザー '{discord_user_id}' をサーバーに登録しました")
                return True
            else:
                print(f"⚠️ [ServerClient] ユーザー登録失敗: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ [ServerClient] ユーザー登録エラー: {e}")
            return False
