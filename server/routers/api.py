from .router import *
from .auth import jwt_scheme
from . import admin, users, projects, inference

router = APIRouter(prefix="/api", dependencies=[Depends(jwt_scheme)], use_default_tag=False)

router.include_router(admin.router)
router.include_router(users.router)
router.include_router(projects.router)
router.include_router(inference.router)
