const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type GenerateTweetPayload = {
    topic?: string;
    user_text?: string;
    tone: string;
    length: string;
    model_provider: "gemini" | "openai"
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
        throw new Error("Failed to generate tweet");
    }

    return res.json();
}
