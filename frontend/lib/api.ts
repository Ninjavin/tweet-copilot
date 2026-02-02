export type GenerateTweetPayload = {
    topic?: string;
    user_text?: string;
    tone: string;
    length: string;
};

export async function generateTweet(payload: GenerateTweetPayload) {
    const res = await fetch("http://localhost:8000/api/generate", {
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
