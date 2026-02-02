import TweetForm from "@/components/tweet/TweetForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">
            Tweet Copilot 🐦
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate clean, tweet-worthy thoughts for devs.
          </p>
        </CardHeader>
        <CardContent>
          <TweetForm />
        </CardContent>
      </Card>
    </main>
  );
}
