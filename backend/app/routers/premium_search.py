


# # app/routers/premium_search.py
# from typing import Optional
# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# from datetime import datetime

# from app.dependencies import get_db
# from app.controllers.controllers import is_authenticated
# from app.schemas.schemas import UserSchema
# from app.services.coin_service import CoinService
# from app.config.coin_config import RECHARGE_PACKAGES

# router = APIRouter(prefix="/premium", tags=["premium"])

# @router.get("/coins/balance")
# async def get_coin_balance(
#     db: Session = Depends(get_db),
#     user: UserSchema = Depends(is_authenticated)
# ):
#     """Get current user's coin balance"""
#     balance = CoinService.get_user_coins(db, user.id)
#     return {"coins": balance}

# @router.post("/coins/recharge")
# async def recharge_coins(
#     amount_taka: int,
#     db: Session = Depends(get_db),
#     user: UserSchema = Depends(is_authenticated)
# ):
#     """Recharge coins"""
#     if amount_taka not in RECHARGE_PACKAGES:
#         raise HTTPException(status_code=400, detail="Invalid recharge amount")
    
#     coins = RECHARGE_PACKAGES[amount_taka]
#     result = CoinService.recharge_coins(db, user.id, amount_taka, coins)
#     return result

# @router.post("/search")
# async def premium_search(
#     university: str = Query(..., min_length=1),
#     subject: str = Query(..., min_length=1),
#     course: Optional[str] = Query(None),
#     year: Optional[int] = Query(None, ge=1900, le=2100),
#     semester: Optional[str] = Query(None),
#     exam_type: Optional[str] = Query(None),
#     db: Session = Depends(get_db),
#     user: UserSchema = Depends(is_authenticated)
# ):
#     """
#     Perform a premium search
#     Only university and subject are required. All other fields are optional.
#     """
#     try:
#         result = CoinService.process_premium_search(
#             db, user.id, university, subject, course, year, semester, exam_type
#         )
        
#         return {
#             "message": "Search completed successfully",
#             "total_questions": len(result["questions"]),
#             "coins_spent": result["total_price"],
#             "remaining_coins": result["remaining_coins"],
#             "purchase_id": result["purchase_id"],
#             "expiry_date": result["expiry_date"],
#             "questions": result["questions"]
#         }
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# @router.get("/purchases")
# async def get_purchases(
#     db: Session = Depends(get_db),
#     user: UserSchema = Depends(is_authenticated)
# ):
#     """Get all premium search purchases for the user"""
#     purchases = CoinService.get_user_purchases(db, user.id)
#     return {"purchases": purchases}

# @router.get("/purchases/{purchase_id}")
# async def get_purchase_questions(
#     purchase_id: int,
#     db: Session = Depends(get_db),
#     user: UserSchema = Depends(is_authenticated)
# ):
#     """Get the questions from a specific purchase with all images"""
#     result = CoinService.get_purchased_questions(db, user.id, purchase_id)
    
#     return {
#         "purchase": result["purchase"],
#         "questions": result["questions"]
#     }

# app/routers/premium_search.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.dependencies import get_db
from app.controllers.controllers import is_authenticated
from app.schemas.schemas import UserSchema
from app.services.coin_service import CoinService
from app.services.expiration_service import ExpirationService
from app.config.coin_config import RECHARGE_PACKAGES

router = APIRouter(prefix="/premium", tags=["premium"])


@router.get("/coins/balance")
async def get_coin_balance(
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Get current user's coin balance with breakdown"""
    return CoinService.get_user_coins(db, user.id)


@router.post("/coins/recharge")
async def recharge_coins(
    amount_taka: int,
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Recharge coins with expiration"""
    if amount_taka not in RECHARGE_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid recharge amount")
    
    coins = RECHARGE_PACKAGES[amount_taka]
    result = CoinService.recharge_coins(db, user.id, amount_taka, coins)
    return result


@router.post("/search")
async def premium_search(
    background_tasks: BackgroundTasks,
    university: str = Query(..., min_length=1),
    subject: str = Query(..., min_length=1),
    course: Optional[str] = Query(None),
    year: Optional[int] = Query(None, ge=1900, le=2100),
    semester: Optional[str] = Query(None),
    exam_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Perform a premium search with coin deduction"""
    try:
        result = CoinService.process_premium_search(
            db, user.id, university, subject, background_tasks,
            course, year, semester, exam_type
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/purchases")
async def get_purchases(
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Get all premium search purchases for the user"""
    purchases = CoinService.get_user_purchases(db, user.id)
    return {"purchases": purchases}


@router.get("/purchases/{purchase_id}")
async def get_purchase_questions(
    purchase_id: int,
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Get the questions from a specific purchase"""
    result = CoinService.get_purchased_questions(db, user.id, purchase_id)
    return result


@router.post("/coins/check-expiry")
async def check_expiry(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """Manually trigger expiry check"""
    # Run in background to not block the request
    background_tasks.add_task(ExpirationService.run_expiration_check, db, background_tasks)
    return {"message": "Expiry check scheduled"}