'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoDropzone } from '@/components/VideoDropzone';
import { PromptInput } from '@/components/PromptInput';
import { SettingsPanel } from '@/components/SettingsPanel';
import { InstagramConnect } from '@/components/InstagramConnect';
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
  const [duration, setDuration] = useState<Duration>(10);
  const [resolution, setResolution] = useState<Resolution>('720P');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [instagramVideo, setInstagramVideo] = useState<string | null>(null);

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

  const handleInstagramVideoSelect = (base64Video: string, metadata: { id: string; caption?: string }): void => {
    setInstagramVideo(base64Video);
    // Clear any existing reference file since we're using Instagram video
    setReferenceFile(null);
    setReferenceType(null);
    // Optionally pre-fill the prompt with the caption
    if (metadata.caption && !prompt) {
      setPrompt(metadata.caption);
    }
    setError(null);
  };

  const handleGenerate = async (): Promise<void> => {
    if (!referenceFile && !instagramVideo && !prompt) {
      setError('Please provide either a reference file, Instagram video, or a text prompt');
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
        duration,
        resolution,
      };

      if (prompt) {
        requestBody.prompt = prompt;
      }

      // Use Instagram video if available, otherwise use uploaded file
      if (instagramVideo) {
        requestBody.referenceVideoBase64 = instagramVideo;
      } else if (referenceFile && referenceType === 'video') {
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

  const canGenerate = referenceFile !== null || instagramVideo !== null || prompt.trim().length > 0;

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
            <h2 className="text-xl font-semibold mb-4">Or Import from Instagram</h2>
            <InstagramConnect onVideoSelect={handleInstagramVideoSelect} />
            {instagramVideo && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Instagram video selected</p>
                <p className="text-xs text-muted-foreground mt-1">Ready to generate</p>
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

          <SettingsPanel
            duration={duration}
            resolution={resolution}
            onDurationChange={setDuration}
            onResolutionChange={setResolution}
          />

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
