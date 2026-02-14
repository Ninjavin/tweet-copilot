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

EngagementMode = Literal[
    "none",
    "clickbait_fun",
    "rage_bait_light",
    "coworker_story",
    "build_drama",
    "unpopular_opinion",
]

class TweetRequest(BaseModel):
    topic: Optional[str] = None
    raw_text: Optional[str] = None
    tone: str = "professional"   # genz | professional | witty
    length: str = "short"        # short | medium | long
    model_provider: str          # gemini | openai
    structures: List[StructureToggle] = []
    refine_action: Optional[RefineAction] = None
    engagement_mode: EngagementMode = "none"
