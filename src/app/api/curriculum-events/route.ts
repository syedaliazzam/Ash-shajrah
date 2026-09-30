import { NextResponse } from "next/server";
import { listCurriculumEventsFromDb } from "@/lib/curriculum-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await listCurriculumEventsFromDb();
    return NextResponse.json(
      { data: events },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Curriculum events database route error:", error);
    return NextResponse.json(
      { error: "Unable to load curriculum events right now." },
      { status: 500 }
    );
  }
}
