from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class UserSetting(Base):
    __tablename__ = "user_settings"
    id = Column(Integer, primary_key=True, index=True)
    discord_user_id = Column(String, unique=True, index=True)
    mdm_device_id = Column(String)
    offset_minutes = Column(Integer, default=0)
    is_attack_scheduled = Column(Boolean, default=False)
    gmail = Column(String, nullable=True)                      # GoogleカレンダーのGmailアドレス
    google_access_token = Column(String, nullable=True)        # OAuthアクセストークン
    google_refresh_token = Column(String, nullable=True)       # OAuthリフレッシュトークン
    schedules = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")


class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_settings.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    scheduled_at = Column(DateTime, nullable=False, index=True)

    user = relationship("UserSetting", back_populates="schedules")
