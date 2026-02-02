"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { generateTweet } from "@/lib/api";

export default function TweetForm() {
    const [model, setModel] = useState<"gemini" | "openai">("gemini")
    const [input, setInput] = useState("");
    const [tone, setTone] = useState("Professional");
    const [length, setLength] = useState("Short");
    const [tweet, setTweet] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleGenerate() {
        try {
            setLoading(true);
            const res = await generateTweet({
                topic: input,
                tone,
                length,
                model_provider: model
            });
            setTweet(res.tweet);
        } catch (e) {
            setTweet("Something went wrong 😬");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <Textarea
                placeholder="Enter a topic, idea, or rough thought…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <div className="flex gap-3">
                {/* Model Selector */}
                <Select value={model} onValueChange={(v) => setModel(v as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gemini">Gemini</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                        <SelectValue placeholder="Tone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Gen-Z">Gen-Z</SelectItem>
                        <SelectItem value="Mentor">Mentor</SelectItem>
                        <SelectItem value="Spicy">Spicy</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={length} onValueChange={setLength}>
                    <SelectTrigger>
                        <SelectValue placeholder="Length" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Short">Short</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Long">Long</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleGenerate} disabled={loading}>
                {loading ? "Cooking…" : "Generate Tweet"}
            </Button>

            {tweet && (
                <div className="rounded-md border bg-muted p-4 text-sm whitespace-pre-wrap">
                    {tweet}
                </div>
            )}
        </div>
    );
}
