from database import SessionLocal
import crud, models
def set_setting_value(db, key: str, value: str):
    row = db.query(models.AppSetting).filter(models.AppSetting.key == key).first()
    if row:
        row.value = value
    else:
        db.add(models.AppSetting(key=key, value=value))
from datetime import datetime
db = SessionLocal()
now_hour = datetime.now().hour
set_setting_value(db, "review_notify_hour_24", str(now_hour))
db.commit()
print(f"Updated hour to {now_hour}")
    