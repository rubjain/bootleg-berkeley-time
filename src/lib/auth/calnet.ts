import { cookies } from "next/headers";

const PREVIEW_TICKET_PREFIX = "mock:";

export function isCalNetEnabled() {
  return process.env.AUTH_CALNET_ENABLED === "true";
}

export function isCalNetProductionConfigured() {
  const base = process.env.CALNET_CAS_BASE_URL;
  return Boolean(
    isCalNetEnabled() &&
      base &&
      !base.includes("future-integration") &&
      base.startsWith("http")
  );
}

export function isCalNetPreviewMode() {
  return isCalNetEnabled() && !isCalNetProductionConfigured();
}

export function getCalNetCallbackUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";
  return `${base.replace(/\/$/, "")}/api/auth/calnet/callback`;
}

export function buildCalNetLoginUrl() {
  const base = process.env.CALNET_CAS_BASE_URL!.replace(/\/$/, "");
  const service = encodeURIComponent(getCalNetCallbackUrl());
  return `${base}/cas/login?service=${service}`;
}

export function buildPreviewCalNetTicket(email: string) {
  return `${PREVIEW_TICKET_PREFIX}${email}`;
}

export function isPreviewCalNetTicket(ticket: string) {
  return ticket.startsWith(PREVIEW_TICKET_PREFIX);
}

export async function validateCalNetTicket(ticket: string) {
  if (isPreviewCalNetTicket(ticket)) {
    const email = ticket.slice(PREVIEW_TICKET_PREFIX.length).trim().toLowerCase();
    if (!email.includes("@")) {
      throw new Error("Invalid preview CalNet ticket");
    }
    return { email, name: email.split("@")[0] };
  }

  const base = process.env.CALNET_CAS_BASE_URL!.replace(/\/$/, "");
  const service = encodeURIComponent(getCalNetCallbackUrl());
  const response = await fetch(
    `${base}/cas/serviceValidate?service=${service}&ticket=${encodeURIComponent(ticket)}`,
    { headers: { Accept: "application/xml" } }
  );

  if (!response.ok) {
    throw new Error("CalNet ticket validation failed");
  }

  const xml = await response.text();
  const emailMatch = xml.match(/<cas:user>([^<]+)<\/cas:user>/i) ?? xml.match(/<user>([^<]+)<\/user>/i);
  const email = emailMatch?.[1]?.trim().toLowerCase();

  if (!email) {
    throw new Error("CalNet response did not include a user");
  }

  return { email, name: email.split("@")[0] };
}

export async function createCalNetOAuthState() {
  const value = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("coursemap_calnet_state", value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600
  });
  return value;
}

export async function verifyCalNetOAuthState(state: string) {
  const cookieStore = await cookies();
  const expected = cookieStore.get("coursemap_calnet_state")?.value;
  cookieStore.set("coursemap_calnet_state", "", { path: "/", maxAge: 0 });
  return Boolean(expected && expected === state);
}
