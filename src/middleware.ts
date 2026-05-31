import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session-token";
import { SESSION_COOKIE } from "@/lib/auth/session-constants";

const PROTECTED_PREFIXES = ["/dashboard", "/planner", "/profile", "/friends", "/messages"];
const ADMIN_PREFIX = "/admin";

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAdminPath(pathname: string) {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

function isAdminApiPath(pathname: string) {
  return pathname.startsWith("/api/admin/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const needsAuth = isProtectedPath(pathname);
  const needsAdmin = isAdminPath(pathname) || isAdminApiPath(pathname);

  if ((needsAuth || needsAdmin) && !session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (needsAdmin && session?.role !== "ADMIN") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard?error=admin_required", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/planner/:path*",
    "/profile/:path*",
    "/friends/:path*",
    "/messages/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/plans/:path*",
    "/api/user/:path*",
    "/api/social/:path*"
  ]
};
