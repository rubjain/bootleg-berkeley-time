import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AuthProviderKey } from "@/lib/auth/providers";
import { DEMO_ACCOUNTS, AUTH_PROVIDER_COOKIE, isAllowedDemoEmail } from "@/lib/auth/session-constants";
import { buildSessionCookie, createSessionForEmail, upsertAuthAccount } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  provider: z.enum(["email", "google", "berkeley-mock", "calnet-cas"]).optional()
});

const PROVIDER_MAP = {
  email: "EMAIL",
  google: "GOOGLE",
  "berkeley-mock": "BERKELEY_MOCK",
  "calnet-cas": "CALNET_CAS"
} as const;

export async function POST(request: NextRequest) {
  const payload = loginSchema.parse(await request.json());

  if (!isAllowedDemoEmail(payload.email)) {
    return NextResponse.json({ error: "Unknown demo account" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found in database. Run npm run prisma:seed first." }, { status: 404 });
  }

  const provider: AuthProviderKey = payload.provider ?? "email";
  await upsertAuthAccount({
    email: payload.email,
    provider: PROVIDER_MAP[provider],
    providerAccountId: payload.email,
    name: user.name ?? undefined
  });

  const account = DEMO_ACCOUNTS.find((item) => item.email === payload.email)!;
  const token = await createSessionForEmail(payload.email);
  const response = NextResponse.json({
    email: account.email,
    name: account.name
  });

  response.cookies.set(buildSessionCookie(token));

  response.cookies.set(AUTH_PROVIDER_COOKIE, provider, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  return response;
}
