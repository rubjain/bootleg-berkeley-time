import { getActiveUserEmail } from "@/lib/auth/session";

export { DEMO_USER_EMAIL } from "@/lib/demo-user-constants";

/** Resolves the signed-in user email. Requires an authenticated session (enforced by middleware on protected routes). */
export async function getDemoUserEmail() {
  const email = await getActiveUserEmail();
  if (!email) {
    throw new Error("Authentication required");
  }
  return email;
}

/** Returns the signed-in user email when available, otherwise null. */
export async function getOptionalUserEmail() {
  return getActiveUserEmail();
}
