import os
import random
import time
import threading
import asyncio
import uuid
import requests
import uvicorn
from dotenv import load_dotenv
from datetime import datetime, timedelta
from collections import deque
import ble_test
import subprocess
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from gpiozero import Button
from pydantic import BaseModel, HttpUrl
from fastapi.responses import FileResponse
from typing import Optional

# 自作モジュール
import models
import crud
import google_calendar
import schemas
from database import SessionLocal, engine
from ble_test import run_ble_server 
import ble_beacon_tx
from mdm_client import MDMClient

# 環境変数の読み込み
load_dotenv()
PROFILE_TOKYO = os.getenv("MDM_PROFILE_TOKYO")
PROFILE_GMT9_5 = os.getenv("MDM_PROFILE_GMT9_5")
PROFILE_GMT10 = os.getenv("MDM_PROFILE_GMT10")
PROFILE_GMT10_5 = os.getenv("MDM_PROFILE_GMT10_5")
PROFILE_GMT11 = os.getenv("MDM_PROFILE_GMT11")

# DBテーブル作成
models.Base.metadata.create_all(bind=engine)

# ==========================
# WebSocket接続マネージャー
# ==========================
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"⚠️ WebSocket送信エラー: {e}")

manager = ConnectionManager()
loop = None

# ==========================
# GPIO ボタン設定 (マルチクリック判定)
# ==========================
BUTTON_PIN = 17
button = None
press_start_time = 0
click_count = 0
click_timer = None

def on_press():
    global press_start_time
    press_start_time = time.time()
    print("🔘 [Button] 押されました...")

def change_timezone(profile_id):
    mdm_client = MDMClient()
    ok = mdm_client.change_timezone(profile_id)
    if not ok:
        print("⚠️ MDMタイムゾーン変更に失敗しました")
        return False
    return True

# --- 各アクションの定義 ---

def execute_shift_action():
    """シングルクリック時：全ユーザーのGoogleカレンダーを確認して攻撃"""
    print("⚡ 【シングルクリック検知】Googleカレンダーを確認してタイムリープします！")
    if loop:
        asyncio.run_coroutine_threadsafe(attack_users_with_calendar(), loop)
    else:
        print("⚠️ イベントループが未初期化のため攻撃をスキップしました")

def execute_pairing_mode():
    """ダブルクリック時：BLEペアリングモードON"""
    print("\n🔗 【ダブルクリック検知】ペアリングモードを起動します！")
    ble_test.pairing_mode_active = True  # type: ignore
    print("🔵 3分間、WebからのWi-Fi設定を受付開始します...")

    # 3分後に自動で閉じるタイマー
    def disable_mode():
        if ble_test.pairing_mode_active:  # type: ignore
            ble_test.pairing_mode_active = False  # type: ignore
            print("⏳ タイムアップ: ペアリングモードを終了しました。")
    
    threading.Timer(180.0, disable_mode).start()

def execute_restore_action():
    """長押し時：復旧"""
    print("\n🛡️ 【長押し検知】時間を元に戻す(復旧)命令を送信します！")
    
    # 1. MDM復旧
    if PROFILE_TOKYO:
        success = change_timezone(PROFILE_TOKYO)
        if success:
            print("✅ MDM復旧命令の送信に成功しました")
    else:
        print("❌ エラー: PROFILE_TOKYO が設定されていません。")

    # 2. Windows PC
    payload = {
        "action": "restore",
        "direction": "none",
        "offset_minutes": 0
    }
    if loop:
        print("💻 Windows PCへ送信: 時間を元に戻す")
        asyncio.run_coroutine_threadsafe(manager.broadcast(payload), loop)
        
    # 3. 物理時計
    ble_beacon_tx.broadcast_time_burst(0, repeat_count=3, interval_ms=100)

# --- 判定ロジック ---

def evaluate_clicks():
    global click_count
    if click_count == 1:
        execute_shift_action()
    elif click_count >= 2:
        execute_pairing_mode()
    click_count = 0

def on_release():
    global press_start_time, click_count, click_timer
    press_duration = time.time() - press_start_time
    print(f"🔘 [Button] 離されました ({press_duration:.2f}s)")

    if press_duration >= 4.0:
        click_count = 0
        if click_timer:
            click_timer.cancel()
        execute_restore_action()
    else:
        click_count += 1
        if click_timer:
            click_timer.cancel()
        
        click_timer = threading.Timer(0.4, evaluate_clicks)
        click_timer.start()

# ==========================
# 全ユーザー攻撃共通処理
# ==========================
async def attack_users_with_calendar():
    """
    DBの全ユーザーのGoogleカレンダーを確認し、
    今日予定があるユーザーにのみランダムタイムリープを適用する。
    深夜0時 (midnight_attack) と ボタンシングルクリック (execute_shift_action) の両方から呼ばれる。
    """
    print("🔍 [Calendar] 全ユーザーの今日の予定を確認します...")
    db = SessionLocal()
    try:
        all_users = db.query(models.UserSetting).all()

        for user in all_users:
            # Googleカレンダー未認証ユーザーはスキップ
            if not user.google_access_token or not user.google_refresh_token:
                print(f"⏭️ [Skip] {user.discord_user_id} はカレンダー未認証のためスキップ")
                continue

            # 今日の予定を取得
            try:
                events = await asyncio.to_thread(
                    google_calendar.get_today_events,
                    user.google_access_token,
                    user.google_refresh_token,
                )
            except Exception as e:
                print(f"⚠️ {user.discord_user_id} のカレンダー取得失敗: {e}")
                continue

            if not events:
                print(f"🕊️ [Skip] {user.discord_user_id} は今日予定がないためスキップ")
                continue

            # 今日の予定をターミナルに出力
            print(f"📋 [{user.discord_user_id}] 今日の予定 {len(events)}件:")
            for ev in events:
                title = ev.get("summary", "（タイトルなし）")
                start = ev.get("start", {})
                start_time = start.get("dateTime", start.get("date", "不明"))
                if "T" in start_time:
                    start_time = start_time.split("T")[1][:5]  # "09:00" の形式に
                print(f"   ・ {start_time} {title}")

            # 今日予定あり → ランダムオフセット決定
            multiplier = random.randint(1, 4)
            offset = multiplier * 30
            print(f"🎲 {user.discord_user_id}: パターン{multiplier} -> {offset}分 タイムリープ実行！")

            # 1. MDM（スマホ）
            match multiplier:
                case 1: await asyncio.to_thread(change_timezone, PROFILE_GMT9_5)
                case 2: await asyncio.to_thread(change_timezone, PROFILE_GMT10)
                case 3: await asyncio.to_thread(change_timezone, PROFILE_GMT10_5)
                case 4: await asyncio.to_thread(change_timezone, PROFILE_GMT11)

            # 2. Windows PC (WebSocket)
            payload = {"action": "shift", "direction": "forward", "offset_minutes": offset}
            await manager.broadcast(payload)

            # 3. 物理時計 (BLE)
            await asyncio.to_thread(ble_beacon_tx.broadcast_time_burst, offset, repeat_count=5)

    finally:
        db.close()

# ==========================
# 定期実行タスク (深夜0時発動)
# ==========================
async def midnight_attack():
    print("🕛 深夜0時です。タイムリープ（Googleカレンダー連動）を開始します...")
    await attack_users_with_calendar()

# ==========================
# ライフスパン (起動・終了処理)
# ==========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global loop
    loop = asyncio.get_running_loop()
    
    # スケジューラー起動（タイムゾーンを明示指定。Windowsのシステムタイムゾーンが書き換えられても動くように）
    scheduler = AsyncIOScheduler(timezone="Asia/Tokyo")
    scheduler.add_job(midnight_attack, 'cron', minute='*') # テスト用（本番は hour=0, minute=0）
    scheduler.start()
    print("⏰ スケジューラーが起動しました")

    print("📡 BLEプロビジョニングサーバーを起動中...")
    ble_task = asyncio.create_task(run_ble_server())
    
    global button
    try:
        button = Button(BUTTON_PIN, pull_up=True, bounce_time=0.05)
        button.when_pressed = on_press
        button.when_released = on_release
        print(f"✅ GPIO {BUTTON_PIN} is ready.")
    except Exception as e:
        print(f"⚠️ GPIO Init Error: {e}")

    yield
    
    print("🛑 サーバー停止中。")
    ble_task.cancel()

# ==========================
# FastAPI アプリ定義
# ==========================
app = FastAPI(lifespan=lifespan)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PlanRequest(BaseModel):
    discord_user_id: str
    date: Optional[str] = None   # 予定日付 "YYYY-MM-DD"
    time: Optional[str] = None   # 予定時刻 "HH:MM"
    task: Optional[str] = None   # 予定名


class TestPingRequest(BaseModel):
    trace_id: str
    source: str = "discord_bot"
    discord_user_id: Optional[str] = None


class ProblemUrlNotifyRequest(BaseModel):
    problem_url: HttpUrl
    generated_at: datetime


test_ping_history = deque(maxlen=100)
test_ping_lock = threading.Lock()
problem_url_history = deque(maxlen=100)
problem_url_lock = threading.Lock()


@app.get("/api/discord/problem-url/sample")
def get_problem_url_payload_sample():
    """
    Webアプリが送るべきJSONフォーマットのサンプルを返す。
    """
    return {
        "problem_url": "https://example.com/self-check",
        "generated_at": "2026-02-26T10:30:00+09:00"
    }


@app.post("/api/discord/problem")
def notify_discord_problem_url(req: ProblemUrlNotifyRequest):
    """
    Webアプリで問題URLが生成された際にDiscordへ通知するための仮エンドポイント。
    DISCORD_BOT_TOKEN と DISCORD_CHANNEL_ID が設定されていればDiscordへ投稿し、
    未設定なら受信のみ行う。
    """
    bot_token = os.getenv("DISCORD_BOT_TOKEN")
    channel_id = os.getenv("DISCORD_CHANNEL_ID")

    lines = [
        "知識の定着度を自己採点する",
        f"🔗 {req.problem_url}",
    ]

    discord_content = "\n".join(lines)

    delivery = "skipped"
    error_message = None
    if bot_token and channel_id:
        try:
            resp = requests.post(
                f"https://discord.com/api/v10/channels/{channel_id}/messages",
                headers={
                    "Authorization": f"Bot {bot_token}",
                    "Content-Type": "application/json",
                },
                json={"content": discord_content},
                timeout=10,
            )
            resp.raise_for_status()
            delivery = "sent"
        except Exception as e:
            delivery = "failed"
            error_message = str(e)

    entry = {
        "problem_url": str(req.problem_url),
        "generated_at": req.generated_at.isoformat(),
        "discord_delivery": delivery,
        "error": error_message,
        "received_at": datetime.utcnow().isoformat() + "Z",
    }

    with problem_url_lock:
        problem_url_history.append(entry)

    return {
        "status": "accepted",
        "discord_delivery": delivery,
        "bot_token_configured": bool(bot_token),
        "channel_configured": bool(channel_id),
        "latest": entry,
    }


@app.get("/api/discord/problem-url/latest")
def get_latest_problem_url_notification():
    with problem_url_lock:
        latest = problem_url_history[-1] if problem_url_history else None

    if not latest:
        return {"status": "empty", "message": "no problem url notification received yet"}

    return {"status": "ok", "latest": latest, "count": len(problem_url_history)}


@app.post("/api/test/ping")
def receive_test_ping(req: TestPingRequest):
    try:
        uuid.UUID(req.trace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="trace_id must be UUID format")

    entry = {
        "trace_id": req.trace_id,
        "source": req.source,
        "discord_user_id": req.discord_user_id,
        "received_at": datetime.utcnow().isoformat() + "Z",
    }

    with test_ping_lock:
        test_ping_history.append(entry)

    print(
        "🧪 [TEST PING] "
        f"trace_id={req.trace_id} source={req.source} discord_user_id={req.discord_user_id}"
    )

    return {"status": "ok", "message": "test ping received", "trace_id": req.trace_id}


@app.get("/api/test/ping/latest")
def latest_test_ping():
    with test_ping_lock:
        latest = test_ping_history[-1] if test_ping_history else None

    if not latest:
        return {"status": "empty", "message": "no test ping received yet"}

    return {"status": "ok", "latest": latest, "count": len(test_ping_history)}


@app.get("/api/test/ping/{trace_id}")
def check_test_ping(trace_id: str):
    with test_ping_lock:
        matched = next((row for row in test_ping_history if row["trace_id"] == trace_id), None)

    if not matched:
        return {"status": "not_found", "trace_id": trace_id, "received": False}

    return {
        "status": "found",
        "trace_id": trace_id,
        "received": True,
        "entry": matched,
    }

@app.post("/api/schedules/")
def create_schedule_from_mentions(req: schemas.ScheduleCreate, db: Session = Depends(get_db)):
    result = crud.add_schedules_for_mentions(
        db=db,
        mentioned_discord_ids=req.mentioned_discord_ids,
        date_str=req.date,
        time_str=req.time,
        title=req.title,
    )
    for discord_id in result["saved_ids"]:
        crud.schedule_attack(db, discord_id)
        print(f"🎯 [予約完了] DiscordID: {discord_id} 攻撃フラグON")
    return {"status": "success", "saved_ids": result["saved_ids"]}

@app.websocket("/ws/windows")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/plan/")
def register_plan(plan: PlanRequest, db: Session = Depends(get_db)):
    crud.schedule_attack(db, plan.discord_user_id)
    
    user = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == plan.discord_user_id
    ).first()

    if not user:
        print(f"⚠️ エラー: Discord ID '{plan.discord_user_id}' は未登録です。")
        return {"status": "error", "message": "ユーザーが未登録です。先に設定画面から登録してください。"}

    calendar_registered = False
    
    # 🌟 修正1: 「is not None」を使ってエディタの __bool__ パニックを回避
    if (user.google_access_token is not None and 
        user.google_refresh_token is not None and 
        plan.date is not None and 
        plan.time is not None and 
        plan.task is not None):
        
        try:
            google_calendar.add_event_to_calendar(
                access_token=str(user.google_access_token),    # type: ignore
                refresh_token=str(user.google_refresh_token),  # type: ignore
                date=str(plan.date),
                time=str(plan.time),
                task=str(plan.task),
            )
            calendar_registered = True
        except Exception as e:
            print(f"⚠️ Googleカレンダー登録エラー: {e}")

    return {
        "status": "success",
        "message": "攻撃予約完了",
        "user_id": user.id,  # type: ignore
        "offset_minutes": user.offset_minutes,  # type: ignore
        "attack_scheduled": user.is_attack_scheduled,  # type: ignore
        "calendar_registered": calendar_registered,
    }

# ==========================
# Google OAuth2 認証
# ==========================
@app.get("/auth/google")
def google_auth(discord_user_id: str):
    """
    !auth コマンドから呼ばれる。
    このURLをユーザーにDMで送る。
    """
    auth_url = google_calendar.get_auth_url(discord_user_id)
    return {"auth_url": auth_url}

@app.get("/auth/callback")
def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    """
    Googleがリダイレクトするエンドポイント。
    コードをトークンに交換してDBに保存する。
    stateにDiscordIDが入っている。
    """
    discord_user_id = state

    # 認証コードをトークンに交換
    tokens = google_calendar.exchange_code_for_tokens(code)

    # DBにトークンを保存
    user = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_user_id
    ).first()
    if user:
        user.google_access_token = tokens["access_token"]   # type: ignore
        user.google_refresh_token = tokens["refresh_token"]  # type: ignore
    else:
        user = models.UserSetting(
            discord_user_id=discord_user_id,
            google_access_token=tokens["access_token"],
            google_refresh_token=tokens["refresh_token"],
        )
        db.add(user)
    db.commit()
    print(f"✅ [Google認証完了] DiscordID: {discord_user_id} のトークンを保存しました")

    # ブラウザに表示する完了メッセージ
    return {"認証完了": "✅ Googleカレンダーへのアクセスが許可されました！Discordに戻って!planを試してみてください。"}

class RegisterRequest(BaseModel):
    discord_user_id: str
    gmail: str

@app.post("/api/register/")
def register_gmail_endpoint(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    DiscordIDとGmailを紐付けてDBに保存する。
    !register コマンドから呼ばれる。
    """
    user = crud.register_gmail(db, req.discord_user_id, req.gmail)
    print(f"📧 [Gmail登録] DiscordID: {req.discord_user_id} → {req.gmail}")
    return {
        "status": "success",
        "discord_user_id": user.discord_user_id,
        "gmail": user.gmail
    }

# ==========================
# ユーザー情報取得API（テスト用）
# ==========================
@app.get("/api/user/{discord_user_id}")
def get_user_info(discord_user_id: str, db: Session = Depends(get_db)):
    """
    DiscordIDを元にDBの全情報を返す。
    Googleカレンダー認証済みの場合は今日の予定も返す。
    !myinfo コマンドから呼ばれる。
    """
    user = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_user_id
    ).first()

    if not user:
        return {"status": "not_found", "message": "このユーザーはDBに登録されていません。"}

    # 今日のカレンダー予定を取得（認証済みの場合のみ）
    today_events = []
    calendar_status = "not_authorized"
    if user.google_access_token and user.google_refresh_token:
        try:
            today_events = google_calendar.get_today_events(
                access_token=user.google_access_token,
                refresh_token=user.google_refresh_token,
            )
            calendar_status = "ok"
        except Exception as e:
            print(f"⚠️ カレンダー取得エラー ({discord_user_id}): {e}")
            calendar_status = "error"

    return {
        "status": "success",
        "id": user.id,
        "discord_user_id": user.discord_user_id,
        "gmail": user.gmail,
        "mdm_device_id": user.mdm_device_id,
        "offset_minutes": user.offset_minutes,
        "is_attack_scheduled": user.is_attack_scheduled,
        "calendar_status": calendar_status,
        "today_events": today_events,
    }

# ==========================
# デバッグ用：全ユーザー一覧API
# ==========================
@app.get("/api/debug/users")
def get_all_users(db: Session = Depends(get_db)):
    """
    DB内の全ユーザー情報を返す（テスト・デバッグ用）。
    !dbdump コマンドから呼ばれる。
    """
    users = db.query(models.UserSetting).all()
    return {
        "count": len(users),
        "users": [
            {
                "id": u.id,
                "discord_user_id": u.discord_user_id,
                "gmail": u.gmail,
                "mdm_device_id": u.mdm_device_id,
                "offset_minutes": u.offset_minutes,
                "is_attack_scheduled": u.is_attack_scheduled,
                "has_google_token": bool(u.google_access_token),
            }
            for u in users
        ]
    }

# ==========================
# Googleカレンダー予定取得API
# ==========================
@app.get("/api/schedule/{discord_user_id}")
def get_schedule(discord_user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_user_id
    ).first()

    if not user:
        return {"status": "not_found", "message": "DBに登録されていません。!auth で認証してください。"}

    # 🌟 修正ポイント: 「is None」を使うことでエディタのパニックを回避
    if user.google_access_token is None or user.google_refresh_token is None:
        return {"status": "not_authorized", "message": "Googleカレンダーの認証が完了していません。!auth で認証してください。"}

    try:
        # 🌟 修正ポイント: str()で囲み、さらに # type: ignore で強制突破
        events = google_calendar.get_upcoming_events(
            access_token=str(user.google_access_token),    # type: ignore
            refresh_token=str(user.google_refresh_token),  # type: ignore
            max_results=5
        )
        return {"status": "success", "events": events}
    except Exception as e:
        print(f"⚠️ カレンダー取得エラー: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":

    uvicorn.run(app, host="127.0.0.1", port=8000)
    
@app.get("/api/wifi/ssids")
def get_wifi_ssids():
    try:
        result = subprocess.run(
            ["nmcli", "-t", "-f", "SSID", "dev", "wifi", "list", "--rescan", "yes"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=result.stderr.strip() or "nmcli failed")

        seen = set()
        ssids = []
        for line in result.stdout.splitlines():
            s = line.strip()
            if s and s not in seen:
                seen.add(s)
                ssids.append(s)

        return {"ssids": ssids}
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="wifi scan timeout")

@app.get("/setup")
def setup_page():
    # 🌟 魔法のパス指定：main.py自身の場所を基準に setup.html を探す
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(BASE_DIR, "setup.html")
    
    if not os.path.exists(file_path):
        return {"error": f"ファイルが見つかりません: {file_path}"}
        
    return FileResponse(file_path)
