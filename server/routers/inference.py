import os
import json
import requests
from io import BytesIO

from .router import *

router = APIRouter(prefix="/inference")

@router.post("/{id}/predict")
def predict(background_tasks: BackgroundTasks,
            id: int,
            db: DBSession = Depends(get_db),
            user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    # with task_lock:
    #     task_status[id] = "in_progress"  # 작업 시작
    db_api.update_redis_value(f"project_{id}", "processing")
    background_tasks.add_task(db_api.process_prediction, db, owner_id, id)
    
    return {"status": "Task started"}





