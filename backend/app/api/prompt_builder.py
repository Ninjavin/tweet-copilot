from app.models.request_models import TweetRequest

def build_prompt(req: TweetRequest) -> str:
    return f"""
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