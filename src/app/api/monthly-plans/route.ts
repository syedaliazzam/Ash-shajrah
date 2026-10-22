import { NextResponse } from "next/server";
import { listMonthlyPlansFromDb } from "@/lib/monthly-plans";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const data = await listMonthlyPlansFromDb();
    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
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
