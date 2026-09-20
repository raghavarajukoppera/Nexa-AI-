from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.connection import get_db
from app.models.resume import Resume
from app.models.resume_analysis import ResumeAnalysis
from app.models.user import User
from app.schemas.analysis import ResumeAnalysisResponse
from app.services.ai.grok_service import analyze_resume_with_groq


router = APIRouter(
    prefix="/api/analyses",
    tags=["Resume Analysis"],
)


# -----------------------------
# CREATE AI RESUME ANALYSIS
# -----------------------------
@router.post(
    "/resume/{resume_id}",
    response_model=ResumeAnalysisResponse,
)
def analyze_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find resume belonging to current user
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

    # Check extracted text
    if not resume.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Resume text has not been extracted",
        )

    # Call Groq AI
    try:
        ai_result = analyze_resume_with_groq(
            resume.extracted_text
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(exc)}",
        )

    # Convert lists to text
    strengths = ai_result.get(
        "strengths",
        [],
    )

    weaknesses = ai_result.get(
        "weaknesses",
        [],
    )

    recommendations = ai_result.get(
        "recommendations",
        [],
    )

    strengths_text = "\n".join(
        f"- {item}" for item in strengths
    )

    weaknesses_text = "\n".join(
        f"- {item}" for item in weaknesses
    )

    recommendations_text = "\n".join(
        f"- {item}" for item in recommendations
    )

    # Save analysis
    analysis = ResumeAnalysis(
        resume_id=resume_id,
        overall_score=ai_result["overall_score"],
        summary=ai_result["summary"],
        strengths=strengths_text,
        weaknesses=weaknesses_text,
        recommendations=recommendations_text,
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis


# -----------------------------
# GET ANALYSIS BY ID
# -----------------------------
@router.get(
    "/{analysis_id}",
    response_model=ResumeAnalysisResponse,
)
def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(ResumeAnalysis)
        .join(
            Resume,
            Resume.id == ResumeAnalysis.resume_id,
        )
        .filter(
            ResumeAnalysis.id == analysis_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    return analysis


# -----------------------------
# GET CURRENT USER ANALYSES
# -----------------------------
@router.get(
    "/",
    response_model=list[ResumeAnalysisResponse],
)
def get_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analyses = (
        db.query(ResumeAnalysis)
        .join(
            Resume,
            Resume.id == ResumeAnalysis.resume_id,
        )
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(ResumeAnalysis.id.desc())
        .all()
    )

    return analyses