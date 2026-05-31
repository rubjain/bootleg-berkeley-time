"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/badge";

type CommunityImportResponse =
  | {
      imported: {
        sourceName: string;
        schoolSlug: string;
        importedReviews: string[];
        importedPosts: string[];
        skippedRows: string[];
      };
    }
  | { error: string };

function hasImportedResult(
  result: CommunityImportResponse | null
): result is Extract<CommunityImportResponse, { imported: unknown }> {
  return Boolean(result && "imported" in result);
}

export function CommunityEvidenceImportForm() {
  const [sourceName, setSourceName] = useState("Reviewed Reddit/forum snapshot");
  const [raw, setRaw] = useState(
    "course_code,source_kind,source_url,professor_name,title,body,difficulty_rating,workload_rating,usefulness_rating,recommendation_rating,tags,advice\nCOMPSCI 61A,Reddit,https://reddit.com/example,Jennifer Wang,Students say projects are intense,\"The projects are hard as hell but incredibly rewarding if you start early.\",4,5,5,5,PROJECT_HEAVY|CONCEPTUALLY_HARD,Start early every week."
  );
  const [result, setResult] = useState<CommunityImportResponse | null>(null);
  const [pending, startTransition] = useTransition();
  const imported = hasImportedResult(result) ? result.imported : undefined;

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#19212f]">Community evidence import</h2>
          <p className="mt-2 text-sm leading-6 text-[#4b5668]">
            Paste reviewed Reddit or forum snapshots to add sourced community evidence under courses. Imported text is automatically filtered for inappropriate language before it is stored.
          </p>
        </div>
        <Badge tone="official">Language filtered</Badge>
      </div>

      <input
        value={sourceName}
        onChange={(event) => setSourceName(event.target.value)}
        className="mt-4 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
      />
      <textarea
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        className="mt-3 min-h-64 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const response = await fetch("/api/admin/berkeley/import-community-evidence", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sourceName,
                raw
              })
            });

            const payload = (await response.json()) as CommunityImportResponse;
            setResult(payload);
          })
        }
        className="mt-3 rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white"
      >
        {pending ? "Importing..." : "Import community evidence"}
      </button>

      {imported ? (
        <div className="mt-4 rounded-2xl border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] p-4 text-sm text-[#2f4f4c]">
          <p className="font-semibold">
            Imported {imported.importedReviews.length} reviews and {imported.importedPosts.length} discussion posts
          </p>
          {imported.skippedRows.length ? <p className="mt-2">Skipped: {imported.skippedRows.join(", ")}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
