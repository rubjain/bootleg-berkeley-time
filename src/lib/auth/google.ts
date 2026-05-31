import { cookies } from "next/headers";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function isGoogleOAuthConfigured() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(
    clientId &&
      clientSecret &&
      clientId !== "replace-me" &&
      clientSecret !== "replace-me" &&
      process.env.AUTH_GOOGLE_ENABLED === "true"
  );
}

export function getGoogleRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account"
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error("Google token exchange failed");
  }

  return (await response.json()) as { access_token: string };
}

export async function fetchGoogleUserEmail(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error("Google userinfo request failed");
  }

  const payload = (await response.json()) as { email?: string; name?: string };
  if (!payload.email) {
    throw new Error("Google account did not return an email");
  }

  return { email: payload.email.toLowerCase(), name: payload.name ?? payload.email };
}

export async function createOAuthState() {
  const value = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("coursemap_oauth_state", value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600
  });
  return value;
}

export async function verifyOAuthState(state: string) {
  const cookieStore = await cookies();
  const expected = cookieStore.get("coursemap_oauth_state")?.value;
  cookieStore.set("coursemap_oauth_state", "", { path: "/", maxAge: 0 });
  return Boolean(expected && expected === state);
}
