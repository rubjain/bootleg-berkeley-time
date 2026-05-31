import { NextRequest, NextResponse } from "next/server";
import {
  buildCalNetLoginUrl,
  createCalNetOAuthState,
  isCalNetEnabled,
  isCalNetPreviewMode,
  isCalNetProductionConfigured
} from "@/lib/auth/calnet";

export async function GET(request: NextRequest) {
  if (!isCalNetEnabled()) {
    return NextResponse.redirect(new URL("/login?error=calnet_not_configured", request.nextUrl.origin));
  }

  if (isCalNetPreviewMode()) {
    return NextResponse.redirect(new URL("/login/calnet", request.nextUrl.origin));
  }

  if (!isCalNetProductionConfigured()) {
    return NextResponse.redirect(new URL("/login?error=calnet_not_configured", request.nextUrl.origin));
  }

  const state = await createCalNetOAuthState();
  const loginUrl = new URL(buildCalNetLoginUrl());
  loginUrl.searchParams.set("state", state);
  return NextResponse.redirect(loginUrl.toString());
}
