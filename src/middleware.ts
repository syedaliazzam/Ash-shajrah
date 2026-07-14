import { NextRequest, NextResponse } from "next/server";
import {
  LMS_ADMIN_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/lms-admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/lms/admin") &&
    !pathname.startsWith("/lms/admin/login")
  ) {
    const token = request.cookies.get(LMS_ADMIN_COOKIE)?.value;
    if (!(await verifyAdminSessionToken(token))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/lms/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lms/admin/:path*"],
};
