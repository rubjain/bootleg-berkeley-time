import { prisma } from "@/lib/prisma";

let cachedStatus: { ok: boolean; checkedAt: number } | null = null;
const CACHE_TTL_MS = 15_000;

export async function checkDatabaseHealth(): Promise<boolean> {
  const now = Date.now();
  if (cachedStatus && now - cachedStatus.checkedAt < CACHE_TTL_MS) {
    return cachedStatus.ok;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    cachedStatus = { ok: true, checkedAt: now };
    return true;
  } catch {
    cachedStatus = { ok: false, checkedAt: now };
    return false;
  }
}

export function clearDatabaseHealthCache() {
  cachedStatus = null;
}
