from app.schemas.auth import RegisterUser,LoginUser
from sqlalchemy.orm import Session
from fastapi import HTTPException,status,Response
from app.models.user import User
from app.core.security import hash_password,verify_password
from app.core.security import create_token

def register_user(user:RegisterUser,response:Response, db:Session):
    existing_user = db.query(User).filter(User.email == user.email).first()
    
    if existing_user :
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Email Already Exists")
    
    hashed_password = hash_password(user.password)
    
    new_user = User(username=user.username,email=user.email,password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_token(new_user.id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  
        secure=False,   
        samesite="Lax",  
        max_age=60 * 60 * 24 * 7 ,
        path="/"
    )
    
    return {
        "user": new_user,
        "message": "Registration successful"
    }

def login_user(user:LoginUser,response:Response, db:Session):
    existing_user = db.query(User).filter(User.email == user.email).first()
    
    if not existing_user :
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Email does not Exists")
    
    is_matched_password = verify_password(user.password,existing_user.password)
    
    if not is_matched_password:
        raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid credentials")
        
    access_token = create_token(existing_user.id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  
        secure=False,   
        samesite="Lax",  
        max_age=60 * 60 * 24 * 7 ,
        path="/"
    )
    
    return {
        "user": existing_user,
        "message": "Login successful"
    }
    

def logout_user(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logout successful"}
