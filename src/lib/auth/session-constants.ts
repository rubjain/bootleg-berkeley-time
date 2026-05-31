export const SESSION_COOKIE = "coursemap_session";
export const AUTH_PROVIDER_COOKIE = "coursemap_auth_provider";

export const DEMO_ACCOUNTS = [
  { email: "student@berkeley.edu", name: "Alex Student", hint: "Data Science major · primary demo account" },
  { email: "maya@berkeley.edu", name: "Maya Chen", hint: "Friend profile with social activity" },
  { email: "jordan@berkeley.edu", name: "Jordan Lee", hint: "Alternate student planner" },
  { email: "zoe@berkeley.edu", name: "Zoe Patel", hint: "Alternate student planner" },
  { email: "lucas@berkeley.edu", name: "Lucas Kim", hint: "Alternate student planner" }
] as const;

export function isAllowedDemoEmail(email: string) {
  return DEMO_ACCOUNTS.some((account) => account.email === email);
}
