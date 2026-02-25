import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

load_dotenv(override=True)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# Redirect URI の取得
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:8000/auth/callback")

print(f"🌐 [Google OAuth] Redirect URI set to: {REDIRECT_URI}")
# Googleカレンダーへの読み書き権限スコープ
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


def get_flow():
    """OAuth2フローオブジェクトを返す"""
    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )


def get_auth_url(discord_user_id: str) -> str:
    """
    ユーザーに見せる認証URLを生成する。
    state パラメータに discord_user_id を埋め込んで、
    コールバック時に誰の認証か分かるようにする。
    """
    flow = get_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",      # リフレッシュトークンを取得するために必要
        include_granted_scopes="true",
        prompt="select_account consent",           # 毎回リフレッシュトークンを発行させる
        state=discord_user_id       # コールバック時にDiscordIDを特定するために使う
    )
    return auth_url


def exchange_code_for_tokens(code: str):
    """
    Googleから返ってきた認証コードを、アクセストークンとリフレッシュトークンに交換する。
    """
    flow = get_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    return {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
    }


def _build_credentials(access_token: str, refresh_token: str) -> Credentials:
    """DBに保存されたトークンからCredentialsオブジェクトを生成する（内部用）"""
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
    return credentials


def add_event_to_calendar(access_token: str, refresh_token: str, date: str, time: str, task: str):
    """
    ユーザーのGoogleカレンダーにイベントを登録する（書き込み）。

    Args:
        access_token:  DBに保存されたアクセストークン
        refresh_token: DBに保存されたリフレッシュトークン
        date:  "YYYY-MM-DD" 形式
        time:  "HH:MM" 形式
        task:  予定名
    """
    credentials = _build_credentials(access_token, refresh_token)
    service = build("calendar", "v3", credentials=credentials)

    # 開始・終了時刻を組み立て（1時間のイベントとして登録）
    start_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    end_dt = start_dt + timedelta(hours=1)

    event = {
        "summary": task,
        "start": {
            "dateTime": start_dt.isoformat(),
            "timeZone": "Asia/Tokyo",
        },
        "end": {
            "dateTime": end_dt.isoformat(),
            "timeZone": "Asia/Tokyo",
        },
    }

    created_event = service.events().insert(calendarId="primary", body=event).execute()
    print(f"✅ [Google Calendar] イベント登録完了: {created_event.get('htmlLink')}")
    return created_event


def get_upcoming_events(access_token: str, refresh_token: str, max_results: int = 5):
    """
    ユーザーのGoogleカレンダーから直近の予定を取得する（読み取り）。

    Args:
        access_token:  DBに保存されたアクセストークン
        refresh_token: DBに保存されたリフレッシュトークン
        max_results:   取得する予定の最大件数（デフォルト5件）
    """
    credentials = _build_credentials(access_token, refresh_token)
    service = build("calendar", "v3", credentials=credentials)

    # 現在時刻以降の予定を取得（UTC形式）
    now = datetime.now(timezone.utc).isoformat()

    events_result = service.events().list(
        calendarId="primary",       # 認証したユーザーのメインカレンダー（Gmailアドレス不要）
        timeMin=now,                # 現在以降の予定のみ
        maxResults=max_results,     # 最大件数
        singleEvents=True,          # 繰り返しイベントも1件ずつ展開
        orderBy="startTime"         # 開始時刻順
    ).execute()

    return events_result.get("items", [])


def get_today_events(access_token: str, refresh_token: str):
    """
    ユーザーのGoogleカレンダーから「今日」の予定を取得する。
    今日 00:00~23:59 JST の範囲に絞って取得する。

    Returns:
        今日の予定リスト。0件の場合は空リスト。
    """
    credentials = _build_credentials(access_token, refresh_token)
    service = build("calendar", "v3", credentials=credentials)

    JST = timezone(timedelta(hours=9))
    now_jst = datetime.now(JST)

    # 今日の 00:00:00 JST
    today_start = now_jst.replace(hour=0, minute=0, second=0, microsecond=0)
    # 今日の 23:59:59 JST
    today_end = now_jst.replace(hour=23, minute=59, second=59, microsecond=0)

    events_result = service.events().list(
        calendarId="primary",
        timeMin=today_start.isoformat(),
        timeMax=today_end.isoformat(),
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    events = events_result.get("items", [])
    print(f"📅 [Calendar] 今日の予定: {len(events)}件")
    return events
