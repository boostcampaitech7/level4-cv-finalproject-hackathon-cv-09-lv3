from .router import *

router = APIRouter(prefix="/users")


@router.put("", response_model=schemas.User)
def createUser(user: schemas.UserCreate, db: DBSession = Depends(get_db)):
    db_user = db_api.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    else:
        return db_api.create_user(db, user)


@router.get("", response_model=List[schemas.User])
def listUsers(offset: int = 0, limit: int = -1, db: DBSession = Depends(get_db)):
    return db_api.list(db, models.User, offset=offset, limit=limit)


@router.get("/{id}", response_model=schemas.User)
def getUser(id: int, db: DBSession = Depends(get_db)):
    return db_api.get(db, models.User, id)


@router.post("/{id}", response_model=int)
def updateUser(id: int, values: dict, db: DBSession = Depends(get_db)):
    where = dict(id=id)
    return db_api.update(db, models.User, where, values)


@router.delete("/{id}", response_model=int)
def deleteUser(id: int, db: DBSession = Depends(get_db)):
    where = dict(id=id)
    return db_api.delete(db, models.User, where)


@router.put("/{id}/projects", response_model=schemas.Project)
def createUserProject(
    id: int, project: schemas.ProjectCreate, db: DBSession = Depends(get_db)
):
    project.owner_id = id
    return db_api.create(db, models.Project, project)


@router.get("/{id}/projects", response_model=List[schemas.Project])
def listUserProjects(
    id: int, offset: int = 0, limit: int = -1, db: DBSession = Depends(get_db)
):
    where = dict(owner_id=id)
    return db_api.list(db, models.Project, where=where, offset=offset, limit=limit)

