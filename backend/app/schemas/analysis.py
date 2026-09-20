from datetime import datetime

from pydantic import BaseModel


class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    overall_score: float | None = None
    summary: str | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    recommendations: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True