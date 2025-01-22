import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, create_engine

from FAST_API.config import config


class PredictionResult(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    result: str
    created_at: Optional[str] = Field(default_factory=datetime.datetime.now)


engine = create_engine(config.db_url)