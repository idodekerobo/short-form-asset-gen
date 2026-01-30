'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoDropzone } from '@/components/VideoDropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type FileType, type Duration, type Resolution, type GenerateResponse } from '@/types';
import { fileToBase64 } from '@/lib/video-utils';

export default function CreatePage() {
  const router = useRouter();
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceType, setReferenceType] = useState<FileType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleFileSelect = (file: File, type: FileType): void => {
    setReferenceFile(file);
    setReferenceType(type);
    setError(null);
  };

  const handleError = (errorMessage: string): void => {
    setError(errorMessage);
    setReferenceFile(null);
    setReferenceType(null);
  };

  const handleGenerate = async (): Promise<void> => {
    if (!referenceFile || !referenceType) {
      setError('Please select a file first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const base64 = await fileToBase64(referenceFile);

      const requestBody = {
        duration: 10 as Duration,
        resolution: '720P' as Resolution,
      };

      if (referenceType === 'video') {
        Object.assign(requestBody, { referenceVideoBase64: base64 });
      } else {
        Object.assign(requestBody, { referenceImageBase64: [base64] });
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GenerateResponse = await response.json();
      router.push(`/generate/${data.taskId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Create Your Video</h1>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reference Source</h2>
            <VideoDropzone onFileSelect={handleFileSelect} onError={handleError} />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            {referenceFile && referenceType && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected {referenceType}:</p>
                <p className="text-sm text-muted-foreground">{referenceFile.name}</p>
              </div>
            )}
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={!referenceFile || isGenerating}
          >
            {isGenerating ? 'Creating...' : 'Generate Video'}
          </Button>
        </div>
      </div>
    </div>
  );
}
