import {
  type Duration,
  type Resolution,
  type TaskStatus,
  type WanModel,
  type WanTaskCreateResponse,
  type WanTaskStatusResponse,
} from "@/types";

// Region-specific base URLs
const REGION_URLS = {
  us: "https://dashscope-us.aliyuncs.com/api/v1",
  intl: "https://dashscope-intl.aliyuncs.com/api/v1",
  cn: "https://dashscope.aliyuncs.com/api/v1",
};

const BASE_URL = REGION_URLS[process.env.DASHSCOPE_REGION as keyof typeof REGION_URLS] || REGION_URLS.us;

function getApiKey(): string {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY environment variable is not set");
  }
  // Trim any whitespace that might have been accidentally added
  return apiKey.trim();
}

export function determineModel(
  hasVideo: boolean,
  hasImages: boolean,
  hasPrompt: boolean,
): WanModel {
  if (hasVideo) {
    return "wan2.6-r2v";
  }
  if (hasImages) {
    return "wan2.6-i2v-flash";
  }
  if (hasPrompt) {
    return "wan2.6-t2v";
  }
  throw new Error("At least one input (video, image, or prompt) is required");
}

interface CreateVideoTaskParams {
  model: WanModel;
  prompt?: string;
  imgUrl?: string;
  videoUrl?: string;
  duration: Duration;
  resolution: Resolution;
}

interface CreateVideoTaskResult {
  taskId: string;
  status: TaskStatus;
}

interface WanRequestBody {
  model: WanModel;
  input: {
    prompt?: string;
    img_url?: string;
    video_url?: string;
  };
  parameters: {
    duration: Duration;
    prompt_extend: boolean;
    watermark: boolean;
    size?: string;
    resolution?: Resolution;
  };
}

function buildRequestBody(params: CreateVideoTaskParams): WanRequestBody {
  const { model, prompt, imgUrl, videoUrl, duration, resolution } = params;

  const body: WanRequestBody = {
    model,
    input: {},
    parameters: {
      duration,
      prompt_extend: true,
      watermark: false,
    },
  };

  if (model === "wan2.6-t2v") {
    body.parameters.size = resolution === "720P" ? "1280*720" : "1920*1080";
  } else {
    body.parameters.resolution = resolution;
  }

  if (prompt) {
    body.input.prompt = prompt;
  }
  if (imgUrl) {
    body.input.img_url = imgUrl;
  }
  if (videoUrl) {
    body.input.video_url = videoUrl;
  }

  return body;
}

export async function createVideoTask(
  params: CreateVideoTaskParams,
): Promise<CreateVideoTaskResult> {
  const requestBody = buildRequestBody(params);
  const apiKey = getApiKey();
  const url = `${BASE_URL}/services/aigc/video-generation/video-synthesis`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('=== WAN API ERROR ===');
    console.error('Error Response:', errorText);
    
    // Try to parse error as JSON for better readability
    try {
      const errorJson = JSON.parse(errorText);
      console.error('Parsed Error:', JSON.stringify(errorJson, null, 2));
    } catch (e) {
      console.error('Raw Error Text:', errorText);
    }
    
    throw new Error(`Wan API error: ${response.status} - ${errorText}`);
  }

  const data: WanTaskCreateResponse = await response.json();

  return {
    taskId: data.output.task_id,
    status: data.output.task_status,
  };
}

interface GetTaskStatusResult {
  status: TaskStatus;
  videoUrl?: string;
  error?: string;
}

export async function getTaskStatus(taskId: string): Promise<GetTaskStatusResult> {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get task status: ${response.status}`);
  }

  const data: WanTaskStatusResponse = await response.json();

  return {
    status: data.output.task_status,
    videoUrl: data.output.video_url,
    error: data.output.message,
  };
}
