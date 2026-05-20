import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  STAFF_COOKIE,
  verifyToken,
} from "@/lib/tokens";

// ---------------------------------------------------------------------------
// Auth gating happens at the route handlers (lib/session, lib/admin-auth).
// The middleware just does a cheap cookie/signature check to redirect early.
// ---------------------------------------------------------------------------

async function hasValidCookie(
  request: NextRequest,
  cookieName: string,
  kind: "admin" | "staff",
  secret: string | undefined
): Promise<boolean> {
  if (!secret || secret.length < 32) return false;
  const token = request.cookies.get(cookieName)?.value;
  return (await verifyToken(token, kind, secret)) !== null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ----- /admin (Mario) -----
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const valid = await hasValidCookie(
      request,
      ADMIN_COOKIE,
      "admin",
      process.env.ADMIN_COOKIE_SECRET
    );

    if (!valid && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (valid && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ----- /dashboard, /perfil, /onboarding (staff) -----
  const isStaffArea =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/onboarding");

  if (isStaffArea) {
    const valid = await hasValidCookie(
      request,
      STAFF_COOKIE,
      "staff",
      process.env.SESSION_SECRET
    );
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/perfil/:path*", "/onboarding/:path*"],
};
