import json
import os

from dotenv import load_dotenv
from groq import Groq


# --------------------------------
# LOAD ENVIRONMENT VARIABLES
# --------------------------------

load_dotenv()


# --------------------------------
# GROQ CONFIGURATION
# --------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not set in the .env file"
    )


client = Groq(
    api_key=GROQ_API_KEY,
)


MODEL_NAME = "openai/gpt-oss-120b"


# --------------------------------
# JOB MATCH ANALYSIS
# --------------------------------

def match_resume_with_job(
    resume_text: str,
    job_description: str,
) -> dict:
    """
    Compare a resume with a job description
    using Groq AI.
    """

    system_prompt = """
You are NEXA AI, an expert AI career intelligence
and recruitment analysis system.

Your task is to compare a candidate's resume
against a job description.

Return ONLY valid JSON with exactly these fields:

{
    "match_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "experience_match": 0,
    "education_match": 0,
    "summary": "",
    "recommendations": []
}

Rules:

- match_score must be a number from 0 to 100.
- experience_match must be a number from 0 to 100.
- education_match must be a number from 0 to 100.
- matched_skills must contain skills that are present
  in both the resume and job description.
- missing_skills must contain important skills or
  requirements from the job description that are
  missing or not clearly demonstrated in the resume.
- summary must be a concise professional explanation
  of how well the candidate matches the job.
- recommendations must contain 3 to 7 actionable
  recommendations.
- Evaluate technical skills, experience, projects,
  education, tools, technologies, and other relevant
  requirements.
- Do not invent skills, experience, qualifications,
  certifications, or achievements.
- Base the analysis only on the provided resume and
  job description.
- Return JSON only.
"""

    user_prompt = f"""
Compare the following resume against the following
job description.

====================
RESUME
====================

{resume_text}

====================
JOB DESCRIPTION
====================

{job_description}

====================

Return the job match analysis as JSON.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=0.2,
        max_tokens=2500,
        response_format={
            "type": "json_object",
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError(
            "Groq returned an empty response"
        )

    # --------------------------------
    # PARSE JSON
    # --------------------------------

    try:
        result = json.loads(content)

    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Groq returned invalid JSON: {exc}"
        )

    # --------------------------------
    # VALIDATE REQUIRED FIELDS
    # --------------------------------

    required_fields = [
        "match_score",
        "matched_skills",
        "missing_skills",
        "experience_match",
        "education_match",
        "summary",
        "recommendations",
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(
                f"Groq response is missing field: {field}"
            )

    # --------------------------------
    # VALIDATE NUMERIC SCORES
    # --------------------------------

    numeric_fields = [
        "match_score",
        "experience_match",
        "education_match",
    ]

    for field in numeric_fields:
        try:
            value = float(result[field])

        except (TypeError, ValueError):
            raise ValueError(
                f"Groq returned an invalid value for {field}"
            )

        result[field] = max(
            0.0,
            min(100.0, value),
        )

    # --------------------------------
    # VALIDATE LIST FIELDS
    # --------------------------------

    list_fields = [
        "matched_skills",
        "missing_skills",
        "recommendations",
    ]

    for field in list_fields:
        if not isinstance(
            result[field],
            list,
        ):
            raise ValueError(
                f"Groq returned invalid format for {field}"
            )

    return result