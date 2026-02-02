"""Re-export request models from the shared schema module.

This prevents duplicate definitions of `TweetRequest` and keeps a
single source of truth in `app.schemas.tweet`.
"""

from app.schemas.tweet import TweetRequest

__all__ = ["TweetRequest"]
