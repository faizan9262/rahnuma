from app.models.folder import Folder
from fastapi import HTTPException,status,Depends
from app.schemas.folder import FolderBody, Doc, MoveDoc, FolderDocsBody
from app.db.getdb import get_db
from sqlalchemy.orm import Session,joinedload
from app.models.user import User
from app.core.security import get_current_user
from app.models.document import Document
from typing import Optional

def create_folder(folder_in: FolderBody, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    if folder_in.parent_folder_id:
        parent_folder = db.query(Folder).filter(
            Folder.id == folder_in.parent_folder_id,
            Folder.user_id == current_user.id
        ).first()
        if not parent_folder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent folder not found or does not belong to the user."
            )
    
    folder = Folder(name=folder_in.name,user_id=current_user.id,parent_folder_id=folder_in.parent_folder_id)
    
    db.add(folder)
    db.commit()
    db.refresh(folder)
    
    return folder

def add_doc_in_folder(doc:Doc,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    
    folder = db.query(Folder).filter(Folder.id == doc.folder_id).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder Not Found"
        )
    
    document = db.query(Document).filter(Document.id == doc.doc_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document Not Found"
        )
        
    if folder.user_id != document.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add document to folder"
        )

    document.folder_id = folder.id
    db.commit()
    db.refresh(document)
    
    return document

def move_doc_to_folder(doc: MoveDoc, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    target_folder = db.query(Folder).filter(Folder.id == doc.target_folder_id).first()
    
    if not target_folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder Not Found"
        )
    
    document = db.query(Document).filter(Document.id == doc.doc_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document Not Found"
        )
        
    if target_folder.user_id != document.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add document to folder"
        )
    
    document.folder_id = target_folder.id
    db.commit()
    db.refresh(document)
    
    return document


def get_folder_contents(db: Session, current_user: User, folder_id: Optional[int] = None):

    subfolders_query = db.query(Folder).filter(Folder.user_id == current_user.id)
    if folder_id is None:
        subfolders_query = subfolders_query.filter(Folder.parent_folder_id.is_(None))
    else:
        subfolders_query = subfolders_query.filter(Folder.parent_folder_id == folder_id)
    
    subfolders = subfolders_query.order_by(Folder.name).all()

    documents_query = db.query(Document).filter(Document.user_id == current_user.id)
    if folder_id is None:
        documents_query = documents_query.filter(Document.folder_id.is_(None))
    else:
        documents_query = documents_query.filter(Document.folder_id == folder_id)
        
    documents = documents_query.order_by(Document.title).all()
    return subfolders + documents

def get_folder_docs(folder_id: int, db: Session, current_user: User):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder does not exist"
        )

    docs = db.query(Document).filter(Document.folder_id == folder_id,
                                     Document.user_id == current_user.id).all()
    
    return docs
