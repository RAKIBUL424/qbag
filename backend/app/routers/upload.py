import os
import uuid

from fastapi import APIRouter, UploadFile, File, Form
from fastapi import Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List

from app.models.models import Question, QuestionImage, UserModel
from app.dependencies import get_db
from app.schemas.schemas import UserSchema
from app.controllers.controllers import is_authenticated


router = APIRouter()

UPLOAD_FOLDER = "app/uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload_file/")
async def upload_file(
    university: str = Form(...),
    subject: str = Form(...),
    course: str = Form(...),
    year: str = Form(...),
    semester: str = Form(...),
    exam_type: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):

    # create question first
    
    new_question = Question(
        university=university,
        subject=subject,
        course = course,
        year=int(year),
        semester=semester,
        exam_type=exam_type,
        status="pending",
        uploaded_by = user.id
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    

    image_list = []

    for file in files:

        _, ext = os.path.splitext(file.filename)

        unique_name = (
            f"{new_question.id}_"
            f"{uuid.uuid4().hex[:8]}"
            f"{ext}"
        )

        file_path = os.path.join(
            UPLOAD_FOLDER,
            unique_name
        )

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        image = QuestionImage(
            question_id=new_question.id,
            file_name=unique_name,
            file_path=file_path
        )

        db.add(image)

        image_list.append(unique_name)

    db.commit()

    return JSONResponse(
        content={
            "message": "Files uploaded successfully",
            "question_id": new_question.id,
            "files": image_list
        }
    )