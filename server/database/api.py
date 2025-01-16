from io import BytesIO
from pathlib import Path
import shutil
import re
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession, Query
from typing import Any, List

from PIL import Image
import csv
import json

from .database import get_db, session_scope
from . import models, schemas
from ..security import get_password_hash

PATH_SEP = "/"

COLUMN_ID = "id"
COLUMN_OWNER_ID = "owner_id"
COLUMN_PATH = "path"


file_storage_dir = Path(__file__).parent.parent.parent / "file_storage"
# print("file storage:", file_storage_dir.absolute())


def user_file_storage_dir(id: int):
    return file_storage_dir / f"user_{id}"

def project_file_storage_dirs(owner_id: int, project_id: int):
    project_dir = user_file_storage_dir(owner_id) / f"project_{project_id}"
    training_dir = project_dir / "training"
    evaluation_dir = project_dir / "evaluation"
    return project_dir, training_dir, evaluation_dir

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


