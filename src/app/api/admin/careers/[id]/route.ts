import { NextRequest, NextResponse } from "next/server";
import {
  getCareerApplicationById,
  toAdminCareerApplication,
  updateCareerApplication,
} from "@/lib/career-db";
import { isCareerStatus, type CareerStatus } from "@/lib/careers";
import { requireAdminFromRequest } from "@/lib/lms-admin-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!(await requireAdminFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const application = await getCareerApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      application: toAdminCareerApplication(application),
    });
  } catch (error) {
    console.error("Admin career get error:", error);
    return NextResponse.json({ error: "Failed to load application." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await requireAdminFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: string;
      adminNotes?: string | null;
    };

    if (body.status !== undefined && !isCareerStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const application = await updateCareerApplication(id, {
      status: body.status as CareerStatus | undefined,
      adminNotes: body.adminNotes,
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      application: toAdminCareerApplication(application),
    });
  } catch (error) {
    console.error("Admin career patch error:", error);
    return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
  }
}
