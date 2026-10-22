import { NextResponse } from "next/server";
import { listPublicEventsFromDb } from "@/lib/public-events-db";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const events = await listPublicEventsFromDb();
    return NextResponse.json(events, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
