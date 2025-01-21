# 모델 추론 APIRouter
from .router import *


router = APIRouter(prefix="/inference")

@router.post("/predict")
def predict(background_tasks: BackgroundTasks,
                  project_id: int,
                  input: List[UploadFile] = File(None),
                #   options: str = Form("{}"), 
                  db: DBSession = Depends(get_db),
                  user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    # background_tasks.add_task(process_prediction, db, input, options)
    saved_files = db_api.save_files(db, owner_id, project_id, input)
    return {
        "message": "Files uploaded successfully",
        "saved_files": input
    }


# def process_prediction(db: DBSession, app_name: str, input: List[UploadFile], options: str):
#     try:
#         result_response, result_save, input_path = app_manager.predict(app_name, input, options)
#         # TODO) 학습 성공 프로세스 구현
#         print('success')
#         db_api.save_file()
#     except:
#         # TODO) 학습 실패 프로세스 구현
#         print('fail')
        


    