from pydantic import BaseModel



class UserSchema(BaseModel):
    username: str
    password: str
    email: str
    mobile: str

class UserResponseSchema(BaseModel):
    id: int
    username: str
    email: str
    mobile: str

class UserLoginSchema(BaseModel):
    username: str
    password: str