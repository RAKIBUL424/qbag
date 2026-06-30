from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.dependencies import get_db

from app.controllers.controllers import register, login,is_authenticated
from app.schemas.schemas import UserSchema, UserResponseSchema, UserLoginSchema
from fastapi import status






router = APIRouter(prefix='/user', tags=['User'])

@router.post('/registar', response_model=UserResponseSchema,status_code=status.HTTP_201_CREATED)
async def registar(body: UserSchema, db: Session = Depends(get_db)):
    return register(body, db)

@router.post('/login', status_code=status.HTTP_200_OK)
async def login_user(body: UserLoginSchema, db: Session = Depends(get_db)):
    return login(body, db)

@router.get('/is_auth', status_code=status.HTTP_200_OK, response_model=UserResponseSchema)
async def is_auth(request: Request, db: Session = Depends(get_db)):
    return is_authenticated(request, db)