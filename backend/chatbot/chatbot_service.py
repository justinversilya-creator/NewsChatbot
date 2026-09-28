import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import HTTPException
from groq import Groq

from chatbot.schemas import ChatRequest, ChatResponse
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None

print("GROQ_API_KEY loaded :", bool(GROQ_API_KEY))
SYSTEM_PROMPT = """You are a news assistant.

Answer the user's question using ONLY the provided news context.

Rules:
- Do not invent facts.
- Do not use outside knowledge.
- If the answer is not available in the supplied news context, clearly say that the information is not available in the provided news context.
- Keep answers clear, concise and easy to understand.
- When appropriate, use bullet points.
"""


MODEL = "openai/gpt-oss-20b"


def generate_chat_response(request: ChatRequest) -> ChatResponse:

    if not client:
        raise HTTPException(
            status_code=500,
            detail="AI service is not configured."
        )

    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    context = f"""
Title: {request.news.title}
Source: {request.news.source}
Published: {request.news.published}
Category: {request.news.category}
URL: {request.news.url}

Summary:
{request.news.summary}
"""

    prompt = f"""
News Context:
{context}

User Question:
{request.question}

Answer using ONLY the News Context above.
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=250
        )

        answer = response.choices[0].message.content

        if not answer:
            raise RuntimeError("AI service returned an empty response.")

        return ChatResponse(
            answer=answer.strip(),
            source=request.news.source,
            grounded=True
        )

    except Exception as error:
        print(f"Groq API error: {error}")

        raise HTTPException(
            status_code=503,
            detail="The AI service is temporarily unavailable. Please try again."
        )