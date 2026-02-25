# crud.py
from sqlalchemy.orm import Session
import models
import random
from datetime import datetime

# ＝＝＝ ① Discord Botが動いた時に「保存」する処理 ＝＝＝
def upsert_user_setting(db: Session, discord_id: str, device_id: str, offset: int):
    """
    ユーザー設定を保存する。
    既に登録されているユーザーなら上書き更新し、新規なら新しく作成する。
    """
    setting = db.query(models.UserSetting).filter(models.UserSetting.discord_user_id == discord_id).first()
    
    if setting:
        # 既にいれば上書き更新
        setting.mdm_device_id = device_id # type: ignore
        setting.offset_minutes = offset # type: ignore
    else:
        # いなければ新規作成
        setting = models.UserSetting(
            discord_user_id=discord_id,
            mdm_device_id=device_id,
            offset_minutes=offset
        )
        db.add(setting)
    
    db.commit()
    db.refresh(setting)
    return setting

# ＝＝＝ ② 毎日0時に「取り出す」処理 ＝＝＝
def get_all_settings(db: Session):
    """
    登録されているすべてのユーザー設定をリストで取得する。
    深夜0時の自動実行時に使用する。
    """
    return db.query(models.UserSetting).all()

# ＝＝＝ ③ スマホ(BLE)から初期設定された時の処理 ＝＝＝
def register_user_from_ble(db: Session, discord_id: str, mdm_device_id: str | None = None):
    """
    BLE通信でDiscord IDとMDM Device IDが送られてきた時の処理。
    既存ユーザーならMDM IDを更新。新規なら枠を作って登録する。
    """
    setting = db.query(models.UserSetting).filter(models.UserSetting.discord_user_id == discord_id).first()
    normalized_device_id = (mdm_device_id or "").strip()
    
    if not setting:
        # まだデータベースにいない新規ユーザーなら、初期値で作成
        setting = models.UserSetting(
            discord_user_id=discord_id,
            mdm_device_id=normalized_device_id,
            offset_minutes=0   # ズレ時間も初期値の0
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
        print(f"✨ 新規ユーザー '{discord_id}' をDBに登録しました！")
    else:
        if normalized_device_id:
            setting.mdm_device_id = normalized_device_id  # type: ignore
            db.commit()
            db.refresh(setting)
        print(f"👍 ユーザー '{discord_id}' のMDM IDを更新しました。")
        
    return setting

def schedule_attack(db: Session, discord_id: str):
    # ユーザーを探す
    user_setting = db.query(models.UserSetting).filter(models.UserSetting.discord_user_id == discord_id).first()

    if not user_setting:
        print(f"⚠️ 未登録ユーザーのため攻撃予約しません: {discord_id}")
        return False
    
    if user_setting:
        # 既にユーザーがいれば、攻撃予定フラグをONにする
        user_setting.is_attack_scheduled = True # type: ignore
            
        db.commit()
        db.refresh(user_setting)
        
        # 以前は offset（ズレ時間）を返していましたが、
        # 今回からは「成功したかどうかのTrue」だけを返します
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

# ＝＝＝ ④ DiscordIDにGmailを紐付ける処理 ＝＝＝
def register_gmail(db: Session, discord_id: str, gmail: str):
    """
    DiscordIDに対してGmailアドレスを登録する。
    既存ユーザーならGmailを更新し、新規なら枠を作って登録する。
    """
    setting = db.query(models.UserSetting).filter(
        models.UserSetting.discord_user_id == discord_id
    ).first()

    if setting:
        # 既にいれば Gmail だけ上書き更新
        setting.gmail = gmail  # type: ignore
        print(f"📧 ユーザー '{discord_id}' のGmailを更新しました: {gmail}")
    else:
        # いなければ新規作成
        setting = models.UserSetting(
            discord_user_id=discord_id,
            gmail=gmail
        )
        db.add(setting)
        print(f"✨ 新規ユーザー '{discord_id}' をGmail '{gmail}' で登録しました！")

    db.commit()
    db.refresh(setting)
    return setting
