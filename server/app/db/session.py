import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from app.db.base import Base 

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True, future=True,pool_pre_ping=True,)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
