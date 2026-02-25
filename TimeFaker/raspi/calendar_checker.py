"""
Google Calendar APIに直接アクセスして予定を確認するモジュール。
OAuthフローはサーバー側で処理済み。ここではトークンを使って予定を読み取るだけ。

トークンが期限切れの場合はリフレッシュし、新しいトークンをコールバックで通知する。
"""

import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

JST = timezone(timedelta(hours=9))


class CalendarChecker:
    def __init__(self, server_client=None):
        """
        Args:
            server_client: ServerClientインスタンス（トークンリフレッシュ時の書き戻し用）
        """
        self.server_client = server_client

    def _build_credentials(self, access_token: str, refresh_token: str, discord_user_id: str = "") -> Credentials:
        """トークンからCredentialsオブジェクトを生成。期限切れ時は自動リフレッシュ。"""
        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
            scopes=SCOPES,
        )
        # トークンが期限切れなら自動更新
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            print(f"🔄 [Calendar] トークンをリフレッシュしました ({discord_user_id})")

            # 新しいトークンをサーバーに書き戻す
            if self.server_client and discord_user_id:
                self.server_client.refresh_tokens(
                    discord_user_id=discord_user_id,
                    access_token=credentials.token,
                    refresh_token=credentials.refresh_token or refresh_token,
                )

        return credentials

    def get_today_events(self, access_token: str, refresh_token: str, discord_user_id: str = "") -> list:
        """
        今日の予定を取得する。

        Args:
            access_token: Googleアクセストークン
            refresh_token: Googleリフレッシュトークン
            discord_user_id: トークン書き戻し時のユーザー識別用

        Returns:
            今日の予定リスト。0件の場合は空リスト。
        """
        try:
            credentials = self._build_credentials(access_token, refresh_token, discord_user_id)
            service = build("calendar", "v3", credentials=credentials)

            now_jst = datetime.now(JST)
            today_start = now_jst.replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = now_jst.replace(hour=23, minute=59, second=59, microsecond=0)

            events_result = service.events().list(
                calendarId="primary",
                timeMin=today_start.isoformat(),
                timeMax=today_end.isoformat(),
                singleEvents=True,
                orderBy="startTime"
            ).execute()

            events = events_result.get("items", [])
            print(f"📅 [Calendar] {discord_user_id} の今日の予定: {len(events)}件")
            return events
        except Exception as e:
            print(f"⚠️ [Calendar] 予定取得エラー ({discord_user_id}): {e}")
            return []

    def get_upcoming_events(self, access_token: str, refresh_token: str, discord_user_id: str = "", max_results: int = 5) -> list:
        """直近の予定を取得する。"""
        try:
            credentials = self._build_credentials(access_token, refresh_token, discord_user_id)
            service = build("calendar", "v3", credentials=credentials)

            now = datetime.now(timezone.utc).isoformat()

            events_result = service.events().list(
                calendarId="primary",
                timeMin=now,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime"
            ).execute()

            return events_result.get("items", [])
        except Exception as e:
            print(f"⚠️ [Calendar] 予定取得エラー ({discord_user_id}): {e}")
            return []
