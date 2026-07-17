# app/services/ocr_service.py
import cv2
import io
import re
import shutil
import logging
import platform

import numpy as np
import pytesseract
from PIL import Image
from fastapi import HTTPException
from typing import Dict

logger = logging.getLogger(__name__)


# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  # Adjust based on your OS
if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )
else:
    tesseract = shutil.which("tesseract")

    if not tesseract:
        raise RuntimeError("Tesseract executable not found.")

    pytesseract.pytesseract.tesseract_cmd = tesseract

class OCRService:
    
    @staticmethod
    def extract_text_from_image(image_bytes: bytes) -> Dict:
        """
        Extract text from image using Tesseract OCR
        """
        try:
            # Convert bytes to PIL Image and force RGB mode
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            logger.debug(f"OCR input image mode={image.mode}, size={image.size}")
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Preprocess image for better OCR
            processed_image = OCRService.preprocess_image(cv_image)
            logger.debug(f"OCR processed image shape={processed_image.shape}, dtype={processed_image.dtype}")
            
            # Extract text using Tesseract
            custom_config = r'--oem 3 --psm 6'
            text = pytesseract.image_to_string(processed_image, config=custom_config)
            if not text.strip():
                logger.debug("Tesseract returned empty on processed image; retrying on original RGB image")
                text = pytesseract.image_to_string(image, config=custom_config)
            logger.debug(f"OCR raw_text ({len(text)} chars): {text!r}")
            
            # Clean and format the text
            cleaned_text = OCRService.clean_text(text)
            logger.debug(f"OCR cleaned_text ({len(cleaned_text)} chars): {cleaned_text!r}")
            
            return {
                "success": True,
                "text": cleaned_text,
                "raw_text": text,
                "word_count": len(cleaned_text.split()),
                "char_count": len(cleaned_text)
            }
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")
    
    @staticmethod
    def preprocess_image(image):
        """
        Preprocess image for better OCR results
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        # Resize if too small
        height, width = denoised.shape
        if height < 300 or width < 300:
            scale = max(300/height, 300/width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            denoised = cv2.resize(denoised, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        
        return denoised
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean extracted text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove excessive spaces
        text = ' '.join(text.split())
        
        # Trim
        text = text.strip()
        
        return text


# Alternative: Using EasyOCR for better accuracy (optional)
# class EasyOCRService:
    
#     def __init__(self):
#         import easyocr
#         self.reader = easyocr.Reader(['en'])  # Add more languages as needed
    
#     def extract_text(self, image_bytes: bytes) -> Dict:
#         """
#         Extract text using EasyOCR
#         """
#         try:
#             # Convert bytes to image
#             image = Image.open(io.BytesIO(image_bytes))
            
#             # Convert to numpy array
#             image_np = np.array(image)
            
#             # Extract text
#             results = self.reader.readtext(image_np)
            
#             # Combine results
#             text_parts = []
#             for (bbox, text, confidence) in results:
#                 if confidence > 0.5:  # Only include high confidence results
#                     text_parts.append(text)
            
#             combined_text = ' '.join(text_parts)
#             cleaned_text = OCRService.clean_text(combined_text)
            
#             return {
#                 "success": True,
#                 "text": cleaned_text,
#                 "raw_text": combined_text,
#                 "word_count": len(cleaned_text.split()),
#                 "char_count": len(cleaned_text)
#             }
            
#         except Exception as e:
#             logger.error(f"EasyOCR extraction failed: {e}")
#             raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")



