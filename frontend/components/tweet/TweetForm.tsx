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
import {
    generateTweet,
    type RefineAction,
    type StructureToggle,
} from "@/lib/api";
import { Check, Columns3, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MAX_TWEET_CHARS = 280;

const TRENDING_HOOKS = [
    "The biggest mistake engineers make is ___",
    "Everyone is optimizing the wrong metric in engineering teams.",
    "Most devs don’t need more tools. They need better defaults.",
    "If your roadmap feels chaotic, this is probably why.",
    "A hard truth about scaling teams no one likes to say out loud.",
];

const HIGH_PERFORMING_FORMATS = [
    "Hot take -> Why it matters -> What to do next",
    "Problem -> Root cause -> Fix in 3 steps",
    "Before vs After with one concrete lesson",
    "Myth -> Reality -> Practical takeaway",
    "Mistake -> Consequence -> Better approach",
];

const EXAMPLE_TEMPLATES = [
    "I used to think ___. Now I think ___.",
    "3 things I wish I knew before building ___.",
    "If I had to learn ___ again, I’d do this:",
    "Steal this framework for ___:",
    "Unpopular opinion: ___. Here’s why.",
];

const STRUCTURE_OPTIONS: { key: StructureToggle; label: string }[] = [
    { key: "hook_first", label: "🪝 Hook-first format" },
    { key: "data_backed", label: "📊 Data-backed style" },
    { key: "story_format", label: "🧠 Story format" },
    { key: "contrarian_take", label: "🧪 Contrarian take" },
    { key: "with_cta", label: "🔁 With CTA" },
    { key: "question_based", label: "💬 Question-based" },
];

const REFINE_ACTIONS: { key: RefineAction; label: string }[] = [
    { key: "rewrite", label: "🔄 Rewrite" },
    { key: "sharper", label: "🪄 Make sharper" },
    { key: "shorten", label: "✂ Shorten" },
    { key: "viral", label: "📈 Make more viral" },
    { key: "calmer", label: "🧊 Make calmer" },
    { key: "punchier", label: "🔥 Add more punch" },
];

const FUN_ENGAGEMENT_MODES = [
    "clickbait_fun",
    "rage_bait_light",
    "coworker_story",
    "build_drama",
    "unpopular_opinion",
] as const;

const FUN_AUTO_TOPICS = [
    "A hilarious co-worker story from a sprint planning disaster",
    "A rage-bait but defensible hot take about engineering productivity",
    "A click-baity lesson from a broken production deploy",
    "A funny build pipeline incident that taught a real lesson",
    "An unpopular opinion about code reviews that sparks discussion",
];

function splitLongTextToThread(text: string): string[] {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return [];

    const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
        if (!current) {
            if (sentence.length <= MAX_TWEET_CHARS) {
                current = sentence;
            } else {
                const words = sentence.split(" ");
                let longPart = "";
                for (const word of words) {
                    const next = longPart ? `${longPart} ${word}` : word;
                    if (next.length > MAX_TWEET_CHARS) {
                        if (longPart) chunks.push(longPart);
                        longPart = word;
                    } else {
                        longPart = next;
                    }
                }
                if (longPart) chunks.push(longPart);
            }
            continue;
        }

        const next = `${current} ${sentence}`.trim();
        if (next.length <= MAX_TWEET_CHARS) {
            current = next;
        } else {
            chunks.push(current);
            if (sentence.length <= MAX_TWEET_CHARS) {
                current = sentence;
            } else {
                const words = sentence.split(" ");
                let longPart = "";
                for (const word of words) {
                    const candidate = longPart ? `${longPart} ${word}` : word;
                    if (candidate.length > MAX_TWEET_CHARS) {
                        if (longPart) chunks.push(longPart);
                        longPart = word;
                    } else {
                        longPart = candidate;
                    }
                }
                current = longPart;
            }
        }
    }

    if (current) chunks.push(current);
    return chunks.filter(Boolean);
}

function buildThreadSegments(text: string, threadMode: boolean): string[] {
    const cleaned = text.trim();
    if (!cleaned) return [];

    const numberedLines = cleaned
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /^\d+\/\s*/.test(line))
        .map((line) => line.replace(/^\d+\/\s*/, "").trim());

    if (numberedLines.length >= 2) return numberedLines;

    const paragraphs = cleaned
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean);
    if (paragraphs.length >= 2) return paragraphs;

    if (threadMode || cleaned.length > MAX_TWEET_CHARS) {
        const split = splitLongTextToThread(cleaned);
        if (split.length > 1) return split;
    }

    return [cleaned];
}

export default function TweetForm() {
    const [model, setModel] = useState<"gemini" | "openai">("openai")
    const [input, setInput] = useState("");
    const [lastPrompt, setLastPrompt] = useState("");
    const [tone, setTone] = useState("Professional");
    const [length, setLength] = useState("Short");
    const [structures, setStructures] = useState<StructureToggle[]>([]);
    const [threadMode, setThreadMode] = useState(false);
    const [variants, setVariants] = useState<string[]>([]);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [compareView, setCompareView] = useState(true);
    const [threadDraftByVariant, setThreadDraftByVariant] = useState<Record<number, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [refining, setRefining] = useState<RefineAction | null>(null);
    const [suggestionsSeed, setSuggestionsSeed] = useState(0);
    const [showIdeas, setShowIdeas] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [ideaCategory, setIdeaCategory] = useState<"hooks" | "formats" | "templates">("hooks");

    function toggleStructure(key: StructureToggle) {
        setStructures((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
        );
    }

    async function handleGenerate() {
        try {
            setLoading(true);
            const promptToUse = input.trim();
            if (!promptToUse) {
                return;
            }
            const requestStructures = threadMode
                ? Array.from(new Set<StructureToggle>([...structures, "thread"]))
                : structures;
            const res = await generateTweet({
                topic: promptToUse,
                tone,
                length,
                model_provider: model,
                structures: requestStructures,
                engagement_mode: "none",
            });
            const nextVariants = Array.isArray(res.variants) && res.variants.length > 0
                ? res.variants
                : [res.tweet].filter(Boolean);
            setVariants(nextVariants);
            setSelectedVariantIndex(0);
            setCompareView(nextVariants.length > 1);
            setThreadDraftByVariant({});
            setLastPrompt(promptToUse);
        } catch {
            setVariants(["Something went wrong 😬"]);
            setSelectedVariantIndex(0);
            setCompareView(false);
            setThreadDraftByVariant({});
        } finally {
            setLoading(false);
        }
    }

    async function handleRefine(action: RefineAction) {
        if (!activeTweet) {
            return;
        }
        const topicToUse = input.trim() || lastPrompt;
        try {
            setRefining(action);
            const requestStructures = threadMode
                ? Array.from(new Set<StructureToggle>([...structures, "thread"]))
                : structures;
            const res = await generateTweet({
                topic: topicToUse || undefined,
                raw_text: activeTweet,
                tone,
                length,
                model_provider: model,
                structures: requestStructures,
                refine_action: action,
                engagement_mode: "none",
            });
            const nextVariants = Array.isArray(res.variants) && res.variants.length > 0
                ? res.variants
                : [res.tweet].filter(Boolean);
            setVariants(nextVariants);
            setSelectedVariantIndex(0);
            setCompareView(nextVariants.length > 1);
            setThreadDraftByVariant({});
            if (topicToUse) {
                setLastPrompt(topicToUse);
            }
        } catch {
            toast.error("Failed to refine. Try again.");
        } finally {
            setRefining(null);
        }
    }

    async function handleCopy() {
        if (activeTweet) {
            try {
                const textToCopy =
                    threadMode && currentThreadSegments.length > 1
                        ? currentThreadSegments
                            .map((segment, index) => `${index + 1}/${currentThreadSegments.length} ${segment}`)
                            .join("\n\n")
                        : activeTweet;
                await navigator.clipboard.writeText(textToCopy);
                toast.success("Tweet copied to clipboard.");
            } catch {
                toast.error("Failed to copy tweet to clipboard.");
            }
        }
    }

    async function handleAutoGenerateFun() {
        try {
            setLoading(true);
            const randomTopic = FUN_AUTO_TOPICS[Math.floor(Math.random() * FUN_AUTO_TOPICS.length)];
            const randomMode = FUN_ENGAGEMENT_MODES[Math.floor(Math.random() * FUN_ENGAGEMENT_MODES.length)];
            const requestStructures = threadMode
                ? Array.from(new Set<StructureToggle>([...structures, "thread"]))
                : structures;
            const res = await generateTweet({
                topic: randomTopic,
                tone: "Gen-Z",
                length,
                model_provider: model,
                structures: requestStructures,
                engagement_mode: randomMode,
            });
            const nextVariants = Array.isArray(res.variants) && res.variants.length > 0
                ? res.variants
                : [res.tweet].filter(Boolean);
            setVariants(nextVariants);
            setSelectedVariantIndex(0);
            setCompareView(nextVariants.length > 1);
            setThreadDraftByVariant({});
            setLastPrompt(randomTopic);
            toast.success("Generated a quirky engagement post.");
        } catch {
            toast.error("Failed to auto-generate fun post.");
        } finally {
            setLoading(false);
        }
    }

    const activeTweet = variants[selectedVariantIndex] || "";
    const autoThreadSegments = buildThreadSegments(activeTweet, threadMode);
    const currentThreadSegments = threadDraftByVariant[selectedVariantIndex] ?? autoThreadSegments;
    const tweetLength = activeTweet.length;
    const isNearLimit = tweetLength > MAX_TWEET_CHARS * 0.8;
    const isOverLimit = tweetLength > MAX_TWEET_CHARS;
    const isThreadBuilderVisible = threadMode || currentThreadSegments.length > 1;

    function pickSuggestions(pool: string[]) {
        const start = suggestionsSeed % pool.length;
        return [pool[start], pool[(start + 1) % pool.length], pool[(start + 2) % pool.length]];
    }

    function applySuggestion(text: string) {
        setInput(text);
    }

    const suggestionPool =
        ideaCategory === "hooks"
            ? TRENDING_HOOKS
            : ideaCategory === "formats"
                ? HIGH_PERFORMING_FORMATS
                : EXAMPLE_TEMPLATES;

    return (
        <div className="space-y-4 pt-3 sm:pt-4">
            <div className="space-y-1">
                <p className="text-sm font-semibold">What should this post be about?</p>
                <p className="text-xs text-muted-foreground">
                    Add your topic, audience, or angle. The more context you give, the better the output.
                </p>
            </div>
            <Textarea
                placeholder="Drop your topic, take, or shower thought..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[110px] rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/20 bg-background/70"
            />
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => setShowIdeas((prev) => !prev)}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium bg-background/70 border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                    🧠 {showIdeas ? "Hide ideas" : "Need ideas?"}
                </button>
                <button
                    type="button"
                    onClick={() => setThreadMode((prev) => !prev)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        threadMode
                            ? "bg-cyan-500/15 border-cyan-500/40 text-foreground"
                            : "bg-background/70 border-border text-muted-foreground hover:text-foreground"
                    }`}
                >
                    🧵 {threadMode ? "Thread mode on" : "Thread mode"}
                </button>
                <button
                    type="button"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium bg-background/70 border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                    ⚙ {showAdvanced ? "Hide options" : "Advanced options"}
                </button>
            </div>
            {showIdeas && (
                <div className="rounded-xl border bg-background/60 p-3 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">Need ideas?</p>
                        <button
                            type="button"
                            onClick={() => setSuggestionsSeed((prev) => prev + 1)}
                            className="text-xs text-cyan-600 hover:text-cyan-500"
                        >
                            Refresh
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setIdeaCategory("hooks")}
                            className={`rounded-full border px-3 py-1 text-[11px] ${ideaCategory === "hooks" ? "bg-cyan-500/15 border-cyan-500/40" : "bg-background/70 border-border text-muted-foreground"}`}
                        >
                            Trending hooks
                        </button>
                        <button
                            type="button"
                            onClick={() => setIdeaCategory("formats")}
                            className={`rounded-full border px-3 py-1 text-[11px] ${ideaCategory === "formats" ? "bg-cyan-500/15 border-cyan-500/40" : "bg-background/70 border-border text-muted-foreground"}`}
                        >
                            High-performing formats
                        </button>
                        <button
                            type="button"
                            onClick={() => setIdeaCategory("templates")}
                            className={`rounded-full border px-3 py-1 text-[11px] ${ideaCategory === "templates" ? "bg-cyan-500/15 border-cyan-500/40" : "bg-background/70 border-border text-muted-foreground"}`}
                        >
                            Example templates
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {pickSuggestions(suggestionPool).map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => applySuggestion(item)}
                                className="rounded-full border px-3 py-1.5 text-xs font-medium bg-background/70 border-border text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {showAdvanced && (
                <div className="rounded-xl border bg-background/60 p-3 sm:p-4 space-y-3">
                    <div className="flex gap-3 flex-wrap">
                        <Select value={model} onValueChange={(v) => setModel(v as "gemini" | "openai")}>
                            <SelectTrigger className="transition-all duration-200 hover:scale-[1.02]">
                                <SelectValue placeholder="Select AI model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini">Gemini</SelectItem>
                                <SelectItem value="openai">OpenAI</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="transition-all duration-200 hover:scale-[1.02]">
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
                            <SelectTrigger className="transition-all duration-200 hover:scale-[1.02]">
                                <SelectValue placeholder="Length" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Short">Short</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Long">Long</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Optional structure toggles</p>
                        <div className="flex flex-wrap gap-2">
                            {STRUCTURE_OPTIONS.map((option) => {
                                const active = structures.includes(option.key);
                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => toggleStructure(option.key)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                            active
                                                ? "bg-cyan-500/15 border-cyan-500/40 text-foreground"
                                                : "bg-background/70 border-border text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <Button
                onClick={handleGenerate}
                disabled={loading || !input.trim()}
                className="w-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-sky-600"
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <Sparkles className="size-4 animate-pulse" />
                        Cooking...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Sparkles className="size-4" />
                        Generate Post
                    </span>
                )}
            </Button>
            <Button
                type="button"
                variant="outline"
                onClick={handleAutoGenerateFun}
                disabled={loading}
                className="w-full"
            >
                🎲 Auto-generate fun post
            </Button>

            {activeTweet && (
                <div className="relative rounded-xl border-2 p-5 shadow-lg transition-all duration-300 hover:shadow-xl animate-slide-up bg-gradient-to-br from-cyan-500/5 via-card to-emerald-500/5 border-cyan-500/20">
                    <div className="flex items-center justify-between mb-4 gap-3">
                        <p className="text-xs text-muted-foreground">
                            {variants.length > 1 ? `${variants.length} variants generated` : "1 variant generated"}
                        </p>
                        <div className="flex items-center gap-2">
                            {variants.length > 1 && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setCompareView((prev) => !prev)}
                                    className="h-8 rounded-full"
                                >
                                    <Columns3 className="size-3.5" />
                                    {compareView ? "Single View" : "Compare View"}
                                </Button>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopy}
                                        className="transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                        aria-label="Copy tweet"
                                    >
                                        <Copy className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy selected variant</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    {compareView && variants.length > 1 ? (
                        <div className="grid gap-3 md:grid-cols-3">
                            {variants.map((variant, index) => {
                                const selected = selectedVariantIndex === index;
                                return (
                                    <div
                                        key={`${variant}-${index}`}
                                        className={`rounded-lg border p-3 transition-colors ${
                                            selected ? "border-cyan-500/50 bg-cyan-500/10" : "border-border bg-background/70"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                Variant {index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedVariantIndex(index)}
                                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${
                                                    selected
                                                        ? "border-cyan-500/50 bg-cyan-500/15 text-foreground"
                                                        : "border-border text-muted-foreground"
                                                }`}
                                            >
                                                {selected ? (
                                                    <>
                                                        <Check className="size-3" />
                                                        Selected
                                                    </>
                                                ) : (
                                                    "Use this"
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[108px]">
                                            {variant}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-2">
                                            {variant.length} chars
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <>
                            {isThreadBuilderVisible ? (
                                <div className="space-y-3">
                                    {currentThreadSegments.map((segment, index) => (
                                        <div key={`${selectedVariantIndex}-${index}`} className="rounded-lg border bg-background/70 p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {index + 1}/{currentThreadSegments.length}
                                                </span>
                                                <span className={`text-[11px] ${segment.length > MAX_TWEET_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                                                    {segment.length}/{MAX_TWEET_CHARS}
                                                </span>
                                            </div>
                                            <Textarea
                                                value={segment}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setThreadDraftByVariant((prev) => {
                                                        const current = prev[selectedVariantIndex] ?? [...currentThreadSegments];
                                                        const next = [...current];
                                                        next[index] = value;
                                                        return { ...prev, [selectedVariantIndex]: next };
                                                    });
                                                }}
                                                className="min-h-[88px] resize-y bg-background/80 border"
                                            />
                                            {index < currentThreadSegments.length - 1 && (
                                                <div className="mt-2 border-t border-dashed border-border/70" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap break-words">
                                    {activeTweet}
                                </p>
                            )}
                        </>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className={`text-sm font-medium transition-colors duration-200 ${isOverLimit
                            ? "text-destructive"
                            : isNearLimit
                                ? "text-orange-500 dark:text-orange-400"
                                : "text-muted-foreground"
                            }`}>
                            {tweetLength} / {MAX_TWEET_CHARS} characters
                        </span>
                        {isOverLimit && (
                            <button
                                type="button"
                                onClick={() => setThreadMode(true)}
                                className="text-xs text-destructive font-medium px-2 py-0.5 bg-destructive/10 rounded"
                            >
                                Over limit, switch to thread
                            </button>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Iterate this draft</p>
                        <div className="flex flex-wrap gap-2">
                            {REFINE_ACTIONS.map((action) => {
                                const active = refining === action.key;
                                return (
                                    <button
                                        key={action.key}
                                        type="button"
                                        onClick={() => handleRefine(action.key)}
                                        disabled={!!refining}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                                            active
                                                ? "bg-cyan-500/15 border-cyan-500/40 text-foreground"
                                                : "bg-background/70 border-border text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
