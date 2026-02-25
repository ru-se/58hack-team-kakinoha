from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 保存先の指定
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# データベースエンジンの作成
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# セッションファクトリ
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モデルのベースクラス
Base = declarative_base()

# FastAPIのDependency Injection用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
