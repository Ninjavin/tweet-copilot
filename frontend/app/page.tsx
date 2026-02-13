"use client";

import TweetForm from "@/components/tweet/TweetForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Bolt, WandSparkles } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <main className="product-shell style-genz min-h-screen p-4 sm:p-6 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none product-glow" />

      <div className="relative z-20 mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/75 backdrop-blur px-3 py-1.5 text-xs font-semibold tracking-wide">
            <WandSparkles className="size-3.5 product-accent" />
            Tweet Copilot
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <section className="mb-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-3">
              Ship Better Tweets, Faster.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Turn rough thoughts into scroll-stopping posts in seconds with a focused, iterative writing flow.
            </p>
          </div>
        </section>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Card className="w-full border shadow-xl bg-card/90 backdrop-blur-xl transition-all duration-500 rounded-t-none">
          <CardHeader className="pb-4 border-b bg-card/80">
            <div className="flex items-start gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl border bg-background/80 flex items-center justify-center">
                  <Bolt className="size-5 product-accent" />
                </div>
                <div>
                  <CardTitle className="font-display text-xl sm:text-2xl tracking-tight">
                    Compose Your Tweet
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Focused workspace: draft, compare, refine.
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3 pb-8 sm:pt-4 sm:pb-10">
            <TweetForm />
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </main>
  );
}
