from app.models.request_models import TweetRequest


STRUCTURE_INSTRUCTIONS = {
    "thread": "Format as a tweet thread with 4-7 short tweets. Number each line as 1/, 2/, etc. Keep each tweet under 280 chars.",
    "hook_first": "Start with a sharp hook in the first line. The first sentence must create curiosity or tension.",
    "data_backed": "Include at least one concrete metric, number, benchmark, or factual comparison.",
    "story_format": "Use a mini-story arc: setup, tension, insight, and takeaway.",
    "contrarian_take": "Present a respectful contrarian viewpoint against common advice, then defend it clearly.",
    "with_cta": "End with a clear call to action.",
    "question_based": "Use a question-led structure and include at least one strong question.",
}

REFINE_INSTRUCTIONS = {
    "rewrite": "Rewrite from scratch while preserving the core message.",
    "sharper": "Make it sharper: tighter wording, clearer thesis, stronger clarity.",
    "shorten": "Shorten aggressively while preserving meaning. Target under 160 characters if possible.",
    "viral": "Make it more viral: stronger hook, high shareability, concrete value, no cringe.",
    "calmer": "Make tone calmer, balanced, and less aggressive while keeping clarity.",
    "punchier": "Add more punch: stronger verbs, higher energy, tighter rhythm.",
}

ENGAGEMENT_MODE_INSTRUCTIONS = {
    "none": "No special engagement-mode behavior.",
    "clickbait_fun": "Use playful click-worthy framing: curiosity gap, bold payoff, fun tone, but keep it honest and specific.",
    "rage_bait_light": "Use light debate-bait framing: present a provocative but defensible take that invites discussion without abuse.",
    "coworker_story": "Write as a fun co-worker/dev-team story with concrete incident + takeaway.",
    "build_drama": "Frame as build/release drama (mistake, tension, fix, lesson) with high narrative momentum.",
    "unpopular_opinion": "Use an unpopular opinion angle and defend it with crisp reasoning.",
}


def _render_structure_rules(req: TweetRequest) -> str:
    if not req.structures:
        return "- No special structure toggles selected."
    lines = []
    for key in req.structures:
        instruction = STRUCTURE_INSTRUCTIONS.get(key)
        if instruction:
            lines.append(f"- {instruction}")
    return "\n".join(lines) if lines else "- No special structure toggles selected."


def build_prompt(req: TweetRequest) -> str:
    structure_rules = _render_structure_rules(req)
    source_text = req.raw_text.strip() if req.raw_text else ""
    topic = (req.topic or "").strip()
    mode = "refine" if source_text else "new"
    refine_rule = REFINE_INSTRUCTIONS.get(req.refine_action, "None")
    engagement_rule = ENGAGEMENT_MODE_INSTRUCTIONS.get(req.engagement_mode, ENGAGEMENT_MODE_INSTRUCTIONS["none"])

    return f"""
Write content for X/Twitter.

Mode: {mode}
Topic: {topic if topic else "none provided"}
Tone: {req.tone}
Length: {req.length}
Structure Toggles: {", ".join(req.structures) if req.structures else "none"}
Refine Action: {refine_rule}
Engagement Mode: {req.engagement_mode}
Engagement Rule: {engagement_rule}
Source Draft:
{source_text if source_text else "none"}

Rules:
- If thread mode is OFF: write one post under 280 characters.
- If thread mode is ON: output only the thread lines and keep each tweet line under 280 characters.
- Human, clear, insightful, specific
- At most 1 emoji
- No hashtags unless asked
- If source draft exists, transform that draft according to Refine Action instead of starting from zero.
- Preserve the original topic/intent unless the Refine Action requires a style shift.
- Keep it safe: no harassment, hate, personal attacks, or fabricated claims.

Structure-specific requirements:
{structure_rules}
"""
