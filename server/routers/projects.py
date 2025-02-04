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


@router.post("/{id}/status", response_model=int)
def updateProjectStatus(id: int, status: str, db: DBSession = Depends(get_db)):
    where = dict(id=id)
    values = {'status': status}
    return db_api.update(db, models.Project, where, values)


@router.delete("/{id}", response_model=int)
def deleteProject(id: int, db: DBSession = Depends(get_db)):
    where = dict(id=id)
    return db_api.delete(db, models.Project, where)


@router.post("/{id}/files")
def saveProjectFiles(id:int, 
                     input: List[UploadFile] = File(None), 
                     db: DBSession = Depends(get_db),
                     user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    saved_files = db_api.save_files(db, owner_id, id, input)
    return {
        "message": "Files uploaded successfully",
    }


@router.post("/{id}/descriptions")
def saveProjectDescriptions(id:int, 
                     input: List[UploadFile] = File(None), 
                     db: DBSession = Depends(get_db),
                     user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    saved_files = db_api.save_files(db, owner_id, id, input)
    return {
        "message": "Files uploaded successfully",
    }


# @router.post("/{id}/blog")
# def saveProjectblog(id:int, 
#                      input: List[UploadFile] = File(None), 
#                      db: DBSession = Depends(get_db),
#                      user: schemas.User = Depends(requireUser)):
#     owner_id = user.id
#     saved_blog = db_api.save_blog(db, owner_id, id, input)
#     return {
#         "message": "Files uploaded successfully",
#     }
    
@router.get("{id}", response_model=List[schemas.Project])
def listProjectfiles(id:int,
    offset: int = 0, limit: int = -1,
    user: schemas.User = Depends(requireUser), db: DBSession = Depends(get_db)
):
    owner_id = user.id
    where = dict(owner_id=owner_id, project_id=id)
    return db_api.list(db, models.File, where=where, offset=offset, limit=limit)


@router.get("/{id}/project_stamp", response_class=StreamingResponse)
def getProjectStamp(id: int, user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    thumb_data = db_api.get_project_stamp(owner_id, id)
    headers = {
        "Cache-Control": "public, max-age=86400",  # 24시간 캐싱
        "Content-Type": "image/png"
    }
    return StreamingResponse(**thumb_data,headers=headers)


@router.get("/{id}/project_postcard", response_class=StreamingResponse)
def getProjectPostcard(id: int, user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    thumb_data = db_api.get_project_postcard(owner_id, id)
    headers = {
        "Cache-Control": "public, max-age=86400",  # 24시간 캐싱
        "Content-Type": "image/png"
    }
    return StreamingResponse(**thumb_data,headers=headers)


@router.get("/{id}/{name}/image", response_class=StreamingResponse)
def getProjectImage(id: int, name: str, user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    thumb_data = db_api.get_project_image(owner_id, id, name)
    headers = {
        "Cache-Control": "public, max-age=86400",  # 24시간 캐싱
        "Content-Type": "image/png"
    }
    return StreamingResponse(**thumb_data,headers=headers)



@router.get("/{id}/project_blog", response_class=StreamingResponse)
def getProjectBlog(id: int, user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    path, media_type, filename = db_api.get_project_blog(owner_id, id)
    return FileResponse(path=path, media_type=media_type, filename=filename)


@router.post("/{id}/image_url")
def saveImageUrl(id: int,
                 input:str,
                 user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    saved_image_url = db_api.save_image_to_url(owner_id, id, input)
    return {
        "message": "images saved successfully",
    }
    

@router.post("/{id}/project_blog")
def modifyProjectBlog(id:int,
                      input: UploadFile = File(...),
                      user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    saved_blog = db_api.save_blog(owner_id, id, input)
    return {
        "message": "blog saved successfully",
    }
    
    
    
# @router.get("/{id}/input_images", response_class=StreamingResponse)
# def getProjectPostcard(id: int, user: schemas.User = Depends(requireUser)):
#     owner_id = user.id
#     images = db_api.get_project_postcards(owner_id, id)
    
#     def generate():
#         for img_data in images:
#             yield (b"--frame\r\n"
#                    b"Content-Type: image/png\r\n\r\n" + img_data + b"\r\n")
            
#     headers = {
#         "Cache-Control": "public, max-age=86400",  # 24시간 캐싱
#         "Content-Type": "image/png"
#     }
#     return StreamingResponse(generate(),headers=headers)


#[TODO] getStampImage, getResultImage, getResultAssay