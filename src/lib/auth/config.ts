import { authProviders } from "@/lib/auth/providers";

export function getEnabledAuthProviders() {
  return authProviders.filter((provider) => provider.enabled);
}
