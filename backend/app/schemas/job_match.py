from datetime import datetime

from pydantic import BaseModel


class JobMatchCreate(BaseModel):
    resume_id: int
    job_title: str | None = None
    company_name: str | None = None
    job_description: str


class JobMatchResponse(BaseModel):
    id: int
    resume_id: int
    job_title: str | None = None
    company_name: str | None = None
    job_description: str
    match_score: float | None = None
    matched_skills: str | None = None
    missing_skills: str | None = None
    experience_match: float | None = None
    education_match: float | None = None
    summary: str | None = None
    recommendations: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True