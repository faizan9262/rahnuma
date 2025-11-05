# app/core/cloudinary_config.py
import cloudinary
import os
from dotenv import load_dotenv
import cloudinary.uploader
from fastapi import UploadFile

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_SECRET_KEY"),
    secure=True
)


# Upload file buffer (e.g. real uploads from client)
async def upload_file_to_cloudinary(file: UploadFile, folder="Rahnuma") -> str:
    file_content = await file.read()
    result = cloudinary.uploader.upload(file_content, folder=folder)
    return result["secure_url"]


# Upload directly from URL or base64 string
def upload_from_url_or_base64(image_url: str, folder="Rahnuma") -> str:
    result = cloudinary.uploader.upload(image_url, folder=folder)
    return result["secure_url"]
