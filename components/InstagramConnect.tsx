'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Instagram, X, Loader2 } from 'lucide-react';
import type { InstagramMedia } from '@/types/instagram';

interface InstagramConnectProps {
  onVideoSelect: (base64Video: string, metadata: { id: string; caption?: string }) => void;
}

export function InstagramConnect({ onVideoSelect }: InstagramConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/instagram/media?limit=1');
      if (response.ok) {
        setIsConnected(true);
        loadMedia();
      }
    } catch (err) {
      // Not connected
      setIsConnected(false);
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/auth/instagram/connect';
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/auth/instagram/disconnect', { method: 'POST' });
      setIsConnected(false);
      setUsername(null);
      setMedia([]);
    } catch (err) {
      setError('Failed to disconnect');
    }
  };

  const loadMedia = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/instagram/media?limit=12');
      if (!response.ok) throw new Error('Failed to load media');

      const data = await response.json();
      // Filter to only show videos
      const videos = data.data.filter((m: InstagramMedia) => m.media_type === 'VIDEO');
      setMedia(videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVideo = async (mediaId: string) => {
    setSelectedMediaId(mediaId);
    setError(null);

    try {
      const response = await fetch('/api/instagram/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId }),
      });

      if (!response.ok) throw new Error('Failed to download video');

      const data = await response.json();
      onVideoSelect(data.video.base64, {
        id: data.video.id,
        caption: data.video.caption,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download video');
    } finally {
      setSelectedMediaId(null);
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Connect Instagram</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Instagram Business or Creator account to import your videos
            </p>
          </div>
          <Button onClick={handleConnect} size="lg">
            <Instagram className="w-4 h-4 mr-2" />
            Connect Instagram Account
          </Button>
          <p className="text-xs text-muted-foreground">
            Requires Instagram Business or Creator account
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Instagram className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Instagram Videos</h3>
          {username && <span className="text-sm text-muted-foreground">@{username}</span>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleDisconnect}>
          <X className="w-4 h-4 mr-1" />
          Disconnect
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No videos found in your Instagram account
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {media.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectVideo(item.id)}
              disabled={selectedMediaId === item.id}
              className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <img
                src={item.thumbnail_url || item.media_url}
                alt={item.caption || 'Instagram video'}
                className="w-full h-full object-cover"
              />
              {selectedMediaId === item.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
