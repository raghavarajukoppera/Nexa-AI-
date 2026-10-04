
import re
from collections import Counter

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Resume
from app.services.ai.rag_service import generate_rag_answer


router = APIRouter(
    prefix="/api/rag",
    tags=["RAG"],
)


class RAGQuery(BaseModel):
    resume_id: int
    query: str
    top_k: int = 5


def split_resume_into_chunks(
    text: str,
    chunk_size: int = 900,
    overlap: int = 150,
) -> list[str]:
    """Split resume text into overlapping chunks."""
    text = re.sub(r"\s+", " ", text).strip()

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end == len(text):
            break

        start = end - overlap

    return chunks


def retrieve_from_resume(
    text: str,
    query: str,
    top_k: int = 5,
) -> list[str]:
    """Rank resume chunks by keyword overlap with the query."""
    chunks = split_resume_into_chunks(text)

    if not chunks:
        return []

    stop_words = {
        "a", "an", "and", "are", "as", "at", "be", "by",
        "for", "from", "how", "i", "in", "is", "it", "of",
        "on", "or", "that", "the", "this", "to", "what",
        "which", "with", "you", "your", "my",
    }

    query_terms = [
        word
        for word in re.findall(r"\b[a-zA-Z0-9+#.]+\b", query.lower())
        if word not in stop_words
    ]

    if not query_terms:
        return chunks[:top_k]

    query_counts = Counter(query_terms)
    ranked_chunks = []

    for index, chunk in enumerate(chunks):
        chunk_terms = re.findall(
            r"\b[a-zA-Z0-9+#.]+\b",
            chunk.lower(),
        )
        chunk_counts = Counter(chunk_terms)

        score = sum(
            min(count, chunk_counts.get(term, 0))
            for term, count in query_counts.items()
        )

        if score > 0:
            ranked_chunks.append((score, index, chunk))

    ranked_chunks.sort(
        key=lambda item: (-item[0], item[1])
    )

    return [
        chunk
        for _, _, chunk in ranked_chunks[:top_k]
    ]


def get_resume_or_raise(
    db: Session,
    resume_id: int,
) -> Resume:
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id)
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

    return resume


def validate_request(request: RAGQuery) -> None:
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


@router.post("/retrieve")
def retrieve_rag_context(
    request: RAGQuery,
    db: Session = Depends(get_db),
):
    validate_request(request)
    resume = get_resume_or_raise(db, request.resume_id)

    chunks = retrieve_from_resume(
        text=resume.extracted_text,
        query=request.query,
        top_k=request.top_k,
    )

    return {
        "resume_id": request.resume_id,
        "query": request.query,
        "retrieved_chunks": chunks,
        "count": len(chunks),
    }


@router.post("/ask")
def ask_rag(
    request: RAGQuery,
    db: Session = Depends(get_db),
):
    validate_request(request)
    resume = get_resume_or_raise(db, request.resume_id)

    chunks = retrieve_from_resume(
        text=resume.extracted_text,
        query=request.query,
        top_k=request.top_k,
    )

    try:
        result = generate_rag_answer(
            query=request.query,
            retrieved_chunks=chunks,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="The AI service could not generate an answer.",
        ) from exc

    return {
        "resume_id": request.resume_id,
        "query": request.query,
        "answer": result["answer"],
        "sources": result["sources"],
        "retrieved_chunks": chunks,
        "count": len(chunks),
    }
