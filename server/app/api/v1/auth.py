from fastapi import APIRouter, status, Depends, Response, Request
from sqlalchemy.orm import Session
import os
from app.models.user import User
from app.core.security import get_current_user

from app.schemas.auth import RegisterUser, RegisterLoginResponse, LoginUser
from app.db.getdb import get_db
from app.services.auth_service import register_user, login_user, logout_user
from app.services.oauth_service import oauth, handle_google_callback

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post('/register', status_code=status.HTTP_201_CREATED, response_model=RegisterLoginResponse)
def register(user: RegisterUser, response: Response, db: Session = Depends(get_db)):
    return register_user(user, response, db)


@router.post('/login', status_code=status.HTTP_200_OK, response_model=RegisterLoginResponse)
def login(user: LoginUser, response: Response, db: Session = Depends(get_db)):
    return login_user(user, response, db)


@router.post('/logout', status_code=status.HTTP_200_OK)
def logout(response: Response):
    return logout_user(response)

@router.get("/me",response_model=RegisterLoginResponse)
def auth_me(current_user: User = Depends(get_current_user)):
    return {"user":current_user,"message":"Authenticated"}

@router.get("/google/login")
async def google_login(request: Request):
    # This URL must match what you've configured in Google Cloud Console
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    # The 'response' parameter is removed from here
    return await handle_google_callback(request, db)
