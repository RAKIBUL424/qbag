from fastapi import APIRouter
from sqlalchemy import text

from app.database import SessionLocal
import shutil

router = APIRouter(prefix="/health", tags=["Health"])


@router.api_route("", methods=["GET","HEAD"])
def health():
    status = {
        "status": "healthy",
        "database": "unknown",
        "ocr": "unavailable",
        "version": "1.0.0",
    }

    # Database Check
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        status["database"] = "connected"
    except Exception:
        status["database"] = "disconnected"
        status["status"] = "unhealthy"

    # OCR Check
    if shutil.which("tesseract"):
        status["ocr"] = "available"

    return status