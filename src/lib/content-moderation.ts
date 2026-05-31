const blockedWordPatterns = [
  /\bfuck(?:ing|ed|er|ers)?\b/gi,
  /\bshit(?:ty|ting|ted)?\b/gi,
  /\bbitch(?:es)?\b/gi,
  /\basshole(?:s)?\b/gi,
  /\bdick(?:head|heads)?\b/gi,
  /\bbastard(?:s)?\b/gi,
  /\bslut(?:s)?\b/gi,
  /\bwhore(?:s)?\b/gi,
  /\bpiss(?:ed|ing)?\b/gi,
  /\bcrap\b/gi
];

const harassmentPatterns = [
  /\bkill yourself\b/gi,
  /\bkys\b/gi,
  /\bgo die\b/gi
];

function redactMatch(match: string) {
  const trimmed = match.trim();
  if (trimmed.length <= 2) return "[redacted]";
  return `${trimmed.charAt(0)}${"*".repeat(Math.max(trimmed.length - 2, 1))}${trimmed.charAt(trimmed.length - 1)}`;
}

export function sanitizeCommunityText(input: string) {
  let text = input;

  for (const pattern of blockedWordPatterns) {
    text = text.replace(pattern, (match) => redactMatch(match));
  }

  for (const pattern of harassmentPatterns) {
    text = text.replace(pattern, "[removed abusive language]");
  }

  return text.replace(/\s+/g, " ").trim();
}

export function sanitizeCommunityPayload<T extends Record<string, unknown>>(payload: T, textFields: Array<keyof T>) {
  const next = { ...payload };

  for (const field of textFields) {
    const value = next[field];
    if (typeof value === "string") {
      next[field] = sanitizeCommunityText(value) as T[keyof T];
    }
  }

  return next;
}
