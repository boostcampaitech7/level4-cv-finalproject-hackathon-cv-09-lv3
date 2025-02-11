# 여러 프로젝트에서 공유하는 admin 경로 연산이 있는 APIRouter
from .router import *

router = APIRouter(prefix="/admin")


@router.post("")
def updateAdmin():
    return {"message": "Admin getting schwifty"}
