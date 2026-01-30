import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus } from "@/lib/wan-api";
import { type StatusResponse, type TaskStatus } from "@/types";

interface RouteContext {
  params: Promise<{
    taskId: string;
  }>;
}

function calculateProgress(status: TaskStatus): number {
  switch (status) {
    case "PENDING":
      return 10;
    case "RUNNING":
      return 50;
    case "SUCCEEDED":
      return 100;
    case "FAILED":
    case "UNKNOWN":
      return 0;
    default:
      return 0;
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<StatusResponse | { error: string }>> {
  try {
    const { taskId } = await context.params;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const status = await getTaskStatus(taskId);
    const progress = calculateProgress(status.status);

    const response: StatusResponse = {
      taskId,
      status: status.status,
      videoUrl: status.videoUrl,
      error: status.error,
      progress,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
