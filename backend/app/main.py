


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os

from app.database import engine
from app.models.models import Base
from app.routers import upload, fetch, user, premium_search, ocr, admin_router, health

# Create tables
# Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/api")

# CORS configuration
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://144.79.249.92",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Ensure uploads directory exists
UPLOAD_DIR = "app/uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Include routers
app.include_router(upload.router)
app.include_router(fetch.router)
app.include_router(premium_search.router)
app.include_router(ocr.router)
app.include_router(user.router)
app.include_router(admin_router.router)
app.include_router(health.router)

# Custom route to serve images with CORS headers
@app.get("/uploads/{image_name}")
async def get_uploaded_image(image_name: str):
    """Serve uploaded images with proper CORS headers"""
    image_path = os.path.join(UPLOAD_DIR, image_name)
    
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Determine content type based on file extension
    content_type = "image/png"
    if image_name.lower().endswith(('.jpg', '.jpeg')):
        content_type = "image/jpeg"
    elif image_name.lower().endswith('.gif'):
        content_type = "image/gif"
    elif image_name.lower().endswith('.webp'):
        content_type = "image/webp"
    
    return FileResponse(
        image_path,
        media_type=content_type,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

@app.get("/")
async def home():
    return {
        "message": "QbAg API v2 Test"
    }