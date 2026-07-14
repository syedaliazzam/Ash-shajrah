import { NextRequest, NextResponse } from "next/server";
import { getCareerResumeById } from "@/lib/career-db";
import { requireAdminFromRequest } from "@/lib/lms-admin-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!(await requireAdminFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const resume = await getCareerResumeById(id);
    if (!resume) {
      return NextResponse.json({ error: "Resume file not found." }, { status: 404 });
    }

    const disposition =
      request.nextUrl.searchParams.get("download") === "1"
        ? "attachment"
        : "inline";

    const headers = new Headers();
    headers.set(
      "Content-Type",
      resume.resumeMimeType || "application/octet-stream"
    );
    headers.set(
      "Content-Disposition",
      `${disposition}; filename="${resume.resumeFileName.replace(/"/g, "")}"`
    );
    headers.set("Content-Length", String(resume.resumeFileData.length));
    headers.set("Cache-Control", "private, no-store");

    return new NextResponse(new Uint8Array(resume.resumeFileData), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Admin resume download error:", error);
    return NextResponse.json({ error: "Failed to fetch resume." }, { status: 500 });
  }
}
