from io import BytesIO
from pathlib import Path
import shutil
import re
from datetime import datetime
import os

from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession, Query
from typing import Any, List

from PIL import Image
import csv
import json

from .database import get_db, session_scope
from . import models, schemas
from ..security import get_password_hash

import requests
# from threading import Lock
from functools import wraps


PATH_SEP = "/"

COLUMN_ID = "id"
COLUMN_OWNER_ID = "owner_id"
COLUMN_PATH = "path"

INFERENCE_SERVER_URL = "https://cc1f-223-130-141-5.ngrok-free.app/predict"
REDIS_URL = "https://6263-223-130-141-5.ngrok-free.app"


file_storage_dir = Path(__file__).parent.parent.parent / "file_storage"
# print("file storage:", file_storage_dir.absolute())


def user_file_storage_dir(id: int):
    return file_storage_dir / f"user_{id}"

def project_file_storage_dirs(owner_id: int, project_id: int):
    project_dir = user_file_storage_dir(owner_id) / f"project_{project_id}"
    return project_dir

def get_image(image_path: any):
    content = BytesIO()
    media_type = None
    if image_path.exists():
        extension_to_media = {
            ".jpg": ("image/jpeg", "JPEG"),
            ".jpeg": ("image/jpeg", "JPEG"),
            ".gif": ("image/gif", "GIF"),
            ".png": ("image/png", "PNG"),
            ".tif": ("image/tiff", "TIFF"),
            ".tiff": ("image/tiff", "TIFF"),
        }
        media_type, media_format = extension_to_media.get(image_path.suffix.lower(), (None, None))
        if media_type and media_format:
            with Image.open(image_path) as im:
                if im.mode == "RGBA":
                    im = im.convert("RGB")
                im.save(content, media_format, quality=95, subsampling=0)
                content.seek(0)
    return dict(content=content, media_type=media_type)
#
# Basic management APIs
#


def _select(db: DBSession, model: Any, where: dict = None) -> Query:
    query = db.query(model)
    if where:
        filters = [getattr(model, key) == where[key] for key in where]
        query = query.filter(*filters)
    return query


def create(db: DBSession, model: Any, data: Any, commit=True):
    try:
        record = model(**data.dict())
        db.add(record)
        if commit:
            db.commit()
        else:
            db.flush()
        db.refresh(record)
        return record
    except:
        db.rollback()
        raise


def count(db: DBSession, model: Any, where: dict = None) -> int:
    query = db.query(func.count(model.id))
    if where:
        filters = [getattr(model, key) == where[key] for key in where]
        query = query.filter(*filters)
    # print(f"count() result: {query.scalar()}, query:\n{query}")
    return query.scalar()


array = list  # alias to avoid name conflict

def list(
    db: DBSession, model: Any, where: dict = None, offset: int = 0, limit: int = -1
):
    query = _select(db, model, where)
    if 0 < offset:
        query = query.offset(offset)
    if 0 < limit:
        query = query.limit(limit)
    return query.all()


def get(db: DBSession, model: Any, id: Any):
    return _select(db, model, dict(id=id)).one_or_none()


def update(db: DBSession, model: Any, where: dict, values: dict, commit=True) -> int:
    try:
        num_rows_updated = _select(db, model, where).update(values)
        if commit:
            db.commit()
        else:
            db.flush()
        return num_rows_updated
    except:
        db.rollback()
        raise


def delete(db: DBSession, model: Any, where: dict, commit=True) -> int:
    try:
        num_rows_deleted = _select(db, model, where).delete()
        if commit:
            db.commit()
        else:
            db.flush()
        return num_rows_deleted
    except:
        db.rollback()
        raise


#
# User management APIs
#


def create_user(db: DBSession, user: schemas.UserCreate) -> models.User:
    user.password = get_password_hash(user.password)
    return create(db, models.User, user)


def get_user_by_email(db: DBSession, email: str) -> models.User:
    return _select(db, models.User, dict(email=email)).one_or_none()


#
# Project management APIs
#

def get_project_stamp(owner_id: int, project_id: int):
    project_dir = project_file_storage_dirs(owner_id, project_id)
    stamp_path = project_dir / "stamp.png"
    if os.path.exists(stamp_path):
        return get_image(stamp_path)
    else:
        return get_image(file_storage_dir / "example_stamp.png")
    
def get_project_postcard(owner_id: int, project_id: int):
    project_dir = project_file_storage_dirs(owner_id, project_id)
    stamp_path = project_dir / "postcard.png"
    if os.path.exists(stamp_path):
        return get_image(stamp_path)
    else:
        return get_image(file_storage_dir / "postcard_example.png")
    
def get_project_image(owner_id: int, project_id: int, name: str):
    project_dir = project_file_storage_dirs(owner_id, project_id)
    image_path = project_dir / name
    if os.path.exists(image_path):
        return get_image(image_path)
    else:
        return get_image(file_storage_dir / "example_image.png")

# def get_project_postcards(owner_id: int, project_id: int):
#     project_dir = project_file_storage_dirs(owner_id, project_id)
    
def get_project_blog(owner_id: int, project_id: int):
    project_dir = project_file_storage_dirs(owner_id, project_id)
    blog_path = project_dir / "response.json"
    media_type = "application/json"
    filename = "reponse.json"
    if os.path.exists(blog_path):
        return blog_path, media_type, filename
    else:
        return file_storage_dir / "blog_example.json", media_type, "blog_example.json"


def save_files(db: DBSession, owner_id: int, project_id: int, files: List[schemas.UploadFile]):
    saved_files = []
    
    project_dir = project_file_storage_dirs(owner_id, project_id)
    os.makedirs(project_dir, exist_ok=True)

    for file in files:
        file_path = os.path.join(project_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        saved_files.append(file_path)
        
        name = file.filename
        size = 0 # 사이즈 예시
        # path = file_path
        content_type = file.content_type
        
        create(
            db,
            models.File,
            schemas.FileCreate(
                name=name,
                size=size,
                owner_id=owner_id,
                # path=path,
                content_type=content_type,
                project_id=project_id,
            ),
            commit=True,
        )

    return saved_files

def save_image_to_url(owner_id: int, project_id: int, image_url = str):
    
    project_dir = project_file_storage_dirs(owner_id, project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    save_path = os.path.join(project_dir, "postcard.png")
    
    response = requests.get(image_url, stream=True)
    response.raise_for_status()
    
    image = Image.open(BytesIO(response.content))
    
    image.save(save_path)
    print(f"이미지가 저장되었습니다: {save_path}")
    
def save_blog(owner_id: int, project_id: int, file: schemas.UploadFile):
    project_dir = project_file_storage_dirs(owner_id, project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    save_path = os.path.join(project_dir, "blog.json")
    with open(save_path, "wb") as f:
        f.write(file.file.read())
        
    ##
    # 혹시 모를 버전 관리 코드
    ##
        
    # save_path = Path(project_dir) / "blog.json"
    # timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    # backup_path = Path(project_dir) / f"blog_{timestamp}.json"

    # # 기존 파일이 있으면 백업
    # if save_path.exists():
    #     os.rename(save_path, backup_path)

    # with open(save_path, "wb") as f:
    #     f.write(file.file.read())

    # # 기존 백업 파일 목록 가져오기 (정렬 후 오래된 것 삭제)
    # backup_files = sorted(Path(project_dir).glob("blog_*.json"), key=os.path.getctime, reverse=True)

    # # 최근 max_backups 개만 유지
    # for old_file in backup_files[max_backups:]:
    #     os.remove(old_file)
        
    print(f"블로그가 수정정되었습니다: {save_path}")
    
#
# Inference management APIs
#
# task_status = {}
# task_lock = Lock()

def handle_exceptions(func):
    """ 예외 처리 데코레이터 """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except FileNotFoundError as e:
            print(f"File not found: {e}")
        except json.JSONDecodeError as e:
            print(f"JSON decoding error: {e}")
        except requests.RequestException as e:
            print(f"Request failed: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")
    return wrapper


def update_redis_value(key, value):
    response = requests.post(f"{REDIS_URL}/set/{key}/{value}")
    print(f"{key}/{value}")


def fetch_project_files(owner_id: int, project_id: int):
    """ 프로젝트 폴더에서 이미지 및 JSON 파일을 불러오는 함수 """
    project_dir = project_file_storage_dirs(owner_id, project_id)
    file_data = []

    if not os.path.exists(project_dir) or not os.path.isdir(project_dir):
        raise FileNotFoundError(f"Project directory not found: {project_dir}")

    files = os.listdir(project_dir)
    print(f"Files in directory: {project_dir}")

    # 이미지 파일 추가
    for file in files:
        file_path = os.path.join(project_dir, file)
        if os.path.isfile(file_path) and file.endswith(('.jpg', '.jpeg', '.png')):
            print(f"Adding file to request: {file}")
            file_data.append(('files', (file, open(file_path, 'rb'), "image/jpeg")))

    # JSON 파일 추가
    json_file_path = os.path.join(project_dir, "descriptions.json")
    if not os.path.exists(json_file_path):
        raise FileNotFoundError(f"JSON file not found: {json_file_path}")

    file_data.append(('jsons', ("descriptions.json", open(json_file_path, 'rb'), "application/json")))

    return file_data, project_dir


@handle_exceptions
def send_request(file_data):
    """ 모델 서버로 요청을 보내고 응답을 반환하는 함수 """
    response = requests.post(INFERENCE_SERVER_URL, files=file_data)
    print(f"Response from model_url: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response body: {response.text}")

    try:
        response_data = response.json()  # JSON 파싱
    except json.JSONDecodeError:
        response_data = {"result": response.text}  # 비정상적인 응답 처리
    
    return response_data


@handle_exceptions
def process_prediction(db: DBSession, owner_id: int, project_id: int):
    """ 전체 예측 프로세스를 실행하는 함수 """
    print("Starting prediction process...")
    
    # with task_lock:
    #     task_status[project_id] = "in_progress"

    file_data, project_dir = fetch_project_files(owner_id, project_id)
    
    response_data = send_request(file_data)

    if response_data:
        response_json_path = os.path.join(project_dir, "response.json")
        with open(response_json_path, 'w', encoding='utf-8') as json_file:
            json.dump(response_data, json_file, indent=4, ensure_ascii=False)
        print(f"Response saved to JSON file: {response_json_path}")

        # with task_lock:
        #     task_status[project_id] = "completed"
        update_redis_value(f"project_{project_id}", "finish")

    else:
        update_redis_value(f"project_{project_id}", "failed")
        print("Prediction process failed.")