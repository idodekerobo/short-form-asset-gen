import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * Load FFmpeg.wasm once and cache the instance
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (ffmpegInstance) {
      return ffmpegInstance;
    }
  }

  isLoading = true;

  try {
    const ffmpeg = new FFmpeg();

    // Load from CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } finally {
    isLoading = false;
  }
}

/**
 * Get video duration in seconds
 */
async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Trim video to first N seconds using FFmpeg.wasm
 */
export async function trimVideoToSeconds(
  file: File,
  maxSeconds: number
): Promise<{ file: File; wasTrimmed: boolean }> {
  try {
    // Check duration first
    const duration = await getVideoDuration(file);

    if (duration <= maxSeconds) {
      return { file, wasTrimmed: false };
    }

    // Load FFmpeg
    const ffmpeg = await loadFFmpeg();

    // Write input file
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Trim to first N seconds
    await ffmpeg.exec([
      '-i',
      inputName,
      '-t',
      maxSeconds.toString(),
      '-c',
      'copy',
      outputName,
    ]);

    // Read output file
    const data = await ffmpeg.readFile(outputName);
    // FileData can be Uint8Array or string, we need Uint8Array for video
    const uint8Data = data instanceof Uint8Array ? data : new Uint8Array();
    // Convert to regular ArrayBuffer to satisfy TypeScript - cast to ArrayBuffer
    const arrayBuffer = uint8Data.buffer.slice(uint8Data.byteOffset, uint8Data.byteOffset + uint8Data.byteLength) as ArrayBuffer;
    const trimmedBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
    const trimmedFile = new File([trimmedBlob], file.name, { type: 'video/mp4' });

    // Cleanup
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    return { file: trimmedFile, wasTrimmed: true };
  } catch (error) {
    console.error('Error trimming video:', error);
    throw new Error('Failed to trim video. Please try a shorter video.');
  }
}
