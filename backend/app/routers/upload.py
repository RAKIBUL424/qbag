# import os
# import uuid

# from fastapi import APIRouter, UploadFile, File, Form
# from fastapi import Depends
# from fastapi.responses import JSONResponse
# from sqlalchemy.orm import Session
# from typing import List

# from app.models.models import Question, QuestionImage, UserModel
# from app.dependencies import get_db
# from app.schemas.schemas import UserSchema
# from app.controllers.controllers import is_authenticated


# router = APIRouter()

# UPLOAD_FOLDER = "app/uploads/"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# @router.post("/upload_file/")
# async def upload_file(
#     university: str = Form(...),
#     subject: str = Form(...),
#     course: str = Form(...),
#     year: str = Form(...),
#     semester: str = Form(...),
#     exam_type: str = Form(...),
#     files: List[UploadFile] = File(...),
#     db: Session = Depends(get_db),
#     user: UserSchema = Depends(is_authenticated)
# ):

#     # create question first

    
#     new_question = Question(
#         university=university,
#         subject=subject,
#         course = course,
#         year=int(year),
#         semester=semester,
#         exam_type=exam_type,
#         status="pending",
#         uploaded_by = user.id
#     )

#     db.add(new_question)
#     db.commit()
#     db.refresh(new_question)

    

#     image_list = []

#     for file in files:

#         _, ext = os.path.splitext(file.filename)

#         # unique_name = (
#         #     f"{new_question.id}_"
#         #     f"{uuid.uuid4().hex[:8]}"
#         #     f"{ext}"
#         # )

#         unique_name = (
#             f"{new_question.id}_"
#             f"{university}_{subject}_{course}_{year}_{semester}_{exam_type}_{uuid.uuid4().hex[:3]}_"
#             f"{ext}"
#         )

#         file_path = os.path.join(
#             UPLOAD_FOLDER,
#             unique_name
#         )

#         with open(file_path, "wb") as buffer:
#             buffer.write(await file.read())

#         image = QuestionImage(
#             question_id=new_question.id,
#             file_name=unique_name,
#             file_path=file_path
#         )

#         db.add(image)

#         image_list.append(unique_name)

#     db.commit()

#     return JSONResponse(
#         content={
#             "message": "Files uploaded successfully",
#             "question_id": new_question.id,
#             "files": image_list
#         }
#     )


import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi import Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.models.models import Question, QuestionImage, UserModel
from app.dependencies import get_db
from app.schemas.schemas import UserSchema
from app.controllers.controllers import is_authenticated

router = APIRouter()

UPLOAD_FOLDER = "app/uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def check_duplicate_question(db: Session, university: str, subject: str, course: str, year: int, semester: str, exam_type: str):
    """Check if a question with the same details already exists"""
    existing_question = db.query(Question).filter(
        Question.university == university,
        Question.subject == subject,
        Question.course == course,
        Question.year == year,
        Question.semester == semester,
        Question.exam_type == exam_type
    ).first()
    return existing_question


@router.post("/upload_file/")
async def upload_file(
    university: str = Form(...),
    subject: str = Form(...),
    course: str = Form(...),
    year: int = Form(...),
    semester: str = Form(...),
    exam_type: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    # Validate year
    try:
        year_int = int(year)
    except ValueError:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": "Invalid year format. Please provide a valid year."
            }
        )
    
    # Check if question already exists
    existing_question = check_duplicate_question(
        db, university, subject, course, year_int, semester, exam_type
    )
    
    if existing_question:
        return JSONResponse(
            status_code=409,  # Conflict
            content={
                "status": "duplicate",
                "message": "A question with these exact details already exists in the database.",
                "question_id": existing_question.id,
                "existing_question": {
                    "university": existing_question.university,
                    "subject": existing_question.subject,
                    "course": existing_question.course,
                    "year": existing_question.year,
                    "semester": existing_question.semester,
                    "exam_type": existing_question.exam_type,
                    "status": existing_question.status,
                    "uploaded_at": existing_question.uploaded_at.isoformat() if existing_question.uploaded_at else None,
                    "uploaded_by": existing_question.uploaded_by
                }
            }
        )
    
    # Create new question
    new_question = Question(
        university=university,
        subject=subject,
        course=course,
        year=year_int,
        semester=semester,
        exam_type=exam_type,
        status="pending",
        uploaded_by=user.id
    )
    
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    image_list = []
    
    for file in files:
        _, ext = os.path.splitext(file.filename)
        
        unique_name = (
            f"{new_question.id}_"
            f"{university}_{subject}_{course}_{year}_{semester}_{exam_type}_{uuid.uuid4().hex[:3]}_"
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
        status_code=201,
        content={
            "status": "success",
            "message": "Files uploaded successfully",
            "question_id": new_question.id,
            "files": image_list,
            "uploaded_by": user.id
        }
    )