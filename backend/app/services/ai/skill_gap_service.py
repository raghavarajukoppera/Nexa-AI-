import json
import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is not set in the .env file"
    )


client = Groq(
    api_key=GROQ_API_KEY,
)


MODEL_NAME = "openai/gpt-oss-120b"


def analyze_skill_gap(
    resume_text: str,
    job_description: str,
) -> dict:
    system_prompt = """
You are NEXA AI, an expert AI career intelligence
and skill gap analysis system.

Your task is to analyze the gap between a candidate's
current skills and the skills required for a job.

Compare the resume against the job description and
identify:

1. Skills the candidate already has.
2. Skills required by the job that are missing.
3. The most important missing skills.
4. Practical learning recommendations.
5. Overall skill match.

Return ONLY valid JSON with exactly these fields:

{
    "overall_skill_match": 0,
    "existing_skills": [],
    "missing_skills": [],
    "high_priority_skills": [],
    "learning_recommendations": [],
    "summary": ""
}

Rules:

- overall_skill_match must be a number from 0 to 100.
- existing_skills must contain skills clearly
  demonstrated in the resume and relevant to the job.
- missing_skills must contain important skills or
  technologies required by the job that are missing
  or not clearly demonstrated in the resume.
- high_priority_skills must contain the most important
  missing skills to learn first.
- learning_recommendations must contain 4 to 8
  practical and specific recommendations.
- Recommendations should explain what the candidate
  should learn or improve.
- Prefer concrete technologies, frameworks, tools,
  concepts, and technical competencies.
- Do not invent skills or experience for the candidate.
- Do not claim that a skill exists unless it is supported
  by the resume.
- Do not include generic recommendations when a specific
  recommendation can be made.
- summary must be a concise professional assessment
  of the candidate's current skill readiness for the job.
- Base the analysis only on the provided resume and
  job description.
- Return JSON only.
"""

    user_prompt = f"""
Analyze the candidate's skill gap for the following job.

====================
CANDIDATE RESUME
====================

{resume_text}

====================
JOB DESCRIPTION
====================

{job_description}

====================

Return the skill gap analysis as JSON according
to the required format.
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
        max_tokens=3000,
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

    required_fields = [
        "overall_skill_match",
        "existing_skills",
        "missing_skills",
        "high_priority_skills",
        "learning_recommendations",
        "summary",
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(
                f"Groq response is missing field: {field}"
            )

    try:
        score = float(
            result["overall_skill_match"]
        )

    except (TypeError, ValueError):
        raise ValueError(
            "Groq returned an invalid overall_skill_match"
        )

    result["overall_skill_match"] = max(
        0.0,
        min(100.0, score),
    )

    list_fields = [
        "existing_skills",
        "missing_skills",
        "high_priority_skills",
        "learning_recommendations",
    ]

    for field in list_fields:
        if not isinstance(
            result[field],
            list,
        ):
            raise ValueError(
                f"Groq returned invalid format for {field}"
            )

    if not isinstance(
        result["summary"],
        str,
    ):
        raise ValueError(
            "Groq returned an invalid summary"
        )

    return result