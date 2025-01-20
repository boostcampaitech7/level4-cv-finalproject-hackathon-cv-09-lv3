from datetime import datetime
from fastapi import Form, File as FormData, UploadFile
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

#
# Create 클래스는 데이터가 생성될 때 사용자가 제공하는 값으로 설정되는 속성을 정의의
#  
# Base 클래스는 데이터가 생성된 후 시스템에 의해 관리되거나 사용자가 제공하는 값으로 설정되는 속성을 정의
#      

class SchemaCreate(BaseModel):
    created: Optional[datetime]


class SchemaBase(BaseModel): 
    id: int
    created: datetime

    class Config:
        orm_mode = True


class AssetCreate(SchemaCreate):
    name: str
    size: Optional[int]
    modified: Optional[datetime]
    owner_id: Optional[int]

    @classmethod
    def as_form(
        cls,
        name: str = Form(), owner_id: Optional[int] = Form(default=None)
    ):
        return cls(name=name, owner_id=owner_id)


# Partial of User
class Owner(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class AssetBase(SchemaBase):
    modified: datetime
    owner: Owner


class ProjectCreate(AssetCreate):

    @classmethod
    def as_form(
        cls,
        name: str = Form(), 
        # owner_id: Optional[int] = Form(default=None),
    ):
        return cls(name=name)

class FileCreate(AssetCreate):
    path: str
    content_type: Optional[str]
    project_id: Optional[int]
    
    
class ProjectInfo(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class Project(ProjectCreate, AssetBase):
    pass

class File(FileCreate, AssetBase):
    project: Optional[ProjectInfo]

class UserCreate(SchemaCreate):
    email: str
    password: str
    name: str
    register_user: bool = Field(False, alias="register", exclude=True)

    @classmethod
    def as_form(
        cls,
        email: str = Form(), password: str = Form(),
        name: str = Form(default=""), register: bool = Form(default=False)
    ):
        return cls(email=email, password=password, name=name, register=register)


class User(UserCreate, SchemaBase):
    password: Optional[str] = Field(exclude=True)
    is_active: bool

    projects: Optional[List[Project]]
