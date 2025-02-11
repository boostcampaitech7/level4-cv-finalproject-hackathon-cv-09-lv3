from sqlalchemy import create_engine, Column, DateTime, Integer, text
from sqlalchemy.ext.declarative import declared_attr, declarative_base
from sqlalchemy.orm import sessionmaker

from contextlib import contextmanager

from pathlib import Path
sqlite_db_path = str(Path(__file__).parent.absolute() / "supernova-ai-service.db")
DATABASE_URL = f"sqlite:///{sqlite_db_path}"
# 다른 DB를 사용하는 경우 아래와 같이 설정 (PostgreSQL 예시)
# DATABASE_URL = "postgresql://user:password@postgresserver/db"

verbose = False

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    #SQLite의 경우 멀티스레딩 문제를 해결하기 위해 check_same_thread를 비활성화
    connect_args["check_same_thread"] = False
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=verbose)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class BaseModel(object):
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    # __table_args__ = {"mysql_engine": "InnoDB"}

    id = Column(Integer, primary_key=True)
    created = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))


BaseModel = declarative_base(cls=BaseModel)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def session_scope():
    """일련의 작업에 대한 트랜잭션 범위를 제공"""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
