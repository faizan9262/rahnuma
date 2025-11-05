from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from uuid import uuid4
from shutil import copyfileobj
import os
from app.models.user import User
from app.models.document import Document as DbDocument
from app.models.folder import Folder
from app.core.cloudinary_config import upload_file_to_cloudinary
import cloudinary.uploader
from langchain_community.document_loaders import (
    PyPDFLoader, UnstructuredPDFLoader, Docx2txtLoader, UnstructuredPowerPointLoader, TextLoader, CSVLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_experimental.text_splitter import SemanticChunker
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document as LcDocument
import requests
from io import BytesIO
from google.cloud import vision
from app.task import process_document_task
from celery import chain
import pytesseract
from PIL import Image

ALLOWED_TYPES = {
    "pdf": 20 * 1024 * 1024,
    "docx": 10 * 1024 * 1024,
    "pptx": 15 * 1024 * 1024,
    "png": 5 * 1024 * 1024,
    "jpg": 5 * 1024 * 1024,
    "jpeg": 5 * 1024 * 1024,
    "txt": 5 * 1024 * 1024,
    "csv": 5 * 1024 * 1024,
}

IMAGE_TYPES = {"png", "jpg", "jpeg"}
DOCUMENT_TYPES = {"pdf", "docx", "pptx", "txt", "csv"}

embeddings_for_chunker = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


async def handle_upload(parent_folder_id: int | None, file: UploadFile, db: Session, current_user: User):
    ext = file.filename.split(".")[-1].lower()

    if ext == "key":
        raise HTTPException(
            status_code=400,
            detail="Apple Keynote (.key) files are not supported. Please export as PDF or PPTX."
        )

    if ext not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {ext} is not allowed")

    content = await file.read()
    if len(content) > ALLOWED_TYPES[ext]:
        raise HTTPException(
            status_code=400,
            detail=f"{ext.upper()} files must be smaller than {ALLOWED_TYPES[ext] // (1024 * 1024)} MB"
        )

    file.file.seek(0)

    if ext in IMAGE_TYPES:
        file_url = await upload_file_to_cloudinary(file, folder="Rahnuma")
    elif ext in DOCUMENT_TYPES:
        user_folder = f"app/static/uploads/user_{current_user.id}"
        os.makedirs(user_folder, exist_ok=True)
        filename = f"{uuid4().hex}_{file.filename}"
        file_path = os.path.join(user_folder, filename)
        with open(file_path, "wb") as buffer:
            copyfileobj(file.file, buffer)
        file_url = file_path

    new_doc = DbDocument(
        user_id=current_user.id,
        folder_id=parent_folder_id,
        title=file.filename,
        file_url=file_url,
        file_type=ext.upper(),
        status="processing",
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    process_document_task.delay(new_doc.id, current_user.id)
    return new_doc


def list_user_documents(db: Session, current_user: User):
    return (
        db.query(DbDocument)
        .filter(
            (DbDocument.user_id == current_user.id) &
            (DbDocument.folder_id == None)
        )
        .all()
    )


def get_document_file(doc_id: int, db: Session, current_user: User) -> DbDocument:
    doc = db.query(DbDocument).filter(DbDocument.id == doc_id, DbDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="DbDocument not found")
    return doc


def delete_document(doc_id: int, db: Session, current_user: User):
    doc = db.query(DbDocument).filter(
        DbDocument.id == doc_id,
        DbDocument.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="DbDocument not found")

    if doc.file_url.startswith("http"):  # Cloudinary
        try:
            public_id = doc.file_url.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"Rahnuma/{public_id}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete from Cloudinary: {str(e)}")
    else:
        if os.path.exists(doc.file_url):
            os.remove(doc.file_url)

    db.delete(doc)
    db.commit()
    return {"message": "DbDocument deleted successfully"}


def load_and_split_document_with_vision(doc_id: int, db: Session, current_user: User):
    """
    Loads document content using the best method for its file type and uses a
    Semantic Chunker for unstructured text to ensure high-accuracy context.
    """
    doc = get_document_file(doc_id, db, current_user)
    file_path = doc.file_url
    ext = os.path.splitext(file_path)[1].lower().strip('.')

    print(f"Loading document: {file_path}, type: {ext}")
    documents = []

    # --- 1. Dedicated Logic for Structured Data (CSVs) ---
    if ext == "csv":
        try:
            # This logic correctly bypasses the text splitter.
            loader = CSVLoader(file_path=file_path)
            documents = loader.load()
            print(f"CSV loaded successfully. Number of rows (chunks): {len(documents)}")
            return documents
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load CSV: {e}")

    # --- 2. High-Accuracy Loading for Unstructured Text (PDF, DOCX, etc.) ---
    elif ext in {"pdf", "docx", "pptx", "txt"}:
        LOADERS = {
            "pdf": UnstructuredPDFLoader, # More robust loader for complex PDFs
            "docx": Docx2txtLoader,
            "pptx": UnstructuredPowerPointLoader,
            "txt": TextLoader,
        }
        loader = LOADERS[ext](file_path)
        try:
            documents = loader.load()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load document: {e}")
    
    # --- 3. Best-in-Class OCR for Images (Google Vision AI) ---
    elif ext in IMAGE_TYPES:
        try:
            with open(file_path, "rb") as image_file:
                content = image_file.read()

            client = vision.ImageAnnotatorClient()
            image = vision.Image(content=content)
            
            response = client.document_text_detection(image=image)
            
            if response.error.message:
                raise Exception(response.error.message)
                
            text = response.full_text_annotation.text if response.full_text_annotation else ""
            
            if not text.strip():
                raise HTTPException(status_code=400, detail="No readable text found in the image.")
            
            documents = [LcDocument(page_content=text, metadata={"source": file_path})]

        except Exception as e:
            print(f"Google Vision failed: {e}. Falling back to Tesseract.")
            try:
                text = pytesseract.image_to_string(Image.open(file_path))
                if not text.strip():
                     raise HTTPException(status_code=400, detail="No readable text found via Tesseract.")
                documents = [LcDocument(page_content=text, metadata={"source": file_path})]
            except Exception as tess_e:
                 raise HTTPException(status_code=500, detail=f"All OCR attempts failed: {tess_e}")

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    if not documents:
        return []

    # --- 4. THE PERMANENT SOLUTION: Use SemanticChunker for ALL Unstructured Text ---
    print(f"Splitting unstructured text with Semantic Chunker...")
    
    splitter = SemanticChunker(embeddings_for_chunker, breakpoint_threshold_type="percentile")
    
    full_text = "\n\n".join(doc.page_content for doc in documents)
    
    chunks = splitter.create_documents([full_text])
    
    print(f"Semantic chunking complete. Created {len(chunks)} high-quality chunks.")
    return chunks
