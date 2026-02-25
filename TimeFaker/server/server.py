import os
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

# 自作モジュール
import models
import crud
import google_calendar
import schemas
from database import SessionLocal, engine, get_db

# 環境変数の読み込み
load_dotenv()

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

# ==========================
# FastAPI アプリ定義
# ==========================
app = FastAPI(title="TimeFaker Server")


# ==========================
# ラズパイ認証ミドルウェア
# ==========================
def verify_raspi_api_key(x_api_key: str = Header(...), db: Session = Depends(get_db)):
    """
    ラズパイからのリクエストを認証する。
    X-API-Key ヘッダーにAPIキーを含めて送信する。
    """
    raspi = crud.get_raspi_by_api_key(db, x_api_key)
    if not raspi:
        raise HTTPException(status_code=401, detail="無効なAPIキーです")
    return raspi


# ==========================
# ラズパイ向けAPI
# ==========================

@app.post("/api/raspi/register")
def register_raspi(req: schemas.RaspiRegisterRequest, db: Session = Depends(get_db)):
    """
    新しいラズパイを登録し、APIキーを発行する。
    初期セットアップ時に1回だけ呼ぶ。
    """
    device = crud.create_raspi_device(db, req.name)
    print(f"🏠 新しいラズパイ '{req.name}' を登録しました (ID: {device.id})")
    return schemas.RaspiRegisterResponse(
        raspi_id=device.id,
        api_key=device.api_key,
        message=f"ラズパイ '{req.name}' を登録しました。APIキーを安全に保存してください。"
    )


@app.get("/api/raspi/my-users")
def get_my_users(raspi: models.RaspiDevice = Depends(verify_raspi_api_key), db: Session = Depends(get_db)):
    """
    このラズパイに紐づくユーザーのDiscord ID + OAuthトークンを返す。
    ラズパイはこのトークンを使ってGoogle Calendarに直接アクセスする。
    """
    users = crud.get_users_by_raspi_id(db, raspi.id)
    return {
        "raspi_id": raspi.id,
        "raspi_name": raspi.name,
        "users": [
            schemas.UserTokenResponse(
                discord_user_id=u.discord_user_id,
                google_access_token=u.google_access_token,
                google_refresh_token=u.google_refresh_token,
            ).model_dump()
            for u in users
        ]
    }


@app.post("/api/raspi/token-refresh")
def update_tokens(
    req: schemas.TokenRefreshRequest,
    raspi: models.RaspiDevice = Depends(verify_raspi_api_key),
    db: Session = Depends(get_db)
):
    """
    ラズパイがGoogle Calendar APIを使用中にトークンをリフレッシュした場合、
    新しいトークンをDBに書き戻す。
    """
    # このユーザーがこのラズパイに紐づいているか確認
    user = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == req.discord_user_id,
        models.UserSetting.raspi_id == raspi.id
    ).first()

    if not user:
        raise HTTPException(status_code=403, detail="このユーザーはこのラズパイに紐づいていません")

    updated = crud.update_user_google_tokens(
        db, req.discord_user_id, req.access_token, req.refresh_token
    )
    if not updated:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    return {"status": "success", "message": "トークンを更新しました"}


@app.post("/api/raspi/ble-register")
def ble_register_user(
    req: schemas.BleRegisterRequest,
    raspi: models.RaspiDevice = Depends(verify_raspi_api_key),
    db: Session = Depends(get_db)
):
    """
    BLE初期設定経由でユーザーを登録する。
    ラズパイのAPIキーで認証し、そのラズパイにユーザーを紐付ける。
    """
    user = crud.register_user_from_ble(
        db,
        discord_id=req.discord_user_id,
        mdm_device_id=req.mdm_device_id,
        raspi_id=raspi.id
    )
    return {
        "status": "success",
        "discord_user_id": user.discord_user_id,
        "raspi_id": raspi.id
    }


# ==========================
# Discord Bot向け既存API
# ==========================

class PlanRequest(BaseModel):
    discord_user_id: str
    date: Optional[str] = None
    time: Optional[str] = None
    task: Optional[str] = None


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

    if (user.google_access_token is not None and
        user.google_refresh_token is not None and
        plan.date is not None and
        plan.time is not None and
        plan.task is not None):

        try:
            google_calendar.add_event_to_calendar(
                access_token=str(user.google_access_token),
                refresh_token=str(user.google_refresh_token),
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
        "user_id": user.id,
        "offset_minutes": user.offset_minutes,
        "attack_scheduled": user.is_attack_scheduled,
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
    tokens = google_calendar.exchange_code_for_tokens(code)

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
# ユーザー情報取得API
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
                "raspi_id": u.raspi_id,
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

    if user.google_access_token is None or user.google_refresh_token is None:
        return {"status": "not_authorized", "message": "Googleカレンダーの認証が完了していません。!auth で認証してください。"}

    try:
        events = google_calendar.get_upcoming_events(
            access_token=str(user.google_access_token),
            refresh_token=str(user.google_refresh_token),
            max_results=5
        )
        return {"status": "success", "events": events}
    except Exception as e:
        print(f"⚠️ カレンダー取得エラー: {e}")
        return {"status": "error", "message": str(e)}


# ==========================
# エントリポイント
# ==========================
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
