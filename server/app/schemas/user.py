from pydantic import BaseModel

class UpdateUsername(BaseModel):
    username:str