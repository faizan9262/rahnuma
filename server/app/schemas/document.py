from pydantic import BaseModel
from typing import List,Optional

class UploadBody(BaseModel):
    parent_folder_id:int

class Option(BaseModel):
    text: str
    correct: bool

class QuizQuestion(BaseModel):
    question: str
    options: List[Option]

class DocumentResponse(BaseModel):
    id: int
    title: str
    file_url: str
    file_type: str
    key_topics_json: List[str]
    status: str
    quiz: Optional[List[QuizQuestion]]
    folder_id:int | None

    model_config = {
        "from_attributes": True
    }
