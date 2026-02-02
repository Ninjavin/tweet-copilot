# app/services/llm_router.py
from app.services.gemini_service import generate_with_gemini
from app.services.openai_service import generate_with_openai

def generate_text(provider: str, prompt: str) -> str:
    provider = provider.lower()

    if provider == "gemini":
        return generate_with_gemini(prompt)
    elif provider == "openai":
        return generate_with_openai(prompt)
    else:
        raise ValueError("Unsupported model provider")
