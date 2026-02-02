from pydantic import BaseModel

class TweetRequest(BaseModel):
    topic: str
    # user_text: str
    tone: str
    length: str
