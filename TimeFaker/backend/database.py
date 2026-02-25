from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. 保存先の指定（プロジェクトのルートに test.db という名前で保存されます）
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# 2. データベースエンジンの作成
# ※SQLite特有の設定（check_same_thread=False）を追加しています
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. データベースを操作するための「扉の鍵（セッション）」を作る
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. モデル作成時に使う「基本の型」を定義
Base = declarative_base()

# 5. データベースの扉を安全に開け閉めするための便利な道具（FastAPIのAPI側で使います）
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()