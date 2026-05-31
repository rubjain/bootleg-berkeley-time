import { NextRequest, NextResponse } from "next/server";
import { createSignedInResponse } from "@/lib/auth/sign-in-response";
import { resolveSignInEmail } from "@/lib/auth/resolve-user";
import {
  isCalNetEnabled,
  validateCalNetTicket,
  verifyCalNetOAuthState
} from "@/lib/auth/calnet";

export async function GET(request: NextRequest) {
  const base = request.nextUrl.origin;

  if (!isCalNetEnabled()) {
    return NextResponse.redirect(new URL("/login?error=calnet_not_configured", base));
  }

  const ticket = request.nextUrl.searchParams.get("ticket");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL(`/login?error=${oauthError}`, base));
  }

  if (!ticket) {
    return NextResponse.redirect(new URL("/login?error=calnet_missing_ticket", base));
  }

  if (state && !(await verifyCalNetOAuthState(state))) {
    return NextResponse.redirect(new URL("/login?error=invalid_oauth_state", base));
  }

  try {
    const calnetUser = await validateCalNetTicket(ticket);
    const email = await resolveSignInEmail(calnetUser.email);

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=unknown_account", base));
    }

    return await createSignedInResponse({
      email,
      provider: "calnet-cas",
      requestOrigin: base
    });
  } catch {
    return NextResponse.redirect(new URL("/login?error=calnet_auth_failed", base));
  }
}
