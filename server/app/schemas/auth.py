from pydantic import BaseModel,EmailStr

class RegisterUser(BaseModel):
    username:str
    email:EmailStr
    password:str
    
class LoginUser(BaseModel):
    email:EmailStr
    password:str    
    
class UserResponse(BaseModel):
    id:int
    email:EmailStr
    username:str
    profile_picture:str | None
    
    model_config = {
        "from_attributes": True 
    }
    
class RegisterLoginResponse(BaseModel):
    user:UserResponse
    message:str
    
