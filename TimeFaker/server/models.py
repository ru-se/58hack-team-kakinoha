import secrets
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class RaspiDevice(Base):
    """各家庭のラズパイを表すモデル"""
    __tablename__ = "raspi_devices"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)                           # 家庭名等の識別名
    api_key = Column(String, unique=True, index=True, nullable=False)  # 認証用APIキー
    created_at = Column(DateTime, default=datetime.utcnow)
    users = relationship("UserSetting", back_populates="raspi")

    @staticmethod
    def generate_api_key() -> str:
        """安全なランダムAPIキーを生成"""
        return secrets.token_urlsafe(32)


class UserSetting(Base):
    __tablename__ = "user_settings"
    id = Column(Integer, primary_key=True, index=True)
    discord_user_id = Column(String, unique=True, index=True)
    mdm_device_id = Column(String)
    offset_minutes = Column(Integer, default=0)
    is_attack_scheduled = Column(Boolean, default=False)
    gmail = Column(String, nullable=True)
    google_access_token = Column(String, nullable=True)
    google_refresh_token = Column(String, nullable=True)

    # ラズパイとの紐付け
    raspi_id = Column(Integer, ForeignKey("raspi_devices.id"), nullable=True)
    raspi = relationship("RaspiDevice", back_populates="users")

    schedules = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")


class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_settings.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    scheduled_at = Column(DateTime, nullable=False, index=True)

    user = relationship("UserSetting", back_populates="schedules")
