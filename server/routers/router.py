from fastapi import APIRouter as BaseRouter
from fastapi import Depends, HTTPException, Request, status
from fastapi import Form, UploadFile, File
from fastapi.responses import StreamingResponse, PlainTextResponse, JSONResponse, FileResponse
from fastapi import FastAPI, BackgroundTasks
# libs for type validation
from typing import List
import json

from ..database import api as db_api
from ..database.api import models, schemas, get_db, DBSession

ARG_KEY_PREFIX = "prefix"
ARG_KEY_OPERATION_ID = "operation_id"
ARG_KEY_TAGS = "tags"
ARG_KEY_USE_DEFAULT_TAG = "use_default_tag"
ARG_KEY_SUMMARY = "summary"

"""
라우트의 공통 경로(즉, prefix)를 관리
ex) /users와 관련된 모든 엔드포인트가 prefix="/users"로 정의
각 라우트의 operation_id를 명시적으로 정의하거나 자동으로 설정
라우트를 카테고리화하여 태그(tags)를 지정
"""


class APIRouter(BaseRouter):
    def __init__(self, *args, **kwargs):
        self.add_default_tag(kwargs, kwargs.get(ARG_KEY_PREFIX, ""))
        super().__init__(*args, **kwargs)

    def add_default_tag(self, kwargs, path):
     
        use_default_tag = kwargs.pop(ARG_KEY_USE_DEFAULT_TAG, True)
        if not use_default_tag:
            return

        tags = getattr(self, ARG_KEY_TAGS, None)
        if tags:
            return

        tags = kwargs.get(ARG_KEY_TAGS, []) or []
        default_tag = path[1:].split("/")[0]
        if default_tag and (default_tag not in tags):
            tags.append(default_tag)
            kwargs[ARG_KEY_TAGS] = tags

    def set_default_operation_id(self, kwargs, func):
        operation_id = kwargs.get(ARG_KEY_OPERATION_ID, None)
        if not operation_id:
            kwargs[ARG_KEY_OPERATION_ID] = func.__name__

    def set_default_summary(self, kwargs, func):
        summary = kwargs.get(ARG_KEY_SUMMARY, None)
        if not summary:
            kwargs[ARG_KEY_SUMMARY] = func.__name__

    def api_route(self, path, *args, **kwargs):
        def decorator(func):
            self.add_default_tag(kwargs, path)
            self.set_default_operation_id(kwargs, func)
            self.set_default_summary(kwargs, func)
            self.add_api_route(path, func, *args, **kwargs)
            return func

        return decorator

#인증된 사용자인지 확인인
def requireUser(request: Request) -> schemas.User:
    return request.token_data
