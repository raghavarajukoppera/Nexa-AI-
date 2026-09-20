import os
import shutil

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pypdf import PdfReader
from docx import Document
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.connection import get_db
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeResponse


router = APIRouter(
    prefix="/api/resumes",
    tags=["Resumes"],
)


UPLOAD_DIR = "uploads/resumes"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# -----------------------------
# EXTRACT TEXT FROM PDF
# -----------------------------
def extract_pdf_text(file_path: str) -> str:
    text = ""

    reader = PdfReader(file_path)

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text.strip()


# -----------------------------
# EXTRACT TEXT FROM DOCX
# -----------------------------
def extract_docx_text(file_path: str) -> str:
    document = Document(file_path)

    text = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text.append(paragraph.text.strip())

    return "\n".join(text)


# -----------------------------
# UPLOAD RESUME
# -----------------------------
@router.post(
    "/upload",
    response_model=ResumeResponse,
)
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check file name
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is required",
        )

    # Check file type
    allowed_extensions = {
        ".pdf",
        ".docx",
    }

    file_extension = os.path.splitext(
        file.filename
    )[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed",
        )

    # Create unique file name
    safe_filename = (
        f"{current_user.id}_{file.filename}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        safe_filename,
    )

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    # Extract resume text
    try:
        if file_extension == ".pdf":
            extracted_text = extract_pdf_text(
                file_path
            )

        elif file_extension == ".docx":
            extracted_text = extract_docx_text(
                file_path
            )

        else:
            extracted_text = ""

    except Exception as exc:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract resume text: {str(exc)}",
        )

    # Create database record
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        extracted_text=extracted_text,
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


# -----------------------------
# GET CURRENT USER RESUMES
# -----------------------------
@router.get(
    "/",
    response_model=list[ResumeResponse],
)
def get_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resumes = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(Resume.id.desc())
        .all()
    )

    return resumes


# -----------------------------
# GET CURRENT USER RESUME
# -----------------------------
@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    return resume