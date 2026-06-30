


# app/models/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    university = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    course = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(String, nullable=False)
    exam_type = Column(String, nullable=False)
    status = Column(String, default="pending")
    uploaded_by = Column(Integer, ForeignKey("user_table.id"))
    uploaded_at = Column(DateTime, server_default=func.now())

    images = relationship(
        "QuestionImage",
        back_populates="question",
        cascade="all, delete-orphan"
    )


class QuestionImage(Base):
    __tablename__ = "question_images"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    question = relationship("Question", back_populates="images")


class UserModel(Base):
    __tablename__ = "user_table"

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False, unique=True)
    hased_password = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    mobile = Column(String, nullable=False)
    coins = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    coin_transactions = relationship("CoinTransaction", back_populates="user")
    search_purchases = relationship("SearchPurchase", back_populates="user")
    coin_packages = relationship("UserCoinPackage", back_populates="user")


class ExamTypeEnum(str, enum.Enum):
    QUIZ = "quiz"
    MID = "mid"
    FINAL = "final"


class CoinTransaction(Base):
    __tablename__ = "coin_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_table.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    transaction_type = Column(String, nullable=False)  # 'recharge', 'purchase', 'refund', 'expired'
    description = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("UserModel", back_populates="coin_transactions")


class UserCoinPackage(Base):
    """Track coin packages purchased by users with expiration"""
    __tablename__ = "user_coin_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_table.id"), nullable=False)
    package_amount = Column(Integer, nullable=False)  # Amount in Taka
    coins_received = Column(Integer, nullable=False)
    coins_remaining = Column(Integer, nullable=False)  # Track remaining coins from this package
    purchase_date = Column(DateTime, server_default=func.now())
    expiry_date = Column(DateTime, nullable=False)  # 30 days from purchase
    is_active = Column(Boolean, default=True)
    
    user = relationship("UserModel", back_populates="coin_packages")
    
    def is_expired(self):
        return datetime.now() > self.expiry_date


class SearchPurchase(Base):
    __tablename__ = "search_purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_table.id"), nullable=False)
    
    # Search criteria
    university = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    course = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(String, nullable=False)
    exam_type = Column(String, nullable=False)
    
    # Purchase details
    total_questions = Column(Integer, nullable=False)
    coins_spent = Column(Integer, nullable=False)
    purchase_date = Column(DateTime, server_default=func.now())
    expiry_date = Column(DateTime, nullable=False)  # 18 days from purchase
    
    # Status
    is_active = Column(String, default="active")  # 'active', 'expired', 'refunded'
    
    # Relationships
    user = relationship("UserModel", back_populates="search_purchases")
    search_results = relationship("SearchResult", back_populates="purchase", cascade="all, delete-orphan")
    
    def is_expired(self):
        return datetime.now() > self.expiry_date


class SearchResult(Base):
    __tablename__ = "search_results"
    
    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("search_purchases.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    purchase = relationship("SearchPurchase", back_populates="search_results")
    question = relationship("Question")