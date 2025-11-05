from passlib.context import CryptContext
import os 
from dotenv import load_dotenv
from jose import jwt,JWTError,ExpiredSignatureError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, Request
from app.models.user import User
from sqlalchemy.orm import Session
from app.db.getdb import get_db
import bcrypt


load_dotenv()

# Create a password context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")
    hashed = bcrypt.hashpw(pw_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
EXPIRY_DAYS = 7


def create_token(user_id: int) -> str:
    """
    Create a JWT token containing only user_id.
    """
    expire = datetime.utcnow() + timedelta(
        days= EXPIRY_DAYS
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    # print("Token",token)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = token.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first() 
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")