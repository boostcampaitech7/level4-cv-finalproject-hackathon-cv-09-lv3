"""
requireUser가 호출되어 요청에 포함된 사용자 정보 가져옴
user 변수에 schemas.User 타입의 인증된 사용자 정보가 할당

"""

from .router import *

router = APIRouter(prefix="/projects")


@router.put("", response_model=schemas.Project)
def createProject(
    project=Depends(schemas.ProjectCreate.as_form),
    user: schemas.User = Depends(requireUser), db: DBSession = Depends(get_db)
):
    project.owner_id = user.id
    return db_api.create(db, models.Project, project)


@router.get("", response_model=List[schemas.Project])
def listProjects(
    offset: int = 0, limit: int = -1,
    user: schemas.User = Depends(requireUser), db: DBSession = Depends(get_db)
):
    owner_id = user.id
    where = dict(owner_id=owner_id)
    return db_api.list(db, models.Project, where=where, offset=offset, limit=limit)


@router.get("/{id}", response_model=schemas.Project)
def getProject(id: int, db: DBSession = Depends(get_db)):
    return db_api.get(db, models.Project, id)


@router.post("/{id}", response_model=int)
def updateProject(id: int, values: dict, db: DBSession = Depends(get_db)):
    where = dict(id=id)
    return db_api.update(db, models.Project, where, values)


@router.delete("/{id}", response_model=int)
def deleteProject(id: int, db: DBSession = Depends(get_db)):
    where = dict(id=id)
    return db_api.delete(db, models.Project, where)


#[TODO] getStampImage, getResultImage, getResultAssay