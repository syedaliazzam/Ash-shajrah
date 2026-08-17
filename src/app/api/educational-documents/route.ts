import { NextResponse } from "next/server";
import { listEducationalDocumentsFromDb } from "@/lib/educational-documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const documents = await listEducationalDocumentsFromDb();
    return NextResponse.json(
      { data: documents },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Educational documents lookup failed:", error);
    return NextResponse.json(
      { error: "Unable to load curriculum documents right now." },
      { status: 500 }
    );
  }
}
