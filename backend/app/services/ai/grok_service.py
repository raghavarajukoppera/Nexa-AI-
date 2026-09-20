import json
import os

from dotenv import load_dotenv
from groq import Groq


# Load environment variables
load_dotenv()


# Get Groq API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not set in the .env file"
    )


# Create Groq client
client = Groq(
    api_key=GROQ_API_KEY,
)


# Groq model
MODEL_NAME = "openai/gpt-oss-120b"


def analyze_resume_with_groq(resume_text: str) -> dict:
    """
    Analyze resume text using Groq AI.
    """

    system_prompt = """
You are NEXA AI, an expert AI career and resume intelligence system.

Analyze the provided resume professionally and objectively.

Return ONLY valid JSON with exactly these fields:

{
    "overall_score": 0,
    "summary": "",
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
}

Rules:

- overall_score must be a number from 0 to 100.
- summary must be a concise professional assessment.
- strengths must contain 3 to 6 specific strengths.
- weaknesses must contain 3 to 6 specific weaknesses or improvement areas.
- recommendations must contain 4 to 8 actionable recommendations.
- Evaluate technical skills, projects, experience, education, achievements,
  resume structure, clarity, and career readiness.
- Do not invent experience, skills, achievements, or education that are not
  present in the resume.
- Recommendations should be specific to the resume.
- Return JSON only.
"""

    user_prompt = f"""
Analyze the following resume.

RESUME TEXT:
----------------
{resume_text}
----------------

Return the analysis as JSON according to the required format.
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
        max_tokens=2000,
        response_format={
            "type": "json_object",
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError(
            "Groq returned an empty response"
        )

    try:
        result = json.loads(content)

    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Groq returned invalid JSON: {exc}"
        )

    # Check required fields
    required_fields = [
        "overall_score",
        "summary",
        "strengths",
        "weaknesses",
        "recommendations",
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(
                f"Groq response is missing field: {field}"
            )

    # Validate score
    try:
        score = float(result["overall_score"])

    except (TypeError, ValueError):
        raise ValueError(
            "Groq returned an invalid overall_score"
        )

    # Keep score between 0 and 100
    score = max(0.0, min(100.0, score))

    result["overall_score"] = score

    # Make sure list fields are actually lists
    for field in [
        "strengths",
        "weaknesses",
        "recommendations",
    ]:
        if not isinstance(result[field], list):
            raise ValueError(
                f"Groq returned invalid format for {field}"
            )

    return result