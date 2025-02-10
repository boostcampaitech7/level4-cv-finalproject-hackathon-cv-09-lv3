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
    db_api.update_redis_value(f"project_{id}", "processing")
    background_tasks.add_task(db_api.process_prediction, db, owner_id, id)
    
    return {"status": "Task started"}


@router.post("/{id}/modify")
def modify(background_tasks: BackgroundTasks,
            id: int,
            tone:str,
            db: DBSession = Depends(get_db),
            user: schemas.User = Depends(requireUser)):
    owner_id = user.id
    # db_api.update_redis_value(f"project_{id}", "processing")
    background_tasks.add_task(db_api.process_tone_chanage, db, owner_id, id, tone)
    print(id)
    print(tone)   
    
    return {"status": "Task started"}





