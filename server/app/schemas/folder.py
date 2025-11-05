from pydantic import BaseModel
from typing import Optional,List
from datetime import datetime

class FolderBody(BaseModel):
    name: str
    parent_folder_id: Optional[int] = None
    
class Doc(BaseModel):
    doc_id: int
    folder_id: int
    
class MoveDoc(BaseModel):
    doc_id: int
    target_folder_id: int


class AddDocResponse(BaseModel):
    id: int
    folder_id: Optional[int]
    user_id: int
    title: str
    file_url: str
    file_type: str
    uploaded_at: datetime
    status: str

    class Config:
        orm_mode = True
        
class FolderDocsBody(BaseModel):
    folder_id:int
    
    

class FolderResponse(BaseModel):
    id: int
    name: str
    parent_folder_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: int

    type: str = "folder"  # Discriminator for frontend

    # Pydantic v2 config
    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True
    }