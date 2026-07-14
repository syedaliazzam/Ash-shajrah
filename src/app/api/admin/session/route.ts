import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/lms-admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const ok = await requireAdminSession();
  if (!ok) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
