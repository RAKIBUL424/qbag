# app/routers/ocr.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import Dict
import base64
import io

from app.dependencies import get_db
from app.controllers.controllers import is_authenticated
from app.schemas.schemas import UserSchema
from app.services.coin_service import CoinService

router = APIRouter(prefix="/ocr", tags=["ocr"])

@router.post("/extract")
async def extract_text_from_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """
    Extract text from uploaded image (screenshot)
    Costs 3 coins per request
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    # Read image bytes
    image_bytes = await file.read()
    
    if len(image_bytes) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(
            status_code=400,
            detail="Image size too large. Maximum 5MB allowed."
        )
    
    try:
        # Process OCR with coin deduction
        result = CoinService.process_ocr_request(
            db, user.id, image_bytes
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}"
        )


@router.post("/extract-base64")
async def extract_text_from_base64(
    image_data: Dict,
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """
    Extract text from base64 encoded image
    """
    try:
        # Decode base64 image
        image_base64 = image_data.get('image')
        if not image_base64:
            raise HTTPException(
                status_code=400,
                detail="No image data provided"
            )
        
        # Remove data URL prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_base64)
        
        # Process OCR
        result = CoinService.process_ocr_request(
            db, user.id, image_bytes
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}"
        )


@router.get("/cost")
async def get_ocr_cost(
    db: Session = Depends(get_db),
    user: UserSchema = Depends(is_authenticated)
):
    """
    Get the cost of OCR feature
    """
    return {
        "cost": CoinService.OCR_COST,
        "currency": "coins"
    }