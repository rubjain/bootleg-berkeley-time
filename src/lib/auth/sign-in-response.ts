import { NextResponse } from "next/server";
import type { AuthProviderKey } from "@/lib/auth/providers";
import { AUTH_PROVIDER_COOKIE, DEMO_ACCOUNTS } from "@/lib/auth/session-constants";
import { buildSessionCookie, createSessionForEmail, upsertAuthAccount } from "@/lib/auth/session";

const PROVIDER_MAP = {
  email: "EMAIL",
  google: "GOOGLE",
  "berkeley-mock": "BERKELEY_MOCK",
  "calnet-cas": "CALNET_CAS"
} as const;

export async function createSignedInResponse(input: {
  email: string;
  provider: AuthProviderKey;
  redirectPath?: string;
  requestOrigin: string;
}) {
  const account = DEMO_ACCOUNTS.find((item) => item.email === input.email);
  await upsertAuthAccount({
    email: input.email,
    provider: PROVIDER_MAP[input.provider],
    providerAccountId: input.email,
    name: account?.name
  });

  const token = await createSessionForEmail(input.email);
  const response = NextResponse.redirect(new URL(input.redirectPath ?? "/dashboard", input.requestOrigin));

  response.cookies.set(buildSessionCookie(token));

  response.cookies.set(AUTH_PROVIDER_COOKIE, input.provider, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  if (account?.name) {
    response.cookies.set("coursemap_user_name", account.name, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });
  }

  return response;
}
