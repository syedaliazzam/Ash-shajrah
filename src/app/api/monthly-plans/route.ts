import { NextResponse } from "next/server";
import { listMonthlyPlansFromDb } from "@/lib/monthly-plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listMonthlyPlansFromDb();
    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Monthly plans API route error:", error);
    return NextResponse.json(
      { error: "Unable to load monthly plans right now." },
      { status: 500 }
    );
  }
}
