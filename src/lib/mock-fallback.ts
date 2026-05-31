/** When true, read paths may fall back to in-memory mock data if the database is unavailable. */
export function allowMockFallback() {
  return process.env.NODE_ENV === "development" && process.env.ALLOW_MOCK_FALLBACK === "true";
}
