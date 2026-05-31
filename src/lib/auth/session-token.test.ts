import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session-token";

describe("session-token", () => {
  it("creates and verifies a signed session token", async () => {
    process.env.SESSION_SECRET = "test-secret";
    const token = await createSessionToken({ email: "student@berkeley.edu", role: "ADMIN" });
    const payload = await verifySessionToken(token);
    expect(payload?.email).toBe("student@berkeley.edu");
    expect(payload?.role).toBe("ADMIN");
  });

  it("rejects tampered tokens", async () => {
    process.env.SESSION_SECRET = "test-secret";
    const token = await createSessionToken({ email: "student@berkeley.edu", role: "USER" });
    const tampered = `${token}x`;
    expect(await verifySessionToken(tampered)).toBeNull();
  });
});

describe("health fixtures", () => {
  it("loads berkeley home fixture for offline parser tests", () => {
    const html = readFileSync(join(process.cwd(), "berkeley-home.html"), "utf8");
    expect(html.includes("catalog")).toBe(true);
  });
});
