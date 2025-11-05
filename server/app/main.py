from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
# from app.socket_server import sio
# import socketio
import os

# FastAPI app
app = FastAPI()

# Wrap FastAPI with Socket.IO ASGI app
# sio_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Socket.IO events
# @sio.event
# async def connect(sid, environ):
#     print(f"Client connected: {sid}")

# @sio.event
# async def disconnect(sid):
#     print(f"Client disconnected: {sid}")

# Middlewares
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

secret_key = os.getenv("SECRET_KEY", "dev_secret")
app.add_middleware(
    SessionMiddleware,
    secret_key=secret_key,
    session_cookie="fastapi_session",
    same_site="lax",
    https_only=False,
    max_age=60 * 60 * 24 * 7,
)

# Include routers as usual
from app.api.v1.auth import router as auth_router
from app.api.v1.user import router as user_router
from app.api.v1.document import router as document_router
from app.api.v1.search import router as search_router
from app.api.v1.folder import router as folder_router

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(document_router)
app.include_router(search_router)
app.include_router(folder_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Rahnuma API"}
