import { NextResponse } from "next/server";
import { listPublicEventsFromDb } from "@/lib/public-events-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await listPublicEventsFromDb();
    return NextResponse.json(events, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
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
