'use client';

import { useCallback } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { Upload, FileVideo, Image } from 'lucide-react';
import { type FileType } from '@/types';
import { getFileType, isValidFileSize, formatFileSize } from '@/lib/video-utils';

interface VideoDropzoneProps {
  onFileSelect: (file: File, type: FileType) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  accept?: Accept;
}

export function VideoDropzone({
  onFileSelect,
  onError,
  maxSizeMB = 50,
  accept = {
    'video/*': ['.mp4', '.webm', '.mov'],
    'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
  },
}: VideoDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        onError?.('Invalid file type. Please upload a video or image file.');
        return;
      }

      const file = acceptedFiles[0];

      if (!file) {
        onError?.('No file selected');
        return;
      }

      if (!isValidFileSize(file, maxSizeMB)) {
        onError?.(
          `File too large. Maximum size is ${maxSizeMB}MB. Your file is ${formatFileSize(
            file.size
          )}`
        );
        return;
      }

      try {
        const type = getFileType(file);
        onFileSelect(file, type);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Invalid file type');
      }
    },
    [onFileSelect, onError, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-primary hover:bg-accent/50"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <>
            <Upload className="h-12 w-12 text-primary animate-bounce" />
            <p className="text-lg font-medium">Drop your file here</p>
          </>
        ) : (
          <>
            <div className="flex gap-4">
              <FileVideo className="h-12 w-12 text-muted-foreground" />
              <Image className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium mb-2">Drag and drop or click to upload</p>
              <p className="text-sm text-muted-foreground">
                Supports videos (MP4, WebM) and images (JPG, PNG)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size: {maxSizeMB}MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
