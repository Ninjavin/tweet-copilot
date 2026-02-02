from google import genai
from app.core.config import GEMINI_API_KEY

client = genai.Client()

def generate_with_gemini(prompt: str) -> str:
    system_prompt = """
You are an experienced software engineer with a strong Twitter presence.
You write concise, insightful, non-cringe tweets for developers.
You never exceed the character limit.
"""

    full_prompt = system_prompt + "\n\n" + prompt

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=full_prompt
    )
    return response.text.strip()[:220]