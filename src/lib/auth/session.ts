import { cookies } from "next/headers";
import { DEMO_ACCOUNTS, isAllowedDemoEmail, SESSION_COOKIE, AUTH_PROVIDER_COOKIE } from "@/lib/auth/session-constants";
import { createSessionToken, verifySessionToken, SESSION_MAX_AGE_SECONDS, type SessionPayload } from "@/lib/auth/session-token";
import { prisma } from "@/lib/prisma";

export { SESSION_COOKIE, AUTH_PROVIDER_COOKIE, DEMO_ACCOUNTS, isAllowedDemoEmail };

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return await verifySessionToken(token);
}

export async function getSessionEmail(): Promise<string | null> {
  const payload = await getSessionPayload();
  return payload?.email ?? null;
}

/** Returns the signed-in user email, or null when unauthenticated. */
export async function getActiveUserEmail(): Promise<string | null> {
  return getSessionEmail();
}

export async function resolveUserRole(email: string): Promise<"USER" | "ADMIN"> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    });
    return user?.role ?? "USER";
  } catch {
    return email === process.env.ADMIN_EMAIL || email === "student@berkeley.edu" ? "ADMIN" : "USER";
  }
}

export function buildSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}

export async function createSessionForEmail(email: string) {
  const role = await resolveUserRole(email);
  return await createSessionToken({ email, role });
}

export async function upsertAuthAccount(input: {
  email: string;
  provider: "EMAIL" | "GOOGLE" | "BERKELEY_MOCK" | "CALNET_CAS";
  providerAccountId: string;
  name?: string;
}) {
  try {
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: {
        name: input.name ?? undefined,
        authProvider: input.provider
      },
      create: {
        email: input.email,
        name: input.name,
        authProvider: input.provider,
        role: input.email === process.env.ADMIN_EMAIL || input.email === "student@berkeley.edu" ? "ADMIN" : "USER"
      }
    });

    await prisma.authAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: input.provider,
          providerAccountId: input.providerAccountId
        }
      },
      update: {
        userId: user.id
      },
      create: {
        userId: user.id,
        provider: input.provider,
        providerAccountId: input.providerAccountId
      }
    });

    return user;
  } catch {
    return null;
  }
}
