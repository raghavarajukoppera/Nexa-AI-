from datetime import datetime

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_path: str | None = None
    extracted_text: str | None = None
    uploaded_at: datetime

    class Config:
        from_attributes = True