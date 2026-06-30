# app/services/expiration_service.py
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict
from fastapi import BackgroundTasks
import logging

from app.models.models import UserModel, UserCoinPackage, SearchPurchase, CoinTransaction
from app.config.coin_config import COIN_VALIDITY_DAYS, SEARCH_RESULT_VALIDITY_DAYS

logger = logging.getLogger(__name__)

class ExpirationService:
    
    @staticmethod
    def get_active_coins(db: Session, user_id: int) -> int:
        """
        Get total active (non-expired) coins for a user
        """
        active_packages = db.query(UserCoinPackage).filter(
            UserCoinPackage.user_id == user_id,
            UserCoinPackage.is_active == True,
            UserCoinPackage.expiry_date > datetime.now(),
            UserCoinPackage.coins_remaining > 0
        ).all()
        
        total_coins = sum(pkg.coins_remaining for pkg in active_packages)
        return total_coins
    
    @staticmethod
    def get_coins_breakdown(db: Session, user_id: int) -> List[Dict]:
        """
        Get breakdown of coin packages with remaining coins and expiry dates
        """
        packages = db.query(UserCoinPackage).filter(
            UserCoinPackage.user_id == user_id,
            UserCoinPackage.is_active == True,
            UserCoinPackage.coins_remaining > 0
        ).order_by(UserCoinPackage.expiry_date).all()
        
        breakdown = []
        for pkg in packages:
            breakdown.append({
                "package_id": pkg.id,
                "coins_remaining": pkg.coins_remaining,
                "expiry_date": pkg.expiry_date,
                "is_expired": pkg.is_expired(),
                "days_remaining": max(0, (pkg.expiry_date - datetime.now()).days)
            })
        
        return breakdown
    
    @staticmethod
    def expire_coins(db: Session, background_tasks: BackgroundTasks):
        """
        Background task to expire coins and update user balances
        """
        try:
            # Find expired coin packages
            expired_packages = db.query(UserCoinPackage).filter(
                UserCoinPackage.is_active == True,
                UserCoinPackage.expiry_date <= datetime.now(),
                UserCoinPackage.coins_remaining > 0
            ).all()
            
            for package in expired_packages:
                # Mark package as inactive
                package.is_active = False
                
                # Create transaction record for expired coins
                transaction = CoinTransaction(
                    user_id=package.user_id,
                    amount=-package.coins_remaining,
                    transaction_type="expired",
                    description=f"Coins expired from package {package.id} (bought {package.package_amount} tk)"
                )
                db.add(transaction)
                
                # Update user's total coins
                user = db.query(UserModel).filter(UserModel.id == package.user_id).first()
                if user:
                    user.coins = max(0, user.coins - package.coins_remaining)
                
                logger.info(f"Expired {package.coins_remaining} coins for user {package.user_id} from package {package.id}")
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Error expiring coins: {e}")
            db.rollback()
    
    @staticmethod
    def expire_purchases(db: Session, background_tasks: BackgroundTasks):
        """
        Background task to expire old purchases
        """
        try:
            # Find expired purchases
            expired_purchases = db.query(SearchPurchase).filter(
                SearchPurchase.is_active == "active",
                SearchPurchase.expiry_date <= datetime.now()
            ).all()
            
            for purchase in expired_purchases:
                purchase.is_active = "expired"
                logger.info(f"Expired purchase {purchase.id} for user {purchase.user_id}")
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Error expiring purchases: {e}")
            db.rollback()
    
    @staticmethod
    def run_expiration_check(db: Session, background_tasks: BackgroundTasks):
        """
        Run both coin and purchase expiration checks
        """
        ExpirationService.expire_coins(db, background_tasks)
        ExpirationService.expire_purchases(db, background_tasks)