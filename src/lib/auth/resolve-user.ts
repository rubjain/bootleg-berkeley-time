import { isAllowedDemoEmail } from "@/lib/auth/session-constants";
import { prisma } from "@/lib/prisma";

export async function resolveSignInEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  if (isAllowedDemoEmail(normalized)) {
    return normalized;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    return user ? normalized : null;
  } catch {
    return isAllowedDemoEmail(normalized) ? normalized : null;
  }
}
