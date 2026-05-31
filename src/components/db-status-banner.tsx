import { checkDatabaseHealth } from "@/lib/db-health";

export async function DbStatusBanner() {
  const databaseOk = await checkDatabaseHealth();
  const mockFallbackEnabled =
    process.env.NODE_ENV === "development" && process.env.ALLOW_MOCK_FALLBACK === "true";

  if (databaseOk) {
    return null;
  }

  return (
    <div className="border-b border-[rgba(201,111,74,0.25)] bg-[rgba(201,111,74,0.12)] px-4 py-3 text-center text-sm text-[#6f4038]">
      Database unavailable.{" "}
      {mockFallbackEnabled
        ? "Showing limited mock data because ALLOW_MOCK_FALLBACK=true."
        : "Configure DATABASE_URL and run npm run prisma:migrate && npm run prisma:seed."}
    </div>
  );
}
