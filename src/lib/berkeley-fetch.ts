const OFFICIAL_USER_AGENT = "CourseMap-Berkeley-Official-Sync/0.3";

export async function fetchBerkeleyHtml(
  sourceUrl: string,
  options?: { retries?: number; baseDelayMs?: number }
): Promise<string> {
  const retries = options?.retries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 200;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(sourceUrl, {
        headers: { "User-Agent": OFFICIAL_USER_AGENT },
        cache: "no-store"
      });

      if (response.ok) {
        return response.text();
      }

      if (response.status >= 500 && attempt < retries) {
        await sleep(baseDelayMs * 2 ** attempt);
        continue;
      }

      throw new Error(`Failed to fetch official Berkeley source: ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        await sleep(baseDelayMs * 2 ** attempt);
        continue;
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch: ${sourceUrl}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
