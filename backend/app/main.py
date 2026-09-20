from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.users import router as users_router
from app.api.resumes import router as resumes_router
from app.api.analyses import router as analyses_router
from app.api.auth import router as auth_router
from app.api.job_matches import router as job_matches_router
from app.api.skill_gaps import router as skill_gaps_router
from app.api.rag import router as rag_router


app = FastAPI(
    title="NEXA AI API",
    description="AI-powered career intelligence platform",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(resumes_router)
app.include_router(analyses_router)
app.include_router(job_matches_router)
app.include_router(skill_gaps_router)
app.include_router(rag_router)


@app.get("/")
async def root():
    return {
        "name": "NEXA AI",
        "message": "NEXA AI backend is running",
        "status": "online",
    }


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "service": "NEXA AI API",
    }