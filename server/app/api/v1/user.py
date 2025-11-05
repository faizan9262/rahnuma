from fastapi import APIRouter, Depends, UploadFile, File, Form,status
from sqlalchemy.orm import Session
from app.db.getdb import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.services.user import update_user_profile
from app.schemas.auth import RegisterLoginResponse

router = APIRouter(prefix="/user", tags=["User"])

@router.put("/profile",status_code=status.HTTP_200_OK,response_model=RegisterLoginResponse)
async def update_profile(
    username: str = Form(None),
    profile_pic: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_user = await update_user_profile(
        current_user=current_user,
        db=db,
        username=username,
        profile_pic=profile_pic
    )

    return{
        "user":updated_user,
        "message":"Profile Updated"
    }
