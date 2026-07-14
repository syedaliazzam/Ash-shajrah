import { NextRequest, NextResponse } from "next/server";
import {
  clearAdminSessionCookie,
  isAdminAuthConfigured,
  setAdminSessionCookie,
  validateAdminPassword,
} from "@/lib/lms-admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "LMS admin password is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    if (!body.password || !validateAdminPassword(body.password)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    await setAdminSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearAdminSessionCookie(response);
  return response;
}
