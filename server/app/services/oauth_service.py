import os
from fastapi import Response, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from authlib.integrations.base_client.errors import OAuthError

from app.models.user import User
from app.core.security import create_token
import httpx

# Initialize OAuth client
oauth = OAuth()
CONF_URL = "https://accounts.google.com/.well-known/openid-configuration"

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url=CONF_URL,
    client_kwargs={"scope": "openid email profile"},
    userinfo_endpoint="https://openidconnect.googleapis.com/v1/userinfo"
)

def oauth_get_or_create_user(user_info: dict, db: Session):
    email = user_info.get("email")
    # Use 'name' from Google as the username
    name = user_info.get("name")
    picture = user_info.get("picture")

    if not email:
        # If Google doesn't return an email, we cannot proceed.
        raise HTTPException(status_code=400, detail="Email not provided by Google OAuth.")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create a new user if one doesn't exist
        user = User(
            username=name, # Ensure your User model can handle this
            email=email,
            profile_picture=picture,
            password=None  # No password for OAuth users
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Optionally update existing user's info
        if picture and user.profile_picture != picture:
            user.profile_picture = picture
        if name and user.username != name:
            user.username = name
        db.commit()
        db.refresh(user)

    access_token = create_token({"user_id": user.id})
    return user, access_token


async def handle_google_callback(request: Request, db: Session):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as e:
        print(f"OAuth Error during token authorization: {e.description}")
        return RedirectResponse(url=f"{frontend_url}/login?error=oauth_failed")

    # ✅ Fetch user info explicitly from Google's UserInfo endpoint
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://openidconnect.googleapis.com/v1/userinfo",
                headers={"Authorization": f"Bearer {token['access_token']}"}
            )
        resp.raise_for_status()
        user_info = resp.json()
    except Exception as e:
        print(f"Error fetching Google userinfo: {e}")
        return RedirectResponse(url=f"{frontend_url}/login?error=userinfo_failed")

    print("--- Google User Info ---")
    print(user_info)
    print("------------------------")

    try:
        user, _ = oauth_get_or_create_user(user_info, db)

        access_token = create_token(user.id)
    except Exception as e:
        print(f"Database error in oauth_get_or_create_user: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error processing user data in database.")

    response = RedirectResponse(url=frontend_url)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",  # keep same format since you strip "Bearer " in get_current_user
        httponly=True,  
        secure=False,    # ⚠️ set True in production
        samesite="Lax",  
        max_age=60 * 60 * 24 * 7,
        path="/"
    )
    
    return response


