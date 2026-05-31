import { checkDatabaseHealth } from "@/lib/db-health";

export async function GET() {
  const database = await checkDatabaseHealth();

  return Response.json({
    status: database ? "ok" : "degraded",
    database,
    mockFallbackEnabled: process.env.NODE_ENV === "development" && process.env.ALLOW_MOCK_FALLBACK === "true"
  });
}
