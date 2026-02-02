# app/services/openai_service.py
from openai import OpenAI
from app.core.config import GROQ_API_KEY

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

def generate_with_openai(prompt: str) -> str:
    response = client.responses.create(
        model="openai/gpt-oss-20b",
        input=prompt
    )
    return response.output_text
