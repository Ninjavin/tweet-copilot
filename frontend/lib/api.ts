function getApiUrl() {
    const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (configured) {
        return configured.replace(/\/+$/, "");
    }

    // Safe fallback if env var is missing
    if (process.env.NODE_ENV === "production") {
        return "https://tweet-copilot-backend.onrender.com";
    }
    return "http://127.0.0.1:8000";
}

const API_URL = getApiUrl();

export type StructureToggle =
    | "thread"
    | "hook_first"
    | "data_backed"
    | "story_format"
    | "contrarian_take"
    | "with_cta"
    | "question_based";

export type RefineAction =
    | "rewrite"
    | "sharper"
    | "shorten"
    | "viral"
    | "calmer"
    | "punchier";

export type GenerateTweetPayload = {
    topic?: string;
    raw_text?: string;
    user_text?: string;
    tone: string;
    length: string;
    model_provider: "gemini" | "openai";
    structures?: StructureToggle[];
    refine_action?: RefineAction;
};

export async function generateTweet(payload: GenerateTweetPayload) {
    const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `Failed to generate tweet (${res.status})`;
        throw new Error(errorMessage);
    }

    return res.json();
}
