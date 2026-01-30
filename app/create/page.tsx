'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoDropzone } from '@/components/VideoDropzone';
import { PromptInput } from '@/components/PromptInput';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type FileType, type Duration, type Resolution, type GenerateResponse } from '@/types';
import { fileToBase64 } from '@/lib/video-utils';

export default function CreatePage() {
  const router = useRouter();
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceType, setReferenceType] = useState<FileType | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [promptImages, setPromptImages] = useState<File[]>([]);
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

  const handleImageAdd = (file: File): void => {
    setPromptImages((prev) => [...prev, file]);
  };

  const handleImageRemove = (index: number): void => {
    setPromptImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async (): Promise<void> => {
    if (!referenceFile && !prompt) {
      setError('Please provide either a reference file or a text prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const base64Promises: Promise<string>[] = [];

      if (referenceFile) {
        base64Promises.push(fileToBase64(referenceFile));
      }

      promptImages.forEach((image) => {
        base64Promises.push(fileToBase64(image));
      });

      const base64Results = await Promise.all(base64Promises);

      let refBase64: string | undefined;
      let promptImageBase64: string[] = [];

      if (referenceFile) {
        refBase64 = base64Results[0];
        promptImageBase64 = base64Results.slice(1);
      } else {
        promptImageBase64 = base64Results;
      }

      const requestBody: {
        duration: Duration;
        resolution: Resolution;
        prompt?: string;
        referenceVideoBase64?: string;
        referenceImageBase64?: string[];
      } = {
        duration: 10,
        resolution: '720P',
      };

      if (prompt) {
        requestBody.prompt = prompt;
      }

      if (referenceFile && referenceType === 'video') {
        requestBody.referenceVideoBase64 = refBase64;
      } else if (referenceFile && referenceType === 'image') {
        requestBody.referenceImageBase64 = [refBase64!];
      }

      if (promptImageBase64.length > 0) {
        requestBody.referenceImageBase64 = [
          ...(requestBody.referenceImageBase64 || []),
          ...promptImageBase64,
        ];
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: GenerateResponse = await response.json();
      router.push(`/generate/${data.taskId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video');
      setIsGenerating(false);
    }
  };

  const canGenerate = referenceFile !== null || prompt.trim().length > 0;

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

          <Card className="p-6">
            <PromptInput
              prompt={prompt}
              onChange={setPrompt}
              onImageAdd={handleImageAdd}
              onImageRemove={handleImageRemove}
              images={promptImages}
            />
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
          >
            {isGenerating ? 'Creating...' : 'Generate Video'}
          </Button>
        </div>
      </div>
    </div>
  );
}
