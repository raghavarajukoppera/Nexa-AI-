import json
import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set in the .env file")


client = Groq(api_key=GROQ_API_KEY)

MODEL_NAME = "openai/gpt-oss-120b"


def generate_rag_answer(
    query: str,
    retrieved_chunks: list[str],
) -> dict:
    """
    Generate an answer using only the retrieved context.
    """

    if not query.strip():
        raise ValueError("Query cannot be empty")

    if not retrieved_chunks:
        return {
            "answer": "I could not find relevant information in the provided resume.",
            "sources": [],
        }

    context = "\n\n---\n\n".join(
        f"Source {index + 1}:\n{chunk}"
        for index, chunk in enumerate(retrieved_chunks)
    )

    system_prompt = """
You are NEXA AI, an AI-powered career intelligence assistant.

Answer the user's question using ONLY the supplied context.

Rules:
1. Do not invent information.
2. Do not assume skills, experience, education, or achievements that are not present.
3. If the context does not contain enough information, clearly say so.
4. Give a concise and useful answer.
5. When appropriate, use bullet points.
6. Return valid JSON only.
"""

    user_prompt = f"""
Context:

{context}

User question:

{query}

Return JSON in exactly this structure:

{{
  "answer": "your answer here",
  "sources": [
    "short description of source 1",
    "short description of source 2"
  ]
}}
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
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Groq returned an empty response")

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Groq returned invalid JSON"
        ) from exc

    return {
        "answer": str(result.get("answer", "")),
        "sources": result.get("sources", []),
    }