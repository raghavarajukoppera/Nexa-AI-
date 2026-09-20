from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.connection import get_db
from app.models.job_match import JobMatch
from app.models.resume import Resume
from app.models.user import User
from app.schemas.job_match import (
    JobMatchCreate,
    JobMatchResponse,
)
from app.services.ai.job_match_service import (
    match_resume_with_job,
)


router = APIRouter(
    prefix="/api/job-matches",
    tags=["Job Matching"],
)


# --------------------------------
# CREATE JOB MATCH
# --------------------------------

@router.post(
    "/resume/{resume_id}",
    response_model=JobMatchResponse,
)
def create_job_match(
    resume_id: int,
    match_data: JobMatchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------
    # FIND USER'S RESUME
    # --------------------------------

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

    # --------------------------------
    # CHECK RESUME TEXT
    # --------------------------------

    if not resume.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Resume text has not been extracted",
        )

    # --------------------------------
    # CHECK JOB DESCRIPTION
    # --------------------------------

    if not match_data.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty",
        )

    if len(match_data.job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short",
        )

    # --------------------------------
    # CALL GROQ AI
    # --------------------------------

    try:
        ai_result = match_resume_with_job(
            resume_text=resume.extracted_text,
            job_description=match_data.job_description,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Job matching AI failed: {str(exc)}",
        )

    # --------------------------------
    # CONVERT LISTS TO TEXT
    # --------------------------------

    matched_skills = ai_result.get(
        "matched_skills",
        [],
    )

    missing_skills = ai_result.get(
        "missing_skills",
        [],
    )

    recommendations = ai_result.get(
        "recommendations",
        [],
    )

    matched_skills_text = "\n".join(
        f"- {item}"
        for item in matched_skills
    )

    missing_skills_text = "\n".join(
        f"- {item}"
        for item in missing_skills
    )

    recommendations_text = "\n".join(
        f"- {item}"
        for item in recommendations
    )

    # --------------------------------
    # SAVE JOB MATCH
    # --------------------------------

    job_match = JobMatch(
        resume_id=resume_id,
        job_title=match_data.job_title,
        company_name=match_data.company_name,
        job_description=match_data.job_description,
        match_score=ai_result["match_score"],
        matched_skills=matched_skills_text,
        missing_skills=missing_skills_text,
        experience_match=ai_result["experience_match"],
        education_match=ai_result["education_match"],
        summary=ai_result["summary"],
        recommendations=recommendations_text,
    )

    db.add(job_match)
    db.commit()
    db.refresh(job_match)

    return job_match


# --------------------------------
# GET JOB MATCH BY ID
# --------------------------------

@router.get(
    "/{match_id}",
    response_model=JobMatchResponse,
)
def get_job_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job_match = (
        db.query(JobMatch)
        .join(
            Resume,
            Resume.id == JobMatch.resume_id,
        )
        .filter(
            JobMatch.id == match_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not job_match:
        raise HTTPException(
            status_code=404,
            detail="Job match not found",
        )

    return job_match


# --------------------------------
# GET CURRENT USER JOB MATCHES
# --------------------------------

@router.get(
    "/",
    response_model=list[JobMatchResponse],
)
def get_job_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job_matches = (
        db.query(JobMatch)
        .join(
            Resume,
            Resume.id == JobMatch.resume_id,
        )
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            JobMatch.id.desc()
        )
        .all()
    )

    return job_matches