# app/schemas/tweet.py
from pydantic import BaseModel
from typing import Optional, List, Literal

StructureToggle = Literal[
    "thread",
    "hook_first",
    "data_backed",
    "story_format",
    "contrarian_take",
    "with_cta",
    "question_based",
]

RefineAction = Literal[
    "rewrite",
    "sharper",
    "shorten",
    "viral",
    "calmer",
    "punchier",
]

class TweetRequest(BaseModel):
    topic: Optional[str] = None
    raw_text: Optional[str] = None
    tone: str = "professional"   # genz | professional | witty
    length: str = "short"        # short | medium | long
    model_provider: str          # gemini | openai
    structures: List[StructureToggle] = []
    refine_action: Optional[RefineAction] = None
