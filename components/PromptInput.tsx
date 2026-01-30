'use client';

import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';
import { formatFileSize } from '@/lib/video-utils';

interface PromptInputProps {
  prompt: string;
  onChange: (prompt: string) => void;
  onImageAdd: (file: File) => void;
  onImageRemove: (index: number) => void;
  images: File[];
  maxImages?: number;
}

export function PromptInput({
  prompt,
  onChange,
  onImageAdd,
  onImageRemove,
  images,
  maxImages = 3,
}: PromptInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && images.length < maxImages) {
      onImageAdd(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="prompt">Steering Prompt (optional)</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Describe how you want to transform the video... e.g., 'Make it vintage with sepia tones' or 'Focus on the product with cinematic lighting'"
          rows={4}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Reference Images (optional)</Label>
        <div className="mt-2 space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= maxImages}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Add Reference Images ({images.length}/{maxImages})
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {images.map((image, index) => (
                <div key={image.name} className="relative group">
                  <div className="border rounded-lg p-2 bg-muted">
                    <p className="text-xs truncate">{image.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onImageRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
