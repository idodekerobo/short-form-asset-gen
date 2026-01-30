'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  onGenerateAnother: () => void;
}

export function VideoPlayer({ videoUrl, onGenerateAnother }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = async (): Promise<void> => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('Failed to download video. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full rounded-lg shadow-lg"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      <div className="flex gap-4 justify-center">
        <Button onClick={handleDownload} size="lg">
          <Download className="mr-2 h-4 w-4" /> Download Video
        </Button>
        <Button variant="outline" onClick={onGenerateAnother} size="lg">
          <RotateCcw className="mr-2 h-4 w-4" /> Generate Another
        </Button>
      </div>
    </div>
  );
}
