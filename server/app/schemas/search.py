from pydantic import BaseModel

class AnswerBody(BaseModel):
    question: str
    answer: str
    
class QuizBody(BaseModel):
    difficulty:str
    topic:str
    numQuestions:int
