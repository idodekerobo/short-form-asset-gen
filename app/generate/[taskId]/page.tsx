'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { GenerationProgress } from '@/components/GenerationProgress';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { type StatusResponse } from '@/types';

interface GeneratePageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default function GeneratePage({ params }: GeneratePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const taskId = resolvedParams.taskId;
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const pollStatus = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/status/${taskId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StatusResponse = await response.json();

        if (!mounted) return;

        setStatus(data);
        setError(null);

        if (data.status !== 'SUCCEEDED' && data.status !== 'FAILED') {
          timeoutId = setTimeout(pollStatus, 5000);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
      }
    };

    pollStatus();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [taskId]);

  if (!status && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error || status?.status === 'FAILED') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Generation Failed</h2>
          <p className="text-muted-foreground">
            {error || status?.error || 'An unknown error occurred'}
          </p>
          <Button onClick={() => router.push('/create')}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (status.status === 'SUCCEEDED' && status.videoUrl) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8 text-center">Your Video is Ready!</h1>
          <VideoPlayer
            videoUrl={status.videoUrl}
            onGenerateAnother={() => router.push('/create')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl w-full px-6">
        {status && <GenerationProgress progress={status.progress} />}
      </div>
    </div>
  );
}
