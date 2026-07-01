# app/routers/admin_routes.py
import os
import uuid
import json
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.models import (
    Question, QuestionImage, UserModel, 
    CoinTransaction, UserCoinPackage, SearchPurchase, SearchResult
)
from app.dependencies import get_db
from app.schemas.schemas import UserSchema
from app.controllers.controllers import is_authenticated

# Use a secret, hard-to-guess prefix
ADMIN_SECRET = "x7k9m2p4q8w5v3n1"  # Change this to something random!
router = APIRouter(prefix=f"/{ADMIN_SECRET}/admin", tags=["admin"])

UPLOAD_FOLDER = "app/uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
BACKUP_FOLDER = "backups/"
os.makedirs(BACKUP_FOLDER, exist_ok=True)

# ==================== AUTHENTICATION ====================
def verify_admin(user: UserSchema):
    """Verify if user is admin - using hardcoded username check"""
    # You can change this to check email or specific user ID
    if user.username != "rakibul.rong":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== QUESTION MANAGEMENT ====================

@router.get("/questions")
async def get_all_questions(
    status: Optional[str] = Query(None),
    exam_type: Optional[str] = Query(None),
    university: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Get all questions with filters"""
    verify_admin(user)
    
    query = db.query(Question)
    
    if status:
        query = query.filter(Question.status == status)
    if exam_type:
        query = query.filter(Question.exam_type == exam_type)
    if university:
        query = query.filter(Question.university == university)
    if subject:
        query = query.filter(Question.subject == subject)
    
    total = query.count()
    questions = query.order_by(desc(Question.id)).offset(offset).limit(limit).all()
    
    # Format response
    result = []
    for q in questions:
        result.append({
            "id": q.id,
            "university": q.university,
            "subject": q.subject,
            "course": q.course,
            "year": q.year,
            "semester": q.semester,
            "exam_type": q.exam_type,
            "status": q.status,
            "images": [
                {
                    "id": img.id,
                    "file_name": img.file_name,
                    "file_path": img.file_path
                } for img in q.images
            ],
            "created_at": q.created_at.isoformat() if hasattr(q, 'created_at') else None
        })
    
    return {
        "total": total,
        "questions": result,
        "limit": limit,
        "offset": offset
    }

@router.get("/questions/pending")
async def get_pending_questions(
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Get all pending questions for approval"""
    verify_admin(user)
    
    questions = db.query(Question).filter(Question.status == "pending").all()
    
    result = []
    for q in questions:
        result.append({
            "id": q.id,
            "university": q.university,
            "subject": q.subject,
            "course": q.course,
            "year": q.year,
            "semester": q.semester,
            "exam_type": q.exam_type,
            "images": [
                {
                    "id": img.id,
                    "file_name": img.file_name,
                    "file_path": img.file_path
                } for img in q.images
            ]
        })
    
    return {
        "total": len(result),
        "questions": result
    }

@router.post("/questions/{question_id}/approve")
async def approve_question(
    question_id: int,
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Approve a pending question"""
    verify_admin(user)
    
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if question.status != "pending":
        raise HTTPException(status_code=400, detail="Question is not pending")
    
    question.status = "approved"
    db.commit()
    
    return {"message": "Question approved successfully", "question_id": question_id}

@router.post("/questions/{question_id}/reject")
async def reject_question(
    question_id: int,
    reason: dict,
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Reject a pending question"""
    verify_admin(user)
    
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if question.status != "pending":
        raise HTTPException(status_code=400, detail="Question is not pending")
    
    question.status = "rejected"
    db.commit()
    
    return {
        "message": "Question rejected successfully",
        "question_id": question_id,
        "reason": reason.get("reason", "No reason provided")
    }

@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Delete a question permanently"""
    verify_admin(user)
    
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Delete images from filesystem
    for image in question.images:
        if os.path.exists(image.file_path):
            os.remove(image.file_path)
        db.delete(image)
    
    db.delete(question)
    db.commit()
    
    return {"message": "Question deleted successfully"}

# ==================== BULK UPLOAD ====================

@router.post("/bulk-upload")
async def bulk_upload_questions(
    files: List[UploadFile] = File(...),
    auto_approve: bool = Form(False),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """
    Bulk upload questions from images.
    Expected filename format: university_subject_course_year_semester_examtype_number.extension
    Example: DU_Physics_Phy101_2023_1_Final_1.png
    """
    verify_admin(user)
    
    results = []
    
    for file in files:
        try:
            # Parse filename without extension
            name_without_ext = os.path.splitext(file.filename)[0]
            parts = name_without_ext.split('_')
            
            # Validate format: university_subject_course_year_semester_examtype_number
            if len(parts) < 7:
                results.append({
                    "file": file.filename,
                    "status": "error",
                    "message": "Invalid format. Expected: university_subject_course_year_semester_examtype_number"
                })
                continue
            
            # Extract parts (from the end)
            question_number = parts.pop()
            exam_type = parts.pop()
            semester = parts.pop()
            year = parts.pop()
            course = parts.pop()
            subject = parts.pop()
            university = '_'.join(parts)  # Rest is university (may have underscores)
            
            # Create question
            new_question = Question(
                university=university,
                subject=subject,
                course=course,
                year=int(year) if year.isdigit() else 0,
                semester=semester,
                exam_type=exam_type,
                status="approved" if auto_approve else "pending"
            )
            db.add(new_question)
            db.flush()  # Get ID without committing
            
            # Save file
            _, ext = os.path.splitext(file.filename)
            unique_name = f"{new_question.id}_{uuid.uuid4().hex[:8]}{ext}"
            file_path = os.path.join(UPLOAD_FOLDER, unique_name)
            
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())
            
            # Create image record
            image = QuestionImage(
                question_id=new_question.id,
                file_name=unique_name,
                file_path=file_path
            )
            db.add(image)
            
            results.append({
                "file": file.filename,
                "status": "success",
                "question_id": new_question.id,
                "parsed_data": {
                    "university": university,
                    "subject": subject,
                    "course": course,
                    "year": year,
                    "semester": semester,
                    "exam_type": exam_type,
                    "question_number": question_number
                }
            })
            
        except Exception as e:
            results.append({
                "file": file.filename,
                "status": "error",
                "message": str(e)
            })
    
    db.commit()
    
    return {
        "total": len(files),
        "successful": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "error"]),
        "results": results
    }

# ==================== USER MANAGEMENT ====================

@router.get("/users")
async def get_all_users(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Get all users"""
    verify_admin(user)
    
    total = db.query(UserModel).count()
    users = db.query(UserModel).order_by(desc(UserModel.id)).offset(offset).limit(limit).all()
    
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "mobile": u.mobile,
            "coins": u.coins,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    
    return {
        "total": total,
        "users": result,
        "limit": limit,
        "offset": offset
    }

@router.post("/users/{user_id}/add-coins")
async def add_coins_to_user(
    user_id: int,
    amount: int = Form(...),
    description: str = Form("Admin added coins"),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Add coins to a user"""
    verify_admin(user)
    
    target_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    target_user.coins += amount
    
    # Create transaction record
    transaction = CoinTransaction(
        user_id=user_id,
        amount=amount,
        transaction_type="admin_add",
        description=f"Admin added {amount} coins: {description}"
    )
    db.add(transaction)
    db.commit()
    
    return {
        "message": f"Added {amount} coins to user {target_user.username}",
        "new_balance": target_user.coins
    }

@router.post("/users/{user_id}/deduct-coins")
async def deduct_coins_from_user(
    user_id: int,
    amount: int = Form(...),
    description: str = Form("Admin deducted coins"),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Deduct coins from a user"""
    verify_admin(user)
    
    target_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user.coins < amount:
        raise HTTPException(status_code=400, detail="Insufficient coins")
    
    target_user.coins -= amount
    
    # Create transaction record
    transaction = CoinTransaction(
        user_id=user_id,
        amount=-amount,
        transaction_type="admin_deduct",
        description=f"Admin deducted {amount} coins: {description}"
    )
    db.add(transaction)
    db.commit()
    
    return {
        "message": f"Deducted {amount} coins from user {target_user.username}",
        "new_balance": target_user.coins
    }

# ==================== DASHBOARD STATS ====================

@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Get dashboard statistics"""
    verify_admin(user)
    
    total_users = db.query(UserModel).count()
    total_questions = db.query(Question).count()
    pending_questions = db.query(Question).filter(Question.status == "pending").count()
    approved_questions = db.query(Question).filter(Question.status == "approved").count()
    rejected_questions = db.query(Question).filter(Question.status == "rejected").count()
    
    total_purchases = db.query(SearchPurchase).count()
    active_purchases = db.query(SearchPurchase).filter(SearchPurchase.is_active == "active").count()
    
    total_coins = db.query(func.sum(UserModel.coins)).scalar() or 0
    total_coins_spent = db.query(func.sum(SearchPurchase.coins_spent)).scalar() or 0
    
    # Recent purchases
    recent_purchases = db.query(SearchPurchase).order_by(desc(SearchPurchase.purchase_date)).limit(10).all()
    
    return {
        "users": {
            "total": total_users
        },
        "questions": {
            "total": total_questions,
            "pending": pending_questions,
            "approved": approved_questions,
            "rejected": rejected_questions
        },
        "purchases": {
            "total": total_purchases,
            "active": active_purchases
        },
        "coins": {
            "total_available": total_coins,
            "total_spent": total_coins_spent
        },
        "recent_purchases": [
            {
                "id": p.id,
                "username": p.user.username if p.user else "Unknown",
                "subject": p.subject,
                "exam_type": p.exam_type,
                "coins_spent": p.coins_spent,
                "purchase_date": p.purchase_date.isoformat() if p.purchase_date else None
            } for p in recent_purchases
        ]
    }

# ==================== DATABASE BACKUP ====================

@router.get("/backup/list")
async def list_backups(
    user: UserSchema = Depends(is_authenticated)
):
    """List available backups"""
    verify_admin(user)
    
    backups = []
    if os.path.exists(BACKUP_FOLDER):
        for filename in os.listdir(BACKUP_FOLDER):
            if filename.endswith('.json') or filename.endswith('.zip'):
                file_path = os.path.join(BACKUP_FOLDER, filename)
                stat = os.stat(file_path)
                backups.append({
                    "filename": filename,
                    "size": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
    
    backups.sort(key=lambda x: x['created_at'], reverse=True)
    return {"backups": backups}

@router.post("/backup/create")
async def create_backup(
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Create a database backup"""
    verify_admin(user)
    
    # Collect all data
    users = db.query(UserModel).all()
    questions = db.query(Question).all()
    purchases = db.query(SearchPurchase).all()
    coin_transactions = db.query(CoinTransaction).all()
    coin_packages = db.query(UserCoinPackage).all()
    search_results = db.query(SearchResult).all()
    
    # Convert to dict
    backup_data = {
        "metadata": {
            "created_at": datetime.utcnow().isoformat(),
            "created_by": user.username,
            "version": "1.0"
        },
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "mobile": u.mobile,
                "coins": u.coins,
                "created_at": u.created_at.isoformat() if u.created_at else None
            } for u in users
        ],
        "questions": [
            {
                "id": q.id,
                "university": q.university,
                "subject": q.subject,
                "course": q.course,
                "year": q.year,
                "semester": q.semester,
                "exam_type": q.exam_type,
                "status": q.status,
                "images": [
                    {
                        "id": img.id,
                        "file_name": img.file_name,
                        "file_path": img.file_path
                    } for img in q.images
                ]
            } for q in questions
        ],
        "purchases": [
            {
                "id": p.id,
                "user_id": p.user_id,
                "university": p.university,
                "subject": p.subject,
                "course": p.course,
                "year": p.year,
                "semester": p.semester,
                "exam_type": p.exam_type,
                "total_questions": p.total_questions,
                "coins_spent": p.coins_spent,
                "purchase_date": p.purchase_date.isoformat() if p.purchase_date else None,
                "expiry_date": p.expiry_date.isoformat() if p.expiry_date else None,
                "is_active": p.is_active
            } for p in purchases
        ],
        "coin_transactions": [
            {
                "id": c.id,
                "user_id": c.user_id,
                "amount": c.amount,
                "transaction_type": c.transaction_type,
                "description": c.description,
                "created_at": c.created_at.isoformat() if c.created_at else None
            } for c in coin_transactions
        ],
        "coin_packages": [
            {
                "id": cp.id,
                "user_id": cp.user_id,
                "package_amount": cp.package_amount,
                "coins_received": cp.coins_received,
                "coins_remaining": cp.coins_remaining,
                "purchase_date": cp.purchase_date.isoformat() if cp.purchase_date else None,
                "expiry_date": cp.expiry_date.isoformat() if cp.expiry_date else None,
                "is_active": cp.is_active
            } for cp in coin_packages
        ],
        "search_results": [
            {
                "id": sr.id,
                "purchase_id": sr.purchase_id,
                "question_id": sr.question_id
            } for sr in search_results
        ],
        "stats": {
            "total_users": len(users),
            "total_questions": len(questions),
            "total_purchases": len(purchases)
        }
    }
    
    # Save backup
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_{timestamp}.json"
    file_path = os.path.join(BACKUP_FOLDER, filename)
    
    with open(file_path, "w") as f:
        json.dump(backup_data, f, indent=2, default=str)
    
    return {
        "message": "Backup created successfully",
        "filename": filename,
        "size": os.path.getsize(file_path)
    }

@router.get("/backup/download/{filename}")
async def download_backup(
    filename: str,
    user: UserSchema = Depends(is_authenticated)
):
    """Download a backup file"""
    verify_admin(user)
    
    file_path = os.path.join(BACKUP_FOLDER, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup file not found")
    
    return FileResponse(
        file_path,
        media_type="application/json",
        filename=filename
    )

@router.delete("/backup/{filename}")
async def delete_backup(
    filename: str,
    user: UserSchema = Depends(is_authenticated)
):
    """Delete a backup file"""
    verify_admin(user)
    
    file_path = os.path.join(BACKUP_FOLDER, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup file not found")
    
    os.remove(file_path)
    return {"message": "Backup deleted successfully"}