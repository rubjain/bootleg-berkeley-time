import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionPayload } from "@/lib/auth/session";

export async function requireAdminSession() {
  const session = await getSessionPayload();
  if (!session) {
    return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  if (session.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }
  return { session };
}

export async function requireUserSession() {
  const session = await getSessionPayload();
  if (!session) {
    return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdminPage(): Promise<
  { session: NonNullable<Awaited<ReturnType<typeof getSessionPayload>>> } | { redirect: string }
> {
  const session = await getSessionPayload();
  if (!session) {
    return { redirect: "/login?redirect=/admin/imports" };
  }
  if (session.role !== "ADMIN") {
    return { redirect: "/dashboard?error=admin_required" };
  }
  return { session };
}

export function unauthorizedResponse(request: NextRequest, message = "Authentication required") {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: message }, { status: 401 });
  }
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
