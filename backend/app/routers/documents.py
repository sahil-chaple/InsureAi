import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.claim import DocumentOut
from app.services import claims_service
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 Megabytes
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

# Create upload directory if it does not exist
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    claim_id: Optional[uuid.UUID] = Form(None),
    policy_id: Optional[uuid.UUID] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts multipart file uploads for claim or policy verification.
    Enforces validation of file types (PDF, JPG, PNG only) and size (10MB limit).
    """
    # 1. Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format: '{file_ext}'. Only PDF, JPG, and PNG are permitted."
        )
        
    # 2. Validate file size
    contents = await file.read()
    file_size = len(contents)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the maximum limit of 10MB."
        )
        
    # Generate randomized UUID filename to prevent path traversal/filename collision
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # PRODUCTION TODO:
    # 1. Scan uploaded bytes with an antivirus daemon like ClamAV to verify file safety.
    # 2. Move OCR document parsing/verification to an off-thread background worker (e.g. Celery / AWS SQS) to prevent thread blocking.
    # 3. Save physical files to a dedicated Object Storage bucket (e.g. AWS S3) rather than the local filesystem.
    
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error: Failed to save file to disk."
        )
        
    # 3. Write metadata to database
    db_doc = claims_service.create_document(
        db=db,
        uploaded_by=current_user.id,
        file_name=file.filename or unique_filename,
        file_path=file_path,
        file_type=file.content_type or "application/octet-stream",
        claim_id=str(claim_id) if claim_id else None,
        policy_id=str(policy_id) if policy_id else None
    )
    
    return db_doc
