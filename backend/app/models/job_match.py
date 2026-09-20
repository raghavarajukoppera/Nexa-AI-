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


class JobMatch(Base):
    __tablename__ = "job_matches"

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

    match_score = Column(
        Double,
        nullable=True,
    )

    matched_skills = Column(
        Text,
        nullable=True,
    )

    missing_skills = Column(
        Text,
        nullable=True,
    )

    experience_match = Column(
        Double,
        nullable=True,
    )

    education_match = Column(
        Double,
        nullable=True,
    )

    summary = Column(
        Text,
        nullable=True,
    )

    recommendations = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )