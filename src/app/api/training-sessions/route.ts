import { NextResponse } from "next/server";
import { listTrainingSessionVideosFromDb } from "@/lib/training-sessions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const videos = await listTrainingSessionVideosFromDb();

    return NextResponse.json(
      { data: videos },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching training sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch training sessions" },
      { status: 500 }
    );
  }
}
