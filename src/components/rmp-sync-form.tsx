"use client";

import { useState, useTransition } from "react";

export function RmpSyncForm() {
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runSync() {
    setResult(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/rmp/sync", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as
        | { scanned: number; synced: number; skipped: number; errors?: string[]; error?: string }
        | null;

      if (!response.ok) {
        setResult(payload?.error ?? "Sync failed");
        return;
      }

      setResult(
        `Scanned ${payload?.scanned ?? 0} instructors · synced ${payload?.synced ?? 0} · skipped ${payload?.skipped ?? 0}${
          payload?.errors?.length ? ` · ${payload.errors.length} error(s)` : ""
        }`
      );
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#19212f]">Sync Rate My Professors to database</h2>
      <p className="mt-2 text-sm leading-6 text-[#6a7383]">
        Fetches live RMP ratings for seeded instructors and stores them in ProfessorRating. Also persists matched RMP professor IDs on Instructor records.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={runSync}
        className="mt-4 rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f] disabled:opacity-60"
      >
        {pending ? "Syncing…" : "Run RMP sync"}
      </button>
      {result ? <p className="mt-3 text-sm text-[#2f6f6a]">{result}</p> : null}
    </div>
  );
}
