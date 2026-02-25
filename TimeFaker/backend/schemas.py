# schemas.py
from pydantic import BaseModel
from typing import List

# ★Discord Botが送ってくるデータの「型」定義
class UserSettingCreate(BaseModel):
    discord_user_id: str
    mdm_device_id: str
    offset_minutes: int


class ScheduleCreate(BaseModel):
    mentioned_discord_ids: List[str]
    date: str
    time: str
    title: str
