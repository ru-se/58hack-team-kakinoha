"""
raspi.py — ラズパイ上で動作するメインプロセス
GPIO ボタン監視、深夜スケジューラー、BLEプロビジョニングを管理する。
サーバーAPIを経由してユーザー情報を取得し、攻撃を実行する。
"""

import os
import random
import asyncio
import time as time_module
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager

# ラズパイ専用モジュール
from server_client import ServerClient
from attack_executor import AttackExecutor
from calendar_checker import CalendarChecker

load_dotenv()

# ==========================
# 設定値
# ==========================
SERVER_URL = os.getenv("SERVER_URL", "http://127.0.0.1:8000")
RASPI_API_KEY = os.getenv("RASPI_API_KEY", "")
BUTTON_PIN = 17

# ==========================
# サーバーAPIクライアント
# ==========================
api_client = ServerClient(server_url=SERVER_URL, api_key=RASPI_API_KEY)

# ==========================
# カレンダーチェッカー（サーバーへのトークン書き戻し機能付き）
# ==========================
calendar_checker = CalendarChecker(server_client=api_client)

# ==========================
# WebSocket接続マネージャー（ローカルネットワーク向け）
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

ws_manager = ConnectionManager()

# ==========================
# ハードウェア初期化（ラズパイ上でのみ動作）
# ==========================
try:
    from gpiozero import Button
    from mdm_client import MDMClient
    import ble_beacon_tx

    mdm = MDMClient()
    executor = AttackExecutor(mdm_client=mdm, ble_beacon=ble_beacon_tx, ws_manager=ws_manager)
    print("✅ ハードウェアモジュールを初期化しました")
except ImportError as e:
    print(f"⚠️ ハードウェアモジュールの初期化に失敗（ラズパイ以外の環境）: {e}")
    executor = None  # type: ignore

# ==========================
# ボタン操作ロジック
# ==========================
loop = None
button = None
press_start = None
click_count = 0
click_timer = None
pairing_active = False

def on_press():
    global press_start
    press_start = time_module.time()

def on_release():
    global press_start, click_count, click_timer, loop
    if press_start is None or loop is None:
        return
    duration = time_module.time() - press_start
    press_start = None

    if duration >= 3.0:
        # 長押し → ペアリングモード
        print("🔵 [ボタン] 長押し検出 → ペアリングモード")
        asyncio.run_coroutine_threadsafe(toggle_pairing(), loop)
        return

    # 短押し → カウント
    click_count += 1
    if click_timer is not None:
        click_timer.cancel()
    click_timer = loop.call_later(0.5, lambda: asyncio.run_coroutine_threadsafe(evaluate_clicks(), loop))


async def evaluate_clicks():
    """短押し回数に応じた処理"""
    global click_count
    count = click_count
    click_count = 0

    if count == 1:
        print("🟢 [ボタン] 1回短押し → 攻撃実行")
        await execute_shift_action()
    elif count == 2:
        print("🔴 [ボタン] 2回短押し → 復旧実行")
        await execute_restore_action()
    else:
        print(f"⚠️ [ボタン] {count}回短押し → 未定義")


# ==========================
# 攻撃ロジック
# ==========================
async def execute_shift_action():
    """
    サーバーAPIからユーザー情報を取得し、
    Google Calendarを確認して攻撃を実行する。
    """
    if executor is None:
        print("❌ ハードウェアが初期化されていません")
        return

    # サーバーからこのラズパイに紐づくユーザーを取得
    users = api_client.get_my_users()
    if not users:
        print("⚠️ 紐づくユーザーがいません")
        return

    for user in users:
        discord_id = user.get("discord_user_id", "")
        access_token = user.get("google_access_token")
        refresh_token = user.get("google_refresh_token")

        if not access_token or not refresh_token:
            print(f"⚠️ {discord_id}: OAuthトークン未設定、スキップ")
            continue

        # Google Calendarから今日の予定を確認
        events = calendar_checker.get_today_events(
            access_token=access_token,
            refresh_token=refresh_token,
            discord_user_id=discord_id,
        )

        if not events:
            print(f"📅 {discord_id}: 今日の予定なし、攻撃スキップ")
            continue

        # 予定あり → ランダムなオフセットで攻撃
        multiplier = random.randint(1, 4)
        offset = multiplier * 30
        print(f"🎯 {discord_id}: 予定あり！ オフセット {offset}分 で攻撃開始")
        await executor.execute(offset)


async def execute_restore_action():
    """全デバイスを元の時間に復旧する。"""
    if executor is None:
        print("❌ ハードウェアが初期化されていません")
        return
    print("🔄 復旧処理を開始します...")
    await executor.restore()


# ==========================
# ペアリングモード
# ==========================
async def toggle_pairing():
    """BLEプロビジョニングサーバーのON/OFF切り替え"""
    global pairing_active
    if pairing_active:
        print("🔵 [BLE] ペアリングモード終了")
        pairing_active = False
    else:
        print("🔵 [BLE] ペアリングモード開始")
        pairing_active = True
        try:
            from ble_provisioning import run_ble_server
            asyncio.create_task(run_ble_server(api_client))
        except ImportError:
            print("⚠️ BLEプロビジョニングモジュールが見つかりません")


# ==========================
# 深夜スケジューラー
# ==========================
async def midnight_attack():
    """深夜0時に自動で攻撃判定を実行する。"""
    print("🕛 [スケジューラー] 深夜の攻撃判定を開始します...")
    await execute_shift_action()


# ==========================
# アプリ起動・終了
# ==========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global loop, button
    loop = asyncio.get_running_loop()

    # スケジューラー起動
    scheduler = AsyncIOScheduler(timezone="Asia/Tokyo")
    scheduler.add_job(midnight_attack, 'cron', hour=0, minute=0)
    scheduler.start()
    print("⏰ スケジューラーが起動しました（深夜0時に攻撃判定）")

    # GPIO ボタン初期化
    try:
        button = Button(BUTTON_PIN, pull_up=True, bounce_time=0.05)
        button.when_pressed = on_press
        button.when_released = on_release
        print(f"✅ GPIO {BUTTON_PIN} is ready.")
    except Exception as e:
        print(f"⚠️ GPIO Init Error: {e}")

    print(f"🏠 ラズパイプロセス起動完了 (サーバー: {SERVER_URL})")
    yield
    print("🛑 ラズパイプロセス停止中。")

# ローカルWebSocket（Windows PC用）のみ提供
app = FastAPI(lifespan=lifespan)


@app.websocket("/ws/windows")
async def websocket_endpoint(websocket: WebSocket):
    """ローカルネットワーク上のWindows PCからの接続を受け付ける"""
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# ==========================
# エントリポイント
# ==========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
