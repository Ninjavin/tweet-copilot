# app/schemas/tweet.py
from pydantic import BaseModel
from typing import Optional

class TweetRequest(BaseModel):
    topic: Optional[str] = None
    raw_text: Optional[str] = None
    tone: str = "professional"   # genz | professional | witty
    length: str = "short"        # short | medium | long
    model_provider: str          # gemini | openai
