from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.connection import get_db
from app.models.resume import Resume
from app.models.skill_gap_analysis import SkillGapAnalysis
from app.models.user import User
from app.schemas.skill_gap import (
    SkillGapCreate,
    SkillGapResponse,
)
from app.services.ai.skill_gap_service import (
    analyze_skill_gap,
)


router = APIRouter(
    prefix="/api/skill-gaps",
    tags=["Skill Gap Analysis"],
)


@router.post(
    "/resume/{resume_id}",
    response_model=SkillGapResponse,
)
def create_skill_gap_analysis(
    resume_id: int,
    gap_data: SkillGapCreate,
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

    if not resume.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Resume text has not been extracted",
        )

    if not gap_data.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty",
        )

    if len(gap_data.job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short",
        )

    try:
        ai_result = analyze_skill_gap(
            resume_text=resume.extracted_text,
            job_description=gap_data.job_description,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Skill gap AI failed: {str(exc)}",
        )

    existing_skills = ai_result.get(
        "existing_skills",
        [],
    )

    missing_skills = ai_result.get(
        "missing_skills",
        [],
    )

    high_priority_skills = ai_result.get(
        "high_priority_skills",
        [],
    )

    learning_recommendations = ai_result.get(
        "learning_recommendations",
        [],
    )

    existing_skills_text = "\n".join(
        f"- {item}"
        for item in existing_skills
    )

    missing_skills_text = "\n".join(
        f"- {item}"
        for item in missing_skills
    )

    high_priority_skills_text = "\n".join(
        f"- {item}"
        for item in high_priority_skills
    )

    learning_recommendations_text = "\n".join(
        f"- {item}"
        for item in learning_recommendations
    )

    skill_gap = SkillGapAnalysis(
        resume_id=resume_id,
        job_title=gap_data.job_title,
        company_name=gap_data.company_name,
        job_description=gap_data.job_description,
        overall_skill_match=ai_result[
            "overall_skill_match"
        ],
        existing_skills=existing_skills_text,
        missing_skills=missing_skills_text,
        high_priority_skills=high_priority_skills_text,
        learning_recommendations=learning_recommendations_text,
        summary=ai_result["summary"],
    )

    db.add(skill_gap)
    db.commit()
    db.refresh(skill_gap)

    return skill_gap


@router.get(
    "/{gap_id}",
    response_model=SkillGapResponse,
)
def get_skill_gap_analysis(
    gap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill_gap = (
        db.query(SkillGapAnalysis)
        .join(
            Resume,
            Resume.id == SkillGapAnalysis.resume_id,
        )
        .filter(
            SkillGapAnalysis.id == gap_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not skill_gap:
        raise HTTPException(
            status_code=404,
            detail="Skill gap analysis not found",
        )

    return skill_gap


@router.get(
    "/",
    response_model=list[SkillGapResponse],
)
def get_skill_gap_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill_gaps = (
        db.query(SkillGapAnalysis)
        .join(
            Resume,
            Resume.id == SkillGapAnalysis.resume_id,
        )
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            SkillGapAnalysis.id.desc()
        )
        .all()
    )

    return skill_gaps