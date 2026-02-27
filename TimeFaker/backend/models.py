from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

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


class ReviewNotification(Base):
    __tablename__ = "review_notifications"
    __table_args__ = (
        UniqueConstraint("source_problem_url", "generated_at", name="uq_review_notifications_source_generated"),
    )

    id = Column(Integer, primary_key=True, index=True)
    source_problem_url = Column(String, nullable=False, index=True)
    generated_at = Column(DateTime, nullable=False, index=True)
    scheduled_for = Column(DateTime, nullable=False, index=True)
    status = Column(String, nullable=False, default="pending", index=True)  # pending/sent/failed
    sent_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class AppSetting(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, nullable=False, unique=True, index=True)
    value = Column(String, nullable=False)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
