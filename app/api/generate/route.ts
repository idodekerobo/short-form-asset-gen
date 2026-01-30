import { NextRequest, NextResponse } from "next/server";
import { createVideoTask, determineModel } from "@/lib/wan-api";
import { expandPrompt } from "@/lib/prompt-expander";
import {
  type GenerateRequest,
  type GenerateResponse,
  isValidDuration,
  isValidResolution,
} from "@/types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<GenerateResponse | { error: string }>> {
  try {
    const body: GenerateRequest = await request.json();

    const {
      referenceVideoBase64,
      referenceImageBase64,
      prompt = "",
      duration = 10,
      resolution = "720P",
    } = body;

    if (!isValidDuration(duration)) {
      return NextResponse.json(
        { error: "Invalid duration. Must be 5, 10, or 15 seconds." },
        { status: 400 },
      );
    }

    if (!isValidResolution(resolution)) {
      return NextResponse.json(
        { error: "Invalid resolution. Must be 720P or 1080P." },
        { status: 400 },
      );
    }

    if (!referenceVideoBase64 && !referenceImageBase64?.length && !prompt) {
      return NextResponse.json(
        { error: "At least one input (video, image, or prompt) is required." },
        { status: 400 },
      );
    }

    const model = determineModel(
      !!referenceVideoBase64,
      !!referenceImageBase64?.length,
      !!prompt,
    );

    const expandedPrompt = prompt
      ? expandPrompt(prompt, !!referenceVideoBase64 || !!referenceImageBase64?.length)
      : undefined;

    const result = await createVideoTask({
      model,
      prompt: expandedPrompt,
      imgUrl: referenceImageBase64?.[0],
      videoUrl: referenceVideoBase64,
      duration,
      resolution,
    });

    const response: GenerateResponse = {
      taskId: result.taskId,
      status: result.status,
      estimatedTime: 180,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
