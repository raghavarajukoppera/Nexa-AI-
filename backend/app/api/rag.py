from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Resume
from app.rag.rag_service import retrieve_from_resume
from app.services.ai.rag_service import generate_rag_answer


router = APIRouter(
    prefix="/api/rag",
    tags=["RAG"],
)


class RAGQuery(BaseModel):
    resume_id: int
    query: str
    top_k: int = 5


@router.post("/retrieve")
def retrieve_rag_context(
    request: RAGQuery,
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == request.resume_id)
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
            detail="Resume does not contain extracted text",
        )

    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty",
        )

    if request.top_k < 1 or request.top_k > 10:
        raise HTTPException(
            status_code=400,
            detail="top_k must be between 1 and 10",
        )

    try:
        chunks = retrieve_from_resume(
            db=db,
            resume_id=request.resume_id,
            query=request.query,
            top_k=request.top_k,
        )

        return {
            "resume_id": request.resume_id,
            "query": request.query,
            "retrieved_chunks": chunks,
            "count": len(chunks),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )


@router.post("/ask")
def ask_rag(
    request: RAGQuery,
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == request.resume_id)
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
            detail="Resume does not contain extracted text",
        )

    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty",
        )

    if request.top_k < 1 or request.top_k > 10:
        raise HTTPException(
            status_code=400,
            detail="top_k must be between 1 and 10",
        )

    try:
        chunks = retrieve_from_resume(
            db=db,
            resume_id=request.resume_id,
            query=request.query,
            top_k=request.top_k,
        )

        result = generate_rag_answer(
            query=request.query,
            retrieved_chunks=chunks,
        )

        return {
            "resume_id": request.resume_id,
            "query": request.query,
            "answer": result["answer"],
            "sources": result["sources"],
            "retrieved_chunks": chunks,
            "count": len(chunks),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )