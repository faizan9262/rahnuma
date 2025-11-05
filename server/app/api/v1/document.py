from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.getdb import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.services.document_service import (
    handle_upload,
    list_user_documents,
    get_document_file,
    delete_document,
    load_and_split_document_with_vision
)
from app.schemas.document import DocumentResponse,UploadBody
import os
import mimetypes

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", status_code=status.HTTP_201_CREATED, response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    parent_folder_id: int | None = Form(None),  # 👈 this line is crucial
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_doc = await handle_upload(
        parent_folder_id=parent_folder_id,
        file=file,
        db=db,
        current_user=current_user
    )
    return new_doc


@router.get("/list", response_model=list[DocumentResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return list_user_documents(db, current_user)

@router.delete("/delete/{doc_id}")
def delete_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_document(doc_id, db, current_user)

@router.post("/load/{doc_id}")
def delete_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return load_and_split_document_with_vision(doc_id, db, current_user)

@router.get("/download/{doc_id}")
def download_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = get_document_file(doc_id, db, current_user)

    if doc.file_url.startswith("http"):
        return {"file_url": doc.file_url}
    elif os.path.exists(doc.file_url):
        return FileResponse(path=doc.file_url, filename=doc.title)
    else:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/preview/{doc_id}")
def preview_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = get_document_file(doc_id, db, current_user)

    if doc.file_url.startswith("http"):
        # Cloudinary images can be previewed directly in browser
        return {"file_url": doc.file_url}

    if os.path.exists(doc.file_url):
        mime_type, _ = mimetypes.guess_type(doc.file_url)
        if not mime_type:
            mime_type = "application/octet-stream"

        headers = {}
        # PDFs should open in iframe
        if mime_type == "application/pdf":
            headers["Content-Disposition"] = f'inline; filename="{doc.title}"'

        return FileResponse(
            path=doc.file_url,
            media_type=mime_type,
            filename=doc.title,
            headers=headers
        )

    raise HTTPException(status_code=404, detail="File not found")

