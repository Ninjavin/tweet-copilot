from fastapi import APIRouter, HTTPException
from app.models.request_models import TweetRequest
from app.services.llm_router import generate_text
from app.api.prompt_builder import build_prompt

router = APIRouter()


VARIANT_PROMPTS = [
    "Variant A: prioritize clarity and directness.",
    "Variant B: prioritize novelty and stronger hook.",
    "Variant C: prioritize concise punch and memorability.",
]


@router.post("/generate")
def generate(req: TweetRequest):
    try:
        prompt = build_prompt(req)
        variants = []

        for variant_hint in VARIANT_PROMPTS:
            variant_prompt = (
                f"{prompt}\n\n"
                f"Variation instruction: {variant_hint}\n"
                "Return only the final tweet text."
            )
            output = generate_text(req.model_provider, variant_prompt).strip()
            if output:
                variants.append(output)

        if not variants:
            raise ValueError("Model returned empty output.")

        return {
            "tweet": variants[0],  # backward compatibility
            "variants": variants
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
