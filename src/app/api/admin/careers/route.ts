import { NextRequest, NextResponse } from "next/server";
import {
  listCareerApplications,
  toAdminCareerApplication,
} from "@/lib/career-db";
import { requireAdminFromRequest } from "@/lib/lms-admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await requireAdminFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const applications = await listCareerApplications({
      status: searchParams.get("status") || undefined,
      interestedRole: searchParams.get("interestedRole") || undefined,
      source: searchParams.get("source") || undefined,
      search: searchParams.get("search") || undefined,
    });

    return NextResponse.json({
      applications: applications.map(toAdminCareerApplication),
    });
  } catch (error) {
    console.error("Admin careers list error:", error);
    return NextResponse.json(
      { error: "Failed to load career applications." },
      { status: 500 }
    );
  }
}
