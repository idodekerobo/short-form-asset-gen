import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Video, Wand2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Sparkles className="h-16 w-16 text-primary animate-pulse" />
            <Video className="h-8 w-8 text-primary absolute top-4 left-4" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6 tracking-tight">
          Transform Any Video Into Your Creative Vision
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Upload a reference video, add your creative direction, and let AI generate
          stunning short-form content in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/create">
              <Wand2 className="mr-2 h-5 w-5" />
              Get Started
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Upload Reference</h3>
            <p className="text-sm text-muted-foreground">
              Start with a video or image as your creative foundation
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Add Your Vision</h3>
            <p className="text-sm text-muted-foreground">
              Describe your creative direction with simple prompts
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Generate & Download</h3>
            <p className="text-sm text-muted-foreground">
              Get professional short-form videos in minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
