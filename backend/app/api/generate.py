from fastapi import APIRouter
from app.models.request_models import TweetRequest
from app.services.tweet_generator import generate_tweet

router = APIRouter()

@router.post("/generate")
def generate(req: TweetRequest):
    prompt = f"""
Write ONE tweet.

Topic: {req.topic}
Tone: {req.tone}
Length: {req.length}

Rules:
- Max 220 characters
- Human, clear, insightful
- At most 1 emoji
- No hashtags unless asked
"""
    tweet = generate_tweet(prompt)
    return {"tweet": tweet}
