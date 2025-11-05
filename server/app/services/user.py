from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.models.user import User
from app.core.cloudinary_config import upload_file_to_cloudinary

async def update_user_profile(
    current_user: User,
    db: Session,
    username: str = None,
    profile_pic: UploadFile = None
):
    updated = False

    if username:
        existing_user = db.query(User).filter(User.username == username, User.id != current_user.id).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
        current_user.username = username
        updated = True

    if profile_pic:
        profile_url = await upload_file_to_cloudinary(profile_pic, folder="profile_pictures")
        current_user.profile_picture = profile_url
        updated = True

    if updated:
        db.commit()
        db.refresh(current_user)

    return current_user
