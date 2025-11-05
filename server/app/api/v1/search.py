from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.db.getdb import get_db
from app.models.user import User
from app.services.search_service import search_in_doc,get_quiz,answer_check
from app.core.security import get_current_user
from app.schemas.search import AnswerBody, QuizBody

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("/{doc_id}")
def search_doc(
    doc_id: int,
    body: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = body.get("query")
    context_history = body.get("context", []) 

    if not query:
        return {"error": "Missing 'query' in body"}

    results = search_in_doc(
        query=query,
        doc_id=doc_id,
        user_id=current_user.id,
        conversation=context_history
    )

    return {
        "query": query,
        "doc_id": doc_id,
        "results": results
    }


@router.post('/quiz-chunk/{doc_id}')
async def quize_chunk(doc_id:int,body:QuizBody):
    return await get_quiz(doc_id,difficulty=body.difficulty,topic=body.topic,numQuestions=body.numQuestions)


@router.post("/check/{doc_id}")
def check(
    doc_id: int,  
    body: AnswerBody,  
    current_user: User = Depends(get_current_user)
):
    return answer_check(
        body.question,
        body.answer,
        current_user.id,
        doc_id
    )