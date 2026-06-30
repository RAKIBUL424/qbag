


# # app/services/coin_service.py
# from typing import Optional
# from sqlalchemy.orm import Session
# from datetime import datetime, timedelta
# from fastapi import HTTPException
# from app.models.models import UserModel, CoinTransaction, SearchPurchase, SearchResult, Question, QuestionImage
# from app.config.coin_config import EXAM_TYPE_PRICES, COIN_VALIDITY_DAYS, SEARCH_RESULT_VALIDITY_DAYS


# class CoinService:
    
#     @staticmethod
#     def get_user_coins(db: Session, user_id: int) -> int:
#         """Get user's current coin balance"""
#         user = db.query(UserModel).filter(UserModel.id == user_id).first()
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
#         return user.coins
    
#     @staticmethod
#     def recharge_coins(db: Session, user_id: int, amount_taka: int, coins: int):
#         """Recharge coins for a user"""
#         from app.config.coin_config import RECHARGE_PACKAGES
        
#         if amount_taka not in RECHARGE_PACKAGES or RECHARGE_PACKAGES[amount_taka] != coins:
#             raise HTTPException(status_code=400, detail="Invalid recharge package")
        
#         user = db.query(UserModel).filter(UserModel.id == user_id).first()
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         user.coins += coins
        
#         transaction = CoinTransaction(
#             user_id=user_id,
#             amount=coins,
#             transaction_type="recharge",
#             description=f"Recharged {coins} coins for {amount_taka} tk"
#         )
#         db.add(transaction)
#         db.commit()
        
#         return {"message": f"Successfully recharged {coins} coins", "new_balance": user.coins}
    
#     @staticmethod
#     def calculate_question_price(exam_type: str) -> int:
#         """Calculate price for a single question based on exam type"""
#         if not exam_type:
#             return EXAM_TYPE_PRICES.get("quiz", 1)
#         return EXAM_TYPE_PRICES.get(exam_type.lower(), 1)  # Default to 1 if not found
    
#     @staticmethod
#     def calculate_total_price(questions: list) -> int:
#         """
#         Calculate total price for a list of questions
#         Each question is priced based on its own exam_type
#         """
#         total = 0
#         for question in questions:
#             price = CoinService.calculate_question_price(question.exam_type)
#             total += price
#         return total
    
#     @staticmethod
#     def process_premium_search(
#         db: Session, 
#         user_id: int, 
#         university: str, 
#         subject: str,
#         course: Optional[str] = None, 
#         year: Optional[int] = None, 
#         semester: Optional[str] = None, 
#         exam_type: Optional[str] = None
#     ):
#         """
#         Process a premium search request with optional filters
#         """
#         # Build the query dynamically
#         query = db.query(Question).filter(
#             Question.university == university,
#             Question.subject == subject,
#             Question.status == "approved"
#         )
        
#         # Add optional filters
#         if course and course.strip():
#             query = query.filter(Question.course == course)
#         if year is not None:
#             query = query.filter(Question.year == year)
#         if semester and semester.strip():
#             query = query.filter(Question.semester == semester)
#         if exam_type and exam_type.strip():
#             query = query.filter(Question.exam_type == exam_type)
        
#         questions = query.all()
        
#         if not questions:
#             raise HTTPException(status_code=404, detail="No questions found for the given criteria")
        
#         # ✅ CORRECT: Calculate total price based on each question's exam type
#         if len(questions) > 1:
#             total_price = CoinService.calculate_total_price(questions)
#         else:
#             total_price = 0
        
#         # Check if user has enough coins
#         user = db.query(UserModel).filter(UserModel.id == user_id).first()
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         if user.coins < total_price:
#             raise HTTPException(
#                 status_code=402, 
#                 detail=f"Insufficient coins. Required: {total_price}, Available: {user.coins}"
#             )
        
#         # Deduct coins
#         user.coins -= total_price
        
#         # Create transaction record
#         transaction = CoinTransaction(
#             user_id=user_id,
#             amount=-total_price,
#             transaction_type="purchase",
#             description=f"Premium search: {university}, {subject} - {len(questions)} questions"
#         )
#         db.add(transaction)
        
#         # Create search purchase record
#         purchase = SearchPurchase(
#             user_id=user_id,
#             university=university,
#             subject=subject,
#             course=course or "",
#             year=year or 0,
#             semester=semester or "",
#             exam_type=exam_type or "",
#             total_questions=len(questions),
#             coins_spent=total_price,
#             expiry_date=datetime.now() + timedelta(days=SEARCH_RESULT_VALIDITY_DAYS),
#             is_active="active"
#         )
#         db.add(purchase)
#         db.flush()
        
#         # Store search results
#         for question in questions:
#             search_result = SearchResult(
#                 purchase_id=purchase.id,
#                 question_id=question.id
#             )
#             db.add(search_result)
        
#         db.commit()
        
#         # Format questions with image URLs
#         formatted_questions = []
#         for q in questions:
#             question_data = {
#                 "id": q.id,
#                 "university": q.university,
#                 "subject": q.subject,
#                 "course": q.course,
#                 "year": q.year,
#                 "semester": q.semester,
#                 "exam_type": q.exam_type,
#                 "price": CoinService.calculate_question_price(q.exam_type),  # Add price per question
#                 "images": [
#                     {
#                         "id": img.id,
#                         "file_name": img.file_name,
#                         "file_path": img.file_path,
#                         "url": f"/uploads/{img.file_name}"
#                     }
#                     for img in q.images
#                 ]
#             }
#             formatted_questions.append(question_data)
        
#         # Add breakdown to response
#         price_breakdown = {}
#         for q in questions:
#             exam = q.exam_type
#             if exam not in price_breakdown:
#                 price_breakdown[exam] = {
#                     "count": 0,
#                     "price_per_question": CoinService.calculate_question_price(exam),
#                     "subtotal": 0
#                 }
#             price_breakdown[exam]["count"] += 1
#             price_breakdown[exam]["subtotal"] += CoinService.calculate_question_price(exam)
        
#         return {
#             "questions": formatted_questions,
#             "total_price": total_price,
#             "price_breakdown": price_breakdown,  # Add breakdown for transparency
#             "purchase_id": purchase.id,
#             "expiry_date": purchase.expiry_date,
#             "remaining_coins": user.coins
#         }
    
#     @staticmethod
#     def get_user_purchases(db: Session, user_id: int):
#         """Get all purchases for a user with their status"""
#         purchases = db.query(SearchPurchase).filter(
#             SearchPurchase.user_id == user_id
#         ).order_by(SearchPurchase.purchase_date.desc()).all()
        
#         result = []
#         for purchase in purchases:
#             if purchase.is_active == "active" and datetime.now() > purchase.expiry_date:
#                 purchase.is_active = "expired"
#                 db.commit()
            
#             result.append({
#                 "id": purchase.id,
#                 "university": purchase.university,
#                 "subject": purchase.subject,
#                 "course": purchase.course,
#                 "year": purchase.year,
#                 "semester": purchase.semester,
#                 "exam_type": purchase.exam_type,
#                 "total_questions": purchase.total_questions,
#                 "coins_spent": purchase.coins_spent,
#                 "purchase_date": purchase.purchase_date,
#                 "expiry_date": purchase.expiry_date,
#                 "is_active": purchase.is_active,
#                 "time_remaining": (
#                     (purchase.expiry_date - datetime.now()).total_seconds() / 3600 / 24
#                 ) if purchase.is_active == "active" else 0
#             })
        
#         return result
    
#     @staticmethod
#     def get_purchased_questions(db: Session, user_id: int, purchase_id: int):
#         """Get the questions for a specific purchase with full details including images"""
#         purchase = db.query(SearchPurchase).filter(
#             SearchPurchase.id == purchase_id,
#             SearchPurchase.user_id == user_id
#         ).first()
        
#         if not purchase:
#             raise HTTPException(status_code=404, detail="Purchase not found")
        
#         if purchase.is_active == "expired":
#             raise HTTPException(status_code=403, detail="This purchase has expired")
        
#         if datetime.now() > purchase.expiry_date:
#             purchase.is_active = "expired"
#             db.commit()
#             raise HTTPException(status_code=403, detail="This purchase has expired")
        
#         questions = db.query(Question).join(
#             SearchResult, SearchResult.question_id == Question.id
#         ).filter(
#             SearchResult.purchase_id == purchase_id
#         ).all()
        
#         formatted_questions = []
#         for q in questions:
#             question_data = {
#                 "id": q.id,
#                 "university": q.university,
#                 "subject": q.subject,
#                 "course": q.course,
#                 "year": q.year,
#                 "semester": q.semester,
#                 "exam_type": q.exam_type,
#                 "price": CoinService.calculate_question_price(q.exam_type),  # Add price
#                 "images": [
#                     {
#                         "id": img.id,
#                         "file_name": img.file_name,
#                         "file_path": img.file_path,
#                         "url": f"/uploads/{img.file_name}"
#                     }
#                     for img in q.images
#                 ]
#             }
#             formatted_questions.append(question_data)
        
#         return {
#             "purchase": {
#                 "id": purchase.id,
#                 "university": purchase.university,
#                 "subject": purchase.subject,
#                 "course": purchase.course,
#                 "year": purchase.year,
#                 "semester": purchase.semester,
#                 "exam_type": purchase.exam_type,
#                 "total_questions": purchase.total_questions,
#                 "coins_spent": purchase.coins_spent,
#                 "purchase_date": purchase.purchase_date,
#                 "expiry_date": purchase.expiry_date,
#                 "is_active": purchase.is_active,
#                 "time_remaining": (purchase.expiry_date - datetime.now()).total_seconds() / 3600 / 24
#             },
#             "questions": formatted_questions
#         }


# app/services/coin_service.py
from typing import Optional, Dict
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from fastapi import HTTPException, BackgroundTasks
from app.models.models import UserModel, CoinTransaction, SearchPurchase, SearchResult, Question, UserCoinPackage
from app.config.coin_config import EXAM_TYPE_PRICES, COIN_VALIDITY_DAYS, SEARCH_RESULT_VALIDITY_DAYS
from app.services.expiration_service import ExpirationService
from app.services.ocr_service import OCRService
import logging

logger = logging.getLogger(__name__)


class CoinService:
    
    @staticmethod
    def get_user_coins(db: Session, user_id: int) -> Dict:
        """
        Get user's current coin balance with breakdown
        """
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get active coins from packages
        total_active_coins = ExpirationService.get_active_coins(db, user_id)
        breakdown = ExpirationService.get_coins_breakdown(db, user_id)
        
        return {
            "total_coins": total_active_coins,
            "breakdown": breakdown,
            "user_coins": user.coins  # This should match total_active_coins
        }
    
    @staticmethod
    def recharge_coins(
        db: Session, 
        user_id: int, 
        amount_taka: int, 
        coins: int,
        validity_days: int = COIN_VALIDITY_DAYS
    ):
        """Recharge coins for a user with expiration"""
        from app.config.coin_config import RECHARGE_PACKAGES
        
        if amount_taka not in RECHARGE_PACKAGES or RECHARGE_PACKAGES[amount_taka] != coins:
            raise HTTPException(status_code=400, detail="Invalid recharge package")
        
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate expiry date (30 days from now)
        expiry_date = datetime.now() + timedelta(days=validity_days)
        
        # Create coin package
        coin_package = UserCoinPackage(
            user_id=user_id,
            package_amount=amount_taka,
            coins_received=coins,
            coins_remaining=coins,
            expiry_date=expiry_date,
            is_active=True
        )
        db.add(coin_package)
        
        # Update user's total coins
        user.coins += coins
        
        # Create transaction record
        transaction = CoinTransaction(
            user_id=user_id,
            amount=coins,
            transaction_type="recharge",
            description=f"Recharged {coins} coins for {amount_taka} tk (expires {expiry_date.strftime('%Y-%m-%d')})"
        )
        db.add(transaction)
        db.commit()
        
        return {
            "message": f"Successfully recharged {coins} coins",
            "new_balance": user.coins,
            "expiry_date": expiry_date,
            "coins_remaining_in_package": coins
        }
    
    @staticmethod
    def calculate_question_price(exam_type: str) -> int:
        """Calculate price for a single question based on exam type"""
        if not exam_type:
            return EXAM_TYPE_PRICES.get("quiz", 1)
        return EXAM_TYPE_PRICES.get(exam_type.lower(), 1)
    
    @staticmethod
    def calculate_total_price(questions: list) -> int:
        """Calculate total price for a list of questions"""
        total = 0
        for question in questions:
            price = CoinService.calculate_question_price(question.exam_type)
            total += price
        return total
    
    @staticmethod
    def deduct_coins_from_packages(db: Session, user_id: int, amount: int):
        """
        Deduct coins from user's packages (FIFO - oldest first)
        """
        # Get active packages with remaining coins, ordered by expiry date
        packages = db.query(UserCoinPackage).filter(
            UserCoinPackage.user_id == user_id,
            UserCoinPackage.is_active == True,
            UserCoinPackage.expiry_date > datetime.now(),
            UserCoinPackage.coins_remaining > 0
        ).order_by(UserCoinPackage.expiry_date).all()
        
        if not packages:
            raise HTTPException(status_code=400, detail="No active coin packages available")
        
        remaining_to_deduct = amount
        packages_used = []
        
        for package in packages:
            if remaining_to_deduct <= 0:
                break
            
            deduct_amount = min(package.coins_remaining, remaining_to_deduct)
            package.coins_remaining -= deduct_amount
            remaining_to_deduct -= deduct_amount
            
            packages_used.append({
                "package_id": package.id,
                "deducted": deduct_amount,
                "remaining": package.coins_remaining,
                "expiry_date": package.expiry_date
            })
            
            # Mark package as inactive if no coins left
            if package.coins_remaining == 0:
                package.is_active = False
        
        if remaining_to_deduct > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient active coins. Short by {remaining_to_deduct} coins"
            )
        
        return packages_used
    
    @staticmethod
    def process_premium_search(
        db: Session, 
        user_id: int, 
        university: str, 
        subject: str,
        background_tasks: BackgroundTasks,
        course: Optional[str] = None, 
        year: Optional[int] = None, 
        semester: Optional[str] = None, 
        exam_type: Optional[str] = None
    ):
        """
        Process a premium search request with optional filters
        """
        # Build the query dynamically
        query = db.query(Question).filter(
            Question.university == university,
            Question.subject == subject,
            Question.status == "approved"
        )
        
        # Add optional filters
        if course and course.strip():
            query = query.filter(Question.course == course)
        if year is not None:
            query = query.filter(Question.year == year)
        if semester and semester.strip():
            query = query.filter(Question.semester == semester)
        if exam_type and exam_type.strip():
            query = query.filter(Question.exam_type == exam_type)
        
        questions = query.all()
        
        if not questions:
            raise HTTPException(status_code=404, detail="No questions found for the given criteria")
        
        # Calculate total price
        total_price = CoinService.calculate_total_price(questions)
        
        # Check if user has enough active coins
        user_coins = CoinService.get_user_coins(db, user_id)
        if user_coins["total_coins"] < total_price:
            raise HTTPException(
                status_code=402, 
                detail=f"Insufficient coins. Required: {total_price}, Available: {user_coins['total_coins']}"
            )
        
        # Deduct coins from packages (FIFO)
        packages_used = CoinService.deduct_coins_from_packages(db, user_id, total_price)
        
        # Update user's total coins
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        user.coins = ExpirationService.get_active_coins(db, user_id)
        
        # Create transaction record
        transaction = CoinTransaction(
            user_id=user_id,
            amount=-total_price,
            transaction_type="purchase",
            description=f"Premium search: {university}, {subject} - {len(questions)} questions"
        )
        db.add(transaction)
        
        # Create search purchase record (valid for 18 days)
        expiry_date = datetime.now() + timedelta(days=SEARCH_RESULT_VALIDITY_DAYS)
        purchase = SearchPurchase(
            user_id=user_id,
            university=university,
            subject=subject,
            course=course or "",
            year=year or 0,
            semester=semester or "",
            exam_type=exam_type or "",
            total_questions=len(questions),
            coins_spent=total_price,
            expiry_date=expiry_date,
            is_active="active"
        )
        db.add(purchase)
        db.flush()
        
        # Store search results
        for question in questions:
            search_result = SearchResult(
                purchase_id=purchase.id,
                question_id=question.id
            )
            db.add(search_result)
        
        db.commit()
        
        # Format questions with image URLs and prices
        formatted_questions = []
        for q in questions:
            question_data = {
                "id": q.id,
                "university": q.university,
                "subject": q.subject,
                "course": q.course,
                "year": q.year,
                "semester": q.semester,
                "exam_type": q.exam_type,
                "price": CoinService.calculate_question_price(q.exam_type),
                "images": [
                    {
                        "id": img.id,
                        "file_name": img.file_name,
                        "file_path": img.file_path,
                        "url": f"/uploads/{img.file_name}"
                    }
                    for img in q.images
                ]
            }
            formatted_questions.append(question_data)
        
        # Get updated coin breakdown
        updated_coins = CoinService.get_user_coins(db, user_id)
        
        return {
            "questions": formatted_questions,
            "total_price": total_price,
            "purchase_id": purchase.id,
            "expiry_date": expiry_date,
            "remaining_coins": updated_coins["total_coins"],
            "coins_breakdown": updated_coins["breakdown"],
            "packages_used": packages_used
        }
    
    @staticmethod
    def get_user_purchases(db: Session, user_id: int):
        """Get all purchases for a user with their status"""
        purchases = db.query(SearchPurchase).filter(
            SearchPurchase.user_id == user_id
        ).order_by(SearchPurchase.purchase_date.desc()).all()
        
        result = []
        for purchase in purchases:
            # Check if purchase is expired
            if purchase.is_active == "active" and datetime.now() > purchase.expiry_date:
                purchase.is_active = "expired"
                db.commit()
            
            time_remaining = 0
            if purchase.is_active == "active":
                time_remaining = max(0, (purchase.expiry_date - datetime.now()).total_seconds())
            
            result.append({
                "id": purchase.id,
                "university": purchase.university,
                "subject": purchase.subject,
                "course": purchase.course,
                "year": purchase.year,
                "semester": purchase.semester,
                "exam_type": purchase.exam_type,
                "total_questions": purchase.total_questions,
                "coins_spent": purchase.coins_spent,
                "purchase_date": purchase.purchase_date,
                "expiry_date": purchase.expiry_date,
                "is_active": purchase.is_active,
                "time_remaining_seconds": time_remaining,
                "time_remaining_days": time_remaining / 86400,  # 86400 seconds in a day
                "time_remaining_hours": time_remaining / 3600
            })
        
        return result
    
    @staticmethod
    def get_purchased_questions(db: Session, user_id: int, purchase_id: int):
        """Get the questions for a specific purchase with full details"""
        purchase = db.query(SearchPurchase).filter(
            SearchPurchase.id == purchase_id,
            SearchPurchase.user_id == user_id
        ).first()
        
        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase not found")
        
        if purchase.is_active == "expired":
            raise HTTPException(status_code=403, detail="This purchase has expired")
        
        if datetime.now() > purchase.expiry_date:
            purchase.is_active = "expired"
            db.commit()
            raise HTTPException(status_code=403, detail="This purchase has expired")
        
        questions = db.query(Question).join(
            SearchResult, SearchResult.question_id == Question.id
        ).filter(
            SearchResult.purchase_id == purchase_id
        ).all()
        
        formatted_questions = []
        for q in questions:
            question_data = {
                "id": q.id,
                "university": q.university,
                "subject": q.subject,
                "course": q.course,
                "year": q.year,
                "semester": q.semester,
                "exam_type": q.exam_type,
                "price": CoinService.calculate_question_price(q.exam_type),
                "images": [
                    {
                        "id": img.id,
                        "file_name": img.file_name,
                        "file_path": img.file_path,
                        "url": f"/uploads/{img.file_name}"
                    }
                    for img in q.images
                ]
            }
            formatted_questions.append(question_data)
        
        time_remaining = max(0, (purchase.expiry_date - datetime.now()).total_seconds())
        
        return {
            "purchase": {
                "id": purchase.id,
                "university": purchase.university,
                "subject": purchase.subject,
                "course": purchase.course,
                "year": purchase.year,
                "semester": purchase.semester,
                "exam_type": purchase.exam_type,
                "total_questions": purchase.total_questions,
                "coins_spent": purchase.coins_spent,
                "purchase_date": purchase.purchase_date,
                "expiry_date": purchase.expiry_date,
                "is_active": purchase.is_active,
                "time_remaining_seconds": time_remaining,
                "time_remaining_days": time_remaining / 86400,
                "time_remaining_hours": time_remaining / 3600
            },
            "questions": formatted_questions
        }
    
    OCR_COST = 3
    @staticmethod
    def process_ocr_request(
        db: Session,
        user_id: int,
        image_bytes: bytes
    ) -> dict:
        
        user_coins = CoinService.get_user_coins(db, user_id)

        if user_coins['total_coins'] < CoinService.OCR_COST:
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient coins. Required: {CoinService.OCR_COST},Available: {user_coins['total_coins']}"
            )
        
        packages_used = CoinService.deduct_coins_from_packages(db, user_id, CoinService.OCR_COST)

        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        user.coins = ExpirationService.get_active_coins(db, user_id)

        transation = CoinTransaction(
            user_id = user_id,
            amount = CoinService.OCR_COST,
            transaction_type = "purchase",
            description = f"OCR extraction - 1 request"
        )
        db.add(transation)
        db.commit()

        ocr_result = OCRService.extract_text_from_image(image_bytes)

        ocr_result.update({
            "coins_spent": CoinService.OCR_COST,
            "remaining_coins": user.coins,
            "packages_used": packages_used
        })

        return ocr_result




    # @staticmethod
    # def process_ocr_request(db: Session, user_id: int, image_bytes: bytes) -> Dict:
    #     """Process OCR request with coin deduction using EasyOCR"""
    
    # # Check if user has enough coins
    #     user_coins = CoinService.get_user_coins(db, user_id)
    
    #     if user_coins["total_coins"] < CoinService.OCR_COST:
    #         raise HTTPException(
    #             status_code=402,
    #             detail=f"Insufficient coins. Required: {CoinService.OCR_COST}, Available: {user_coins['total_coins']}"
    #         )
    
    # # Deduct coins from packages (FIFO)
    #     packages_used = CoinService.deduct_coins_from_packages(db, user_id, CoinService.OCR_COST)
    
    # # Update user's total coins
    #     user = db.query(UserModel).filter(UserModel.id == user_id).first()
    #     user.coins = ExpirationService.get_active_coins(db, user_id)
    
    # # Create transaction record
    #     transaction = CoinTransaction(
    #     user_id=user_id,
    #     amount=-CoinService.OCR_COST,
    #     transaction_type="purchase",
    #     description=f"OCR extraction - 1 request"
    # )
    #     db.add(transaction)
    #     db.commit()
    
    # # Perform OCR extraction using EasyOCR
    #     ocr_result = OCRService.extract_text_from_image(image_bytes)
    
    # # Add coin deduction info to result
    #     ocr_result.update({
    #     "coins_spent": CoinService.OCR_COST,
    #     "remaining_coins": user.coins,
    #     "packages_used": packages_used
    # })
    
    #     return ocr_result

        