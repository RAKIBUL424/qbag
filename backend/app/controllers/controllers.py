
from fastapi import HTTPException, status, Request, Depends
from sqlalchemy.orm import Session
from app.models.models import UserModel

from app.dependencies import get_db

from app.schemas.schemas import UserSchema, UserLoginSchema

from pwdlib import PasswordHash
password_hash = PasswordHash.recommended()
from jose import JWTError, jwt
from datetime import datetime, timedelta, UTC


SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30




def get_password_hash(password):
    return password_hash.hash(password)

def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def register(body: UserSchema , db: Session):

    is_user = db.query(UserModel).filter(UserModel.username == body.username).first()
    is_email = db.query(UserModel).filter(UserModel.email == body.email).first()

    if is_user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Unsername already exists...!")
    
    if is_email:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Email already exists....!")
    
    hashed_password = get_password_hash(body.password)

    new_user = UserModel(
        username = body.username,
        hased_password = hashed_password,
        email = body.email,
        mobile = body.mobile
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    


    return new_user

def login(body: UserLoginSchema, db: Session):
    
    user = db.query(UserModel).filter(UserModel.username == body.username).first()
    
    
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Unauthorized access....!")
    
    password = verify_password(body.password, user.hased_password)

    if not password:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,detail="Unauthorized access....!")
    

    exp_time = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    

    token = jwt.encode({"sub":user.username, "exp_time": int(exp_time.timestamp())}, SECRET_KEY, ALGORITHM)
    
    print(token)

    return {"token": token}


def is_authenticated(request: Request, db: Session=Depends(get_db)):
    token = request.headers.get("authorization")
    token = token.split(" ")[-1]

    print(token)
    

    data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    username = data.get("sub")
    exp_time = data.get("exp_time")

    current_time = datetime.now().timestamp()


    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )

    if current_time > exp_time:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="unauthorized...!")
    
    user = db.query(UserModel).filter(UserModel.username == username).first()

    if not username:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Unauthorized...!")
    

    return user


# def is_auth(request: Request, db: Session = Depends(get_db)):

    

#     token = request.headers.get("authorization")
    
#     if not token:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Missing authorization header"
#         )
    
#     token = token.split(" ")[-1]
    

#     data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

#     username = data.get("sub")
#     exp_time = data.get("exp_time")

#     current_time = datetime.now().timestamp()


    

#     if current_time > exp_time:
#         raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="unauthorized...!")
    
#     user = db.query(UserModel).filter(UserModel.username == username).first()

#     if not username:
#         raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Unauthorized...!")
    

#     return user