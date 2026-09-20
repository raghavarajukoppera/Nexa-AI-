from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Double,
    ForeignKey,
    Integer,
    String,
    Text,
)

from app.database.connection import Base


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    resume_id = Column(
        Integer,
        ForeignKey(
            "resumes.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    job_title = Column(
        String(255),
        nullable=True,
    )

    company_name = Column(
        String(255),
        nullable=True,
    )

    job_description = Column(
        Text,
        nullable=False,
    )

    overall_skill_match = Column(
        Double,
        nullable=True,
    )

    existing_skills = Column(
        Text,
        nullable=True,
    )

    missing_skills = Column(
        Text,
        nullable=True,
    )

    high_priority_skills = Column(
        Text,
        nullable=True,
    )

    learning_recommendations = Column(
        Text,
        nullable=True,
    )

    summary = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )