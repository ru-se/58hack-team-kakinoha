from pydantic import BaseModel
from typing import List, Optional


# === Discord Bot 向けスキーマ（既存） ===

class UserSettingCreate(BaseModel):
    discord_user_id: str
    mdm_device_id: str
    offset_minutes: int


class ScheduleCreate(BaseModel):
    mentioned_discord_ids: List[str]
    date: str
    time: str
    title: str


# === ラズパイ向けスキーマ（新規） ===

class RaspiRegisterRequest(BaseModel):
    name: str  # 家庭名等の識別名


class RaspiRegisterResponse(BaseModel):
    raspi_id: int
    api_key: str
    message: str


class UserTokenResponse(BaseModel):
    discord_user_id: str
    google_access_token: Optional[str] = None
    google_refresh_token: Optional[str] = None


class TokenRefreshRequest(BaseModel):
    discord_user_id: str
    access_token: str
    refresh_token: str


class BleRegisterRequest(BaseModel):
    discord_user_id: str
    mdm_device_id: Optional[str] = None
