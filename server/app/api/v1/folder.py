from fastapi import APIRouter, status, Depends, Response, Request
from app.schemas.folder import FolderBody,Doc, AddDocResponse, MoveDoc, FolderDocsBody,FolderResponse
from app.schemas.document import DocumentResponse
from app.services.folder_service import create_folder,add_doc_in_folder,move_doc_to_folder,get_folder_contents,get_folder_docs
from app.db.getdb import get_db
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_current_user
from typing import List, Optional, Union

router = APIRouter(prefix="/folder", tags=["Folder"])


@router.post('/create', status_code=status.HTTP_201_CREATED)
def create(folder_in: FolderBody, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return create_folder(folder_in, db,current_user)

@router.post('/add-doc', status_code=status.HTTP_200_OK,response_model=AddDocResponse)
def add_doc(doc: Doc, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return add_doc_in_folder(doc, db,current_user)

@router.post('/move-doc', status_code=status.HTTP_200_OK,response_model=AddDocResponse)
def move_dov(doc: MoveDoc, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return move_doc_to_folder(doc, db,current_user)


@router.get("/get", response_model=List[Union[FolderResponse, DocumentResponse]])
def read_contents(
    folder_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contents = get_folder_contents(db, current_user, folder_id)
    return contents

@router.post('/folder-docs', status_code=status.HTTP_200_OK,response_model=list[DocumentResponse])
def get_docs(folder_id:FolderDocsBody,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return get_folder_docs(folder_id.folder_id,db,current_user)

