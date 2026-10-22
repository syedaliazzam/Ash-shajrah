import { NextResponse } from "next/server";
import { listPublicEventsFromDb } from "@/lib/public-events-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const events = await listPublicEventsFromDb();
    return NextResponse.json(events, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Public events database route error:", error);
    return NextResponse.json(
      { error: "Unable to load public events right now." },
      { status: 500 }
    );
  }
}
