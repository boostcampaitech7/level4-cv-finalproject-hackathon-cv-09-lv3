"""
JWT(Json Web Token)은 Json 객체에 인증에 필요한 정보들을 담은 후 비밀키로 서명한 토큰으로, 인터넷 표준 인증 방식
"""
import os
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta

from fastapi import Form, Header, Request, Response, HTTPException, status
from fastapi.security import (
    HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
)
from pydantic import BaseModel, Field
from typing import List, Optional
from jose import jwt
from passlib.context import CryptContext

from .database.schemas import UserCreate, User, Project

JWT_SECRET = os.getenv("JWT_SECRET", "supernova-ai-api-access-token-secret")
JWT_ALGORITHM = "HS256"
# JWT_ISSUER = "http://www.supernova.com"
JWT_EXPIRE_MINUTES = 30 # 기본 액세스 토큰 만료 시간(분)
JWT_EXPIRE_DAYS = 14

AuthForm = UserCreate.as_form


class Token(BaseModel):
    access_token: str
    issued_token_type: str = "urn:ietf:params:oauth:token-type:jwt"
    token_type: str = "bearer"


class TokenData(User):
    projects: Optional[List[Project]] = Field(exclude=True)

    scope: Optional[str]        # JWT에서 사용되는 Scope 정보
    iss: Optional[str]          # 발급자(issuer)
    iat: Optional[datetime]     # 발급 시간(issue_at)
    exp: Optional[datetime]     # 만료 시간(expiration)
    sub: Optional[str]          # 주체(subject)
    aud: Optional[List[str]]    # 대상(audience)

    def dict(self, *args, **kwargs):
        kwargs["exclude_none"] = True
        return super().dict(*args, **kwargs)


class JWTBearer(HTTPBearer):
    # JWT 인증 토큰을 검증하는 메서드
    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        try:
            access_token = credentials.credentials
            # print("JWTBearer() access_token:", access_token)
            payload = jwt.decode(access_token, JWT_SECRET, algorithms=JWT_ALGORITHM)
            # print("payload:", payload)
            request.token_data = TokenData(**payload)
            # print("request.token_data:", request.token_data)
        except Exception as e:
            print(e)
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Invalid token or expired token")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
jwt_scheme = JWTBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(token_data: TokenData):
    # OAuth2 인증 스키마 및 JWT 스키마 초기화
    
    # print("create_access_token() token_data:", token_data)
    # token_data.iss = JWT_ISSUER
    token_data.iat = datetime.now(timezone.utc)  # issued_at
    token_data.exp = token_data.iat + timedelta(minutes=JWT_EXPIRE_MINUTES)
    # token_data.sub = token_data.email
    # token_data.aud = ["users@supernova-ai-service"]

    payload = token_data.dict()
    # For non-standard JWT properties datetime conversions are required.
    payload.update(dict(created=int(token_data.created.timestamp())))
    # print("payload:", payload)

    access_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # print("access_token:", access_token)
    return access_token


def save_access_token(token_data: TokenData):
    # 액세스 토큰 생성 함수
    
    # token_data.iss = JWT_ISSUER
    token_data.iat = datetime.now(timezone.utc)
    token_data.exp = token_data.iat + timedelta(days=JWT_EXPIRE_DAYS)

    payload = token_data.dict()
    payload.update(dict(created=int(token_data.created.timestamp())))

    access_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    # save token file
    data = dict(access_token=access_token)
    save_dir = Path(__file__).parent.parent / f"file_storage"

    with open(save_dir / "token.json", "w") as file:
        json.dump(data, file)

    return access_token


def verify_password(plain_password, hashed_password):
    # 비밀번호 검증 함수
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    # 비밀번호 해시 생성 함수
    return pwd_context.hash(password)
