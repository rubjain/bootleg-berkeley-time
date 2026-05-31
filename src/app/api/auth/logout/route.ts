import { NextResponse } from "next/server";
import { AUTH_PROVIDER_COOKIE, SESSION_COOKIE } from "@/lib/auth/session-constants";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  response.cookies.set(AUTH_PROVIDER_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  response.cookies.set("coursemap_user_name", "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
