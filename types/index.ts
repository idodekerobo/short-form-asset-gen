// Wan API Models
export type WanModel = 'wan2.6-t2v' | 'wan2.6-i2v' | 'wan2.6-i2v-flash' | 'wan2.6-r2v';

// Task Status from Wan API
export type TaskStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';

// Video Settings
export type Resolution = '720P' | '1080P';
export type Duration = 5 | 10 | 15;

// File Types
export type FileType = 'video' | 'image';

// API Request/Response Types
export interface GenerateRequest {
  referenceVideoBase64?: string;
  referenceImageBase64?: string[];
  prompt?: string;
  duration: Duration;
  resolution: Resolution;
}

export interface GenerateResponse {
  taskId: string;
  status: TaskStatus;
  estimatedTime?: number;
}

export interface StatusResponse {
  taskId: string;
  status: TaskStatus;
  videoUrl?: string;
  error?: string;
  progress: number;
}

// UI Component Types
export interface ProgressMessage {
  message: string;
  duration: number;
}

// Wan API Response Types (for internal use)
export interface WanTaskCreateResponse {
  output: {
    task_id: string;
    task_status: TaskStatus;
  };
  request_id: string;
}

export interface WanTaskStatusResponse {
  output: {
    task_id: string;
    task_status: TaskStatus;
    video_url?: string;
    submit_time?: string;
    scheduled_time?: string;
    end_time?: string;
    code?: string;
    message?: string;
  };
  request_id: string;
}

// Type Guards
export function isValidDuration(value: unknown): value is Duration {
  return value === 5 || value === 10 || value === 15;
}

export function isValidResolution(value: unknown): value is Resolution {
  return value === '720P' || value === '1080P';
}

export function isValidFileType(value: unknown): value is FileType {
  return value === 'video' || value === 'image';
}
