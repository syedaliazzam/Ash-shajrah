import { NextResponse } from "next/server";
import { listPendingParentInterviewCandidates } from "@/lib/postgres";

export const runtime = "nodejs";

export async function GET() {
  try {
    const candidates = await listPendingParentInterviewCandidates();
    return NextResponse.json({ success: true, candidates });
  } catch (error) {
    console.error("Pending parent interview candidates error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load pending registrations." },
      { status: 500 }
    );
  }
}
