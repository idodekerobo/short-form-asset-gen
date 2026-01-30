'use client';

import { useState } from 'react';
import { VideoDropzone } from '@/components/VideoDropzone';
import { Card } from '@/components/ui/card';
import { type FileType } from '@/types';

export default function CreatePage() {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceType, setReferenceType] = useState<FileType | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        </div>
      </div>
    </div>
  );
}
