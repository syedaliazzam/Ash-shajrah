import { NextResponse } from "next/server";
import { listCurriculumEventsFromDb } from "@/lib/curriculum-events";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const events = await listCurriculumEventsFromDb();
    return NextResponse.json(
      { data: events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
