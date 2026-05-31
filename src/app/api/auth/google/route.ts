import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, createOAuthState, isGoogleOAuthConfigured } from "@/lib/auth/google";

export async function GET() {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100"));
  }

  const state = await createOAuthState();
  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
