from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Path
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import distinct

from app.models.models import Question
from app.dependencies import get_db


router = APIRouter(prefix='/fetch', tags=['Fetch Data'])


#======>Free Question API for Free Users<=======
@router.get("/question")
async def get_question(
    university: str,
    subject: str,
    course: str,
    year: int,
    semester: str,
    exam_type: str,
    db: Session = Depends(get_db)
):
    question = (
        db.query(Question)
        .options(joinedload(Question.images))
        .filter(
            Question.university == university,
            Question.subject == subject,
            Question.course == course,
            Question.year == year,
            Question.semester == semester,
            Question.exam_type == exam_type,
            Question.status == "approved"
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    return {
        "question_id": question.id,
        "university": question.university,
        "subject": question.subject,
        "course": question.course,
        "year": question.year,
        "semester": question.semester,
        "exam_type": question.exam_type,
        "images": [
            {
                "image_id": image.id,
                "image_url": f"/uploads/{image.file_name}"
            }
            for image in question.images
        ]
    }


###For Paid API calls for Premium Users
###

# @router.get("/premium_question")
# async def get_premium_question(
#     university: Optional[str] = None,
#     subject: Optional[str] = None,
#     year: Optional[int] = None,
#     semester: Optional[str] = None,
#     exam_type: Optional[str] = None,
#     db: Session = Depends(get_db)
# ):
#     filters = [
#         Question.status == "approved",
#         # Question.is_premium == True  # Enable later with coin system
#     ]

#     if university:
#         filters.append(Question.university == university)

#     if subject:
#         filters.append(Question.subject == subject)

#     if year:
#         filters.append(Question.year == year)

#     if semester:
#         filters.append(Question.semester == semester)

#     if exam_type:
#         filters.append(Question.exam_type == exam_type)

#     questions = db.query(Question).filter(*filters).all()

#     if not questions:
#         raise HTTPException(
#             status_code=404,
#             detail="Premium question not found"
#         )

    

#     from pathlib import Path

#     return [
#     {
#         "id": q.id,
#         "university": q.university,
#         "subject": q.subject,
#         "year": q.year,
#         "semester": q.semester,
#         "exam_type": q.exam_type,
#         "image_url": f"/uploads/{Path(q.file_path).name}"
#     }
#     for q in questions
#     ]
#======>Premium Question API for Paid Users<=======
@router.get("/premium_question")
async def get_premium_question(
    university: Optional[str] = None,
    subject: Optional[str] = None,
    year: Optional[int] = None,
    semester: Optional[str] = None,
    exam_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    filters = [
        Question.status == "approved"
    ]

    if university:
        filters.append(
            Question.university == university
        )

    if subject:
        filters.append(
            Question.subject == subject
        )

    if year:
        filters.append(
            Question.year == year
        )

    if semester:
        filters.append(
            Question.semester == semester
        )

    if exam_type:
        filters.append(
            Question.exam_type == exam_type
        )

    questions = (
        db.query(Question)
        .options(joinedload(Question.images))
        .filter(*filters)
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    result = []

    for q in questions:
        for image in q.images:
            result.append(
                {
                    "question_id": q.id,
                    "image_id": image.id,
                    "university": q.university,
                    "subject": q.subject,
                    "year": q.year,
                    "semester": q.semester,
                    "exam_type": q.exam_type,
                    "image_url": f"/uploads/{image.file_name}"
                }
            )

    return result

##===================================>
@router.get("/upload/universities")
async def get_universities(db: Session = Depends(get_db)):
    universities = db.query(distinct(Question.university)).order_by(Question.university).all()
    return [u[0] for u in universities]

@router.get("/upload/subjects")
async def get_subjects(db: Session = Depends(get_db)):
    subjects = db.query(distinct(Question.subject)).order_by(Question.subject).all()
    return [s[0] for s in subjects]

@router.get('/upload/courses')
async def get_courses(db: Session = Depends(get_db)):
    courses = db.query(distinct(Question.course)).order_by(Question.course).all()
    return [c[0] for c in courses]

@router.get("/upload/semesters")
async def get_semesters(db: Session = Depends(get_db)):
    semesters = db.query(distinct(Question.semester)).order_by(Question.semester).all()
    return [s[0] for s in semesters]

@router.get("/upload/exam_types")
async def get_exam_types(db: Session = Depends(get_db)):
    exam_types = db.query(distinct(Question.exam_type)).order_by(Question.exam_type).all()
    return [e[0] for e in exam_types]

@router.get("/upload/years")
async def get_years(db: Session = Depends(get_db)):
    years = db.query(distinct(Question.year)).order_by(Question.year).all()
    return [y[0] for y in years]










###For the Frontend Data Fetching Uses


#-------->Premium
@router.get("/subjects/{university}")
async def get_subjects(
    university: str,
    db: Session = Depends(get_db)
):

    subjects = db.query(
        distinct(Question.subject)
    ).filter(
        Question.university == university
    ).order_by(
        Question.subject
    ).all()

    return [s[0] for s in subjects]





#------------------------------->>
















#------------------------------->

@router.get("/years/{university}/{subject}")
async def get_year(
    university: str,
    subject: str,
    db: Session = Depends(get_db)
):
    years = db.query(
        distinct(Question.year)
    ).filter(
        Question.university == university,
        Question.subject == subject,
        Question.status == "approved"
    ).order_by(
        Question.year
    ).all()

    return [y[0] for y in years]


@router.get("/semesters/{university}/{subject}")
async def get_semester(
    university: str,
    subject: str,
    db: Session = Depends(get_db)
):
    semesters = db.query(
        distinct(Question.semester)
    ).filter(
        Question.university == university,
        Question.subject == subject,
        Question.status == "approved"
    ).order_by(
        Question.semester
    ).all()

    return [s[0] for s in semesters]


@router.get("/exam_types/{university}/{subject}")
async def get_exam_type(
    university: str,
    subject: str,
    db: Session = Depends(get_db)
):
    exam_types = db.query(
        distinct(Question.exam_type)
    ).filter(
        Question.university == university,
        Question.subject == subject,
        Question.status == "approved"
    ).order_by(
        Question.exam_type
    ).all()

    return [e[0] for e in exam_types]

@router.get("/courses/{university}/{subject}")
async def get_courses(
    university: str,
    subject: str,
    db: Session = Depends(get_db)
):
    courses = db.query(
        distinct(Question.course)
    ).filter(
        Question.university == university,
        Question.subject == subject,
        Question.status == "approved"
    ).order_by(
        Question.course
    ).all()

    return [c[0] for c in courses]
#-------------------------------->


#-------------------------------->Freee

@router.get("/universities")
async def get_universities(
    db: Session = Depends(get_db)
):

    universities = db.query(
        distinct(Question.university)
    ).order_by(
        Question.university
    ).all()

    return [u[0] for u in universities]









@router.get("/courses/{university}/{subject}")
async def get_courses(
    university: str,
    subject: str,
    db: Session = Depends(get_db)
):
    courses = db.query(
        distinct(Question.course)
    ).filter(
        Question.university == university,
        Question.subject == subject,
        Question.status == "approved"
    ).order_by(
        Question.course
    ).all()

    return [c[0] for c in courses]


@router.get("/years/{university}/{subject}/{course}")
async def get_year(
    university: str,
    subject: str,
    course: str,
    db: Session = Depends(get_db)
):
    years = db.query(distinct(Question.year)).filter(
        Question.university == university,
        Question.subject == subject,
        Question.course == course
    ).order_by(
        Question.year
    ).all()
    print(years)
    

    return [y[0] for y in years]




@router.get("/semesters/{university}/{subject}/{course}/{year}")
async def get_semester(
    university: str,
    subject: str,
    course: str,
    year: int,
    db: Session = Depends(get_db)
):
    semesters = db.query(distinct(Question.semester)).filter(
        Question.university == university,
        Question.subject == subject,
        Question.course == course,
        Question.year == year
    ).order_by(
        Question.semester
    ).all()

    return [s[0] for s in semesters]

@router.get("/exam_types/{university}/{subject}/{course}/{year}/{semester}")
async def get_exam_type(
    university: str,
    subject: str,
    course: str,
    year: int,
    semester: str,
    db: Session = Depends(get_db)
):
    exam_types = db.query(distinct(Question.exam_type)).filter(
        Question.university == university,
        Question.subject == subject,
        Question.course == course,
        Question.year == year,
        Question.semester == semester
    ).order_by(
        Question.exam_type
    ).all()

    return [e[0] for e in exam_types]