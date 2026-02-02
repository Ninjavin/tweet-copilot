from fastapi import APIRouter, HTTPException
from app.models.request_models import TweetRequest
from app.services.llm_router import generate_text
from app.api.prompt_builder import build_prompt

router = APIRouter()

@router.post("/generate")
def generate(req: TweetRequest):
    try:
        prompt = build_prompt(req)
        output = generate_text(req.model_provider, prompt)
        return {"tweet": output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
