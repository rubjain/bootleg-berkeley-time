export type AuthProviderKey = "email" | "google" | "berkeley-mock" | "calnet-cas";

export type AuthProviderConfig = {
  key: AuthProviderKey;
  label: string;
  enabled: boolean;
  description: string;
};

export function getEnabledAuthProviders() {
  return authProviders.filter((provider) => provider.enabled);
}

export const authProviders: AuthProviderConfig[] = [
  {
    key: "email",
    label: "Email and password",
    enabled: process.env.AUTH_EMAIL_ENABLED === "true",
    description: "Phase 1 mock-ready local auth pathway."
  },
  {
    key: "google",
    label: "Google",
    enabled: process.env.AUTH_GOOGLE_ENABLED === "true",
    description: "Google sign-in placeholder for future OAuth wiring."
  },
  {
    key: "berkeley-mock",
    label: "Sign in with Berkeley",
    enabled: process.env.AUTH_BERKELEY_MOCK_ENABLED === "true",
    description: "Mock Berkeley-branded entry point that will later map to CalNet CAS."
  },
  {
    key: "calnet-cas",
    label: "CalNet",
    enabled: process.env.AUTH_CALNET_ENABLED === "true",
    description:
      process.env.CALNET_CAS_BASE_URL?.includes("berkeley.edu") && !process.env.CALNET_CAS_BASE_URL?.includes("future")
        ? "Berkeley Central Authentication Service (CAS)."
        : "Preview CalNet flow with mock tickets until production CAS is configured."
  }
];
