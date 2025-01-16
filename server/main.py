"""
config를 통해 서버의 호스트와 포트를 설정하여 API 서버 URL을 구성
클라이언트와 서버 간 원활한 통신을 위해 CORS 미들웨어를 추가

"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import config
from . import routers

api_server_url = f"http://{config.host}:{config.port}"
# print("api_server_url:", api_server_url)
servers = [
    dict(url=api_server_url, description="SuperNova AI API Server")
]
app = FastAPI(servers=servers)

# CORS(Cross-Origin Resource Sharing) 미들웨어 추가
# 클라이언트(프론트엔드)와 서버 간의 통신을 허용
# 아래 설정은 모든 출처(allow_origins=["*"])에서의 요청을 허용, 
# 인증 정보와 모든 HTTP 메서드 및 헤더도 허용

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "SuperNova AI Service"}


app.include_router(routers.auth, prefix="/api")
app.include_router(routers.api)
