from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger
from sqlmodel import SQLModel

from api import router
from FAST_API.config import config
from FAST_API.database import engine
from FAST_API.dependencies import load_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 데이터베이스 테이블 생성
    logger.info("Creating database tables")
    SQLModel.metadata.create_all(engine)

    # 모델 로드
    logger.info("Loading model")
    load_model('Qwen/Qwen2-VL-7B-Instruct')

    yield

app = FastAPI(lifespan=lifespan)
app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True, reload_dirs = "./src")
