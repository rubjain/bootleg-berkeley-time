import { NextRequest, NextResponse } from "next/server";
import { createSignedInResponse } from "@/lib/auth/sign-in-response";
import { resolveSignInEmail } from "@/lib/auth/resolve-user";
import {
  exchangeGoogleCode,
  fetchGoogleUserEmail,
  isGoogleOAuthConfigured,
  verifyOAuthState
} from "@/lib/auth/google";

export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", base));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL(`/login?error=${oauthError}`, base));
  }

  if (!code || !state || !(await verifyOAuthState(state))) {
    return NextResponse.redirect(new URL("/login?error=invalid_oauth_state", base));
  }

  try {
    const token = await exchangeGoogleCode(code);
    const googleUser = await fetchGoogleUserEmail(token.access_token);
    const email = await resolveSignInEmail(googleUser.email);

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=unknown_account", base));
    }

    return await createSignedInResponse({
      email,
      provider: "google",
      requestOrigin: base
    });
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", base));
  }
}
