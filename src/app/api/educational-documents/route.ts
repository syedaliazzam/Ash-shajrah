import { NextResponse } from "next/server";
import { listEducationalDocumentsFromDb } from "@/lib/educational-documents";

export const runtime = "nodejs";
export const revalidate = 120;

function isTransientDatabaseError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const record = error as {
    code?: string;
    errno?: number;
    message?: string;
  };

  return (
    record.code === "ENOTFOUND" ||
    record.code === "ECONNREFUSED" ||
    record.code === "ETIMEDOUT" ||
    record.code === "EAI_AGAIN" ||
    typeof record.message === "string" && record.message.includes("getaddrinfo")
  );
}

export async function GET() {
  try {
    const documents = await listEducationalDocumentsFromDb();
    return NextResponse.json(
      { data: documents },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Educational documents lookup failed:", error);

    if (isTransientDatabaseError(error)) {
      return NextResponse.json(
        {
          data: [],
          warning: "Curriculum documents are temporarily unavailable.",
        },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Unable to load curriculum documents right now." },
      { status: 500 }
    );
  }
}
