from datetime import datetime

from pydantic import BaseModel


class SkillGapCreate(BaseModel):
    resume_id: int
    job_title: str | None = None
    company_name: str | None = None
    job_description: str


class SkillGapResponse(BaseModel):
    id: int
    resume_id: int
    job_title: str | None = None
    company_name: str | None = None
    job_description: str

    overall_skill_match: float | None = None

    existing_skills: str | None = None
    missing_skills: str | None = None
    high_priority_skills: str | None = None
    learning_recommendations: str | None = None

    summary: str | None = None

    created_at: datetime

    class Config:
        from_attributes = True