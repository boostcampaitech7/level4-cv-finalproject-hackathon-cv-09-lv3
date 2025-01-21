from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer, String,
    text, select, distinct, func, and_
)
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import column_property, relationship

from .database import BaseModel


class User(BaseModel):
    email = Column(String, nullable=False, unique=True, index=True)
    password = Column(String)   # hashed_password
    name = Column(String)
    is_active = Column(Boolean, server_default="True")

    projects = relationship("Project", back_populates="owner")
    files = relationship("File", back_populates="owner")

class AssetMixin(object):
    @declared_attr
    def name(cls):
        return Column(String)

    @declared_attr
    def size(cls):
        return Column(Integer)

    @declared_attr
    def modified(cls):
        return Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    @declared_attr
    def owner_id(cls):
        return Column(Integer, ForeignKey(f"{User.__tablename__}.id"))

    @declared_attr
    def owner(cls):
        return relationship(User.__name__, back_populates=f"{cls.__tablename__}s")


class Project(BaseModel, AssetMixin):
    pass


class File(BaseModel, AssetMixin):
    # path = Column(String)
    content_type = Column(String)

    project_id = Column(Integer, ForeignKey(f"{Project.__tablename__}.id"))