# crud.py
from sqlalchemy.orm import Session
import models
import random
from datetime import datetime


# ==========================================
# ラズパイデバイス管理
# ==========================================

def create_raspi_device(db: Session, name: str) -> models.RaspiDevice:
    """
    新しいラズパイを登録し、APIキーを発行する。
    """
    api_key = models.RaspiDevice.generate_api_key()
    device = models.RaspiDevice(name=name, api_key=api_key)
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


def get_raspi_by_api_key(db: Session, api_key: str) -> models.RaspiDevice | None:
    """APIキーからラズパイを検索する。"""
    return db.query(models.RaspiDevice).filter(
        models.RaspiDevice.api_key == api_key
    ).first()


def get_users_by_raspi_id(db: Session, raspi_id: int) -> list[models.UserSetting]:
    """ラズパイに紐づくユーザー一覧を取得する。"""
    return db.query(models.UserSetting).filter(
        models.UserSetting.raspi_id == raspi_id
    ).all()


# ==========================================
# ユーザー設定の CRUD
# ==========================================

def upsert_user_setting(db: Session, discord_id: str, device_id: str, offset: int):
    """
    ユーザー設定を保存する。
    既に登録されているユーザーなら上書き更新し、新規なら新しく作成する。
    """
    setting = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_id
    ).first()

    if setting:
        setting.mdm_device_id = device_id  # type: ignore
        setting.offset_minutes = offset  # type: ignore
    else:
        setting = models.UserSetting(
            discord_user_id=discord_id,
            mdm_device_id=device_id,
            offset_minutes=offset
        )
        db.add(setting)

    db.commit()
    db.refresh(setting)
    return setting


def get_all_settings(db: Session):
    """登録されているすべてのユーザー設定をリストで取得する。"""
    return db.query(models.UserSetting).all()


def register_user_from_ble(db: Session, discord_id: str, mdm_device_id: str | None = None, raspi_id: int | None = None):
    """
    BLE通信でDiscord IDとMDM Device IDが送られてきた時の処理。
    既存ユーザーならMDM IDを更新。新規なら枠を作って登録する。
    raspi_id が指定されていれば、そのラズパイに紐付ける。
    """
    setting = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_id
    ).first()
    normalized_device_id = (mdm_device_id or "").strip()

    if not setting:
        setting = models.UserSetting(
            discord_user_id=discord_id,
            mdm_device_id=normalized_device_id,
            offset_minutes=0,
            raspi_id=raspi_id
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
        print(f"✨ 新規ユーザー '{discord_id}' をDBに登録しました！")
    else:
        if normalized_device_id:
            setting.mdm_device_id = normalized_device_id  # type: ignore
        if raspi_id is not None:
            setting.raspi_id = raspi_id  # type: ignore
        db.commit()
        db.refresh(setting)
        print(f"👍 ユーザー '{discord_id}' を更新しました。")

    return setting


def schedule_attack(db: Session, discord_id: str):
    """ユーザーの攻撃予約フラグをONにする。"""
    user_setting = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_id
    ).first()

    if not user_setting:
        print(f"⚠️ 未登録ユーザーのため攻撃予約しません: {discord_id}")
        return False

    user_setting.is_attack_scheduled = True  # type: ignore
    db.commit()
    db.refresh(user_setting)
    return True


def add_schedules_for_mentions(
    db: Session,
    mentioned_discord_ids: list[str],
    date_str: str,
    time_str: str,
    title: str,
):
    """
    メンションされたDiscord IDのうち、user_settings に登録済みのユーザーだけ
    schedules テーブルへ予定を保存する。
    """
    scheduled_at = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")

    saved_ids: list[str] = []
    skipped_ids: list[str] = []

    for discord_id in mentioned_discord_ids:
        setting = (
            db.query(models.UserSetting)
            .filter(models.UserSetting.discord_user_id == discord_id)
            .first()
        )

        if not setting:
            skipped_ids.append(discord_id)
            continue

        schedule = models.Schedule(
            user_id=setting.id,
            title=title,
            scheduled_at=scheduled_at,
        )
        db.add(schedule)
        saved_ids.append(discord_id)

    db.commit()

    return {
        "saved_ids": saved_ids,
        "skipped_ids": skipped_ids,
        "scheduled_at": scheduled_at,
        "title": title,
    }


def register_gmail(db: Session, discord_id: str, gmail: str):
    """DiscordIDに対してGmailアドレスを登録する。"""
    setting = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_id
    ).first()

    if setting:
        setting.gmail = gmail  # type: ignore
        print(f"📧 ユーザー '{discord_id}' のGmailを更新しました: {gmail}")
    else:
        setting = models.UserSetting(
            discord_user_id=discord_id,
            gmail=gmail
        )
        db.add(setting)
        print(f"✨ 新規ユーザー '{discord_id}' をGmail '{gmail}' で登録しました！")

    db.commit()
    db.refresh(setting)
    return setting


def update_user_google_tokens(db: Session, discord_id: str, access_token: str, refresh_token: str):
    """OAuthトークンを更新する（リフレッシュ後の書き戻し用）。"""
    user = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_id
    ).first()

    if not user:
        print(f"⚠️ ユーザー '{discord_id}' が見つかりません")
        return None

    user.google_access_token = access_token  # type: ignore
    user.google_refresh_token = refresh_token  # type: ignore
    db.commit()
    db.refresh(user)
    print(f"🔄 ユーザー '{discord_id}' のOAuthトークンを更新しました")
    return user
