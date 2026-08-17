import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeStoragePath(value: string) {
  const decoded = decodeURIComponent(value.trim());
  const withoutLeadingSlash = decoded.replace(/^\/+/, "");

  if (withoutLeadingSlash.startsWith("storage/v1/object/public/")) {
    return withoutLeadingSlash.replace(/^storage\/v1\/object\/public\//, "");
  }

  return withoutLeadingSlash;
}

function buildSupabaseStorageUrl(path: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ||
    process.env.SUPABASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    return null;
  }

  const normalized = normalizeStoragePath(path);
  return `${baseUrl}/storage/v1/object/public/${normalized.replace(/^\/+/, "")}`;
}

export async function GET(request: NextRequest) {
  const rawPath = request.nextUrl.searchParams.get("path");

  if (!rawPath) {
    return NextResponse.json(
      { error: "Missing file path." },
      { status: 400 }
    );
  }

  try {
    const fileUrl = buildSupabaseStorageUrl(rawPath);

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Supabase public URL is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Accept: "application/pdf,application/octet-stream,*/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "File not found." },
        { status: response.status }
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/pdf";
    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'inline; filename="curriculum-document.pdf"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to preview requested file." },
      { status: 400 }
    );
  }
}
