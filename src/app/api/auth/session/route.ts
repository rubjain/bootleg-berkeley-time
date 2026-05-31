import { AUTH_PROVIDER_COOKIE, DEMO_ACCOUNTS, getSessionPayload } from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function GET() {
  const payload = await getSessionPayload();

  if (!payload) {
    return Response.json({ signedIn: false });
  }

  const account = DEMO_ACCOUNTS.find((item) => item.email === payload.email);
  const cookieStore = await cookies();
  const provider = cookieStore.get(AUTH_PROVIDER_COOKIE)?.value;

  return Response.json({
    signedIn: true,
    email: payload.email,
    name: account?.name ?? payload.email.split("@")[0],
    provider: provider ?? "email",
    role: payload.role
  });
}
