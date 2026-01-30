'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { type ProgressMessage } from '@/types';

const PROGRESS_MESSAGES: readonly ProgressMessage[] = [
  { message: 'Uploading your content...', duration: 3000 },
  { message: 'Analyzing reference video style...', duration: 8000 },
  { message: 'Extracting visual elements...', duration: 10000 },
  { message: 'Crafting your creative prompt...', duration: 8000 },
  { message: 'Generating video frames...', duration: 45000 },
  { message: 'Composing audio track...', duration: 15000 },
  { message: 'Rendering final video...', duration: 20000 },
  { message: 'Almost there...', duration: 60000 },
] as const;

interface GenerationProgressProps {
  progress: number;
}

export function GenerationProgress({ progress }: GenerationProgressProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);

  useEffect(() => {
    if (currentMessageIndex >= PROGRESS_MESSAGES.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentMessageIndex((prev) =>
        Math.min(prev + 1, PROGRESS_MESSAGES.length - 1)
      );
    }, PROGRESS_MESSAGES[currentMessageIndex].duration);

    return () => clearTimeout(timer);
  }, [currentMessageIndex]);

  const currentMessage = PROGRESS_MESSAGES[currentMessageIndex];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">{currentMessage.message}</h2>
        <p className="text-muted-foreground">Estimated time: ~3 minutes</p>
      </div>
      <Progress value={progress} className="w-full" />
      <p className="text-center text-sm text-muted-foreground">{progress}% complete</p>
    </div>
  );
}
