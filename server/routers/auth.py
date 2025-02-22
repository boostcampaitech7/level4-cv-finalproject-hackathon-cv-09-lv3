from .router import *
from ..security import *
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/auth")


def authenticate_user(db: DBSession, auth_data=Depends(AuthForm)):
    user = db_api.get_user_by_email(db, auth_data.email)
    if user and verify_password(auth_data.password, user.password):
        return user
    else:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect ID or password",
            headers={"WWW-Authenticate": "Bearer"}
        )


@router.post("/login", response_model=Token)
def login(
    # response: Response,
    auth_data=Depends(AuthForm), db: DBSession = Depends(get_db)
):
    if (auth_data.register_user):
        user = db_api.create_user(db, auth_data)
    else:
        user = authenticate_user(db, auth_data)

    token_data = TokenData.from_orm(user)
    token_data.scope = "admin test"  
    access_token = create_access_token(token_data)
    # save_access_token(token_data)
    # response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True)
    headers = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
        "Authorization": f"Bearer {access_token}"
    }
    # return Token(access_token=access_token)
    return JSONResponse(content={"access_token": access_token}, headers=headers)


@router.get("/logout", dependencies=[Depends(jwt_scheme)])
def logout(db: DBSession = Depends(get_db)):
    pass
