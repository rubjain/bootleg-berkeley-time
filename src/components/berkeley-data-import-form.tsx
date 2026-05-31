"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/badge";

type SnapshotImportResponse =
  | {
      imported: {
        sourceName: string;
        schoolSlug: string;
        importedCount: number;
        createdInstructors: string[];
        updatedRows?: string[];
        updatedRatings?: string[];
        skippedRows: string[];
      };
    }
  | { error: string };

function hasImportedResult(
  result: SnapshotImportResponse | null
): result is Extract<SnapshotImportResponse, { imported: unknown }> {
  return Boolean(result && "imported" in result);
}

export function BerkeleyDataImportForm() {
  const [gradeSourceName, setGradeSourceName] = useState("Manual Berkeley grades snapshot");
  const [gradeRaw, setGradeRaw] = useState("course_code,term_code,instructor_name,average_gpa,total_students,A,B,C,D,F\nCOMPSCI 61A,2024-FALL,Jennifer Wang,3.22,1678,32,36,20,7,5");
  const [ratingSourceName, setRatingSourceName] = useState("RateMyProfessors snapshot");
  const [ratingRaw, setRatingRaw] = useState("instructor_name,department_code,rating,average_difficulty,review_count,summary,source_url\nJennifer Wang,COMPSCI,4.5,4.2,126,Students praise clarity and strong exam prep.,https://www.ratemyprofessors.com/");
  const [gradeResult, setGradeResult] = useState<SnapshotImportResponse | null>(null);
  const [ratingResult, setRatingResult] = useState<SnapshotImportResponse | null>(null);
  const [pending, startTransition] = useTransition();

  const importedGrades = hasImportedResult(gradeResult) ? gradeResult.imported : undefined;
  const importedRatings = hasImportedResult(ratingResult) ? ratingResult.imported : undefined;

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#19212f]">Bulk grade and professor imports</h2>
      <p className="mt-2 text-sm leading-6 text-[#4b5668]">
        Paste CSV, TSV, or JSON snapshots to import grade distributions and professor ratings into Prisma. This is the safe path for bringing in third-party rating data after you review or export it.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-[#19212f]">Grade distributions</h3>
            <Badge tone="official">CSV, TSV, or JSON</Badge>
          </div>
          <input
            value={gradeSourceName}
            onChange={(event) => setGradeSourceName(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm outline-none"
          />
          <p className="mt-3 text-xs leading-5 text-[#6a7383]">
            Expected columns (header names are normalized): <span className="font-medium">course_code</span> (must
            match an existing catalog <span className="font-medium">Course.code</span>, e.g. COMPSCI 61A),{" "}
            <span className="font-medium">term_code</span> or term, optional <span className="font-medium">instructor_name</span>,{" "}
            <span className="font-medium">average_gpa</span>, <span className="font-medium">total_students</span>, and
            letter buckets <span className="font-medium">A,B,C,D,F</span> (counts or percentages depending on your export).
          </p>
          <textarea
            value={gradeRaw}
            onChange={(event) => setGradeRaw(event.target.value)}
            className="mt-3 min-h-56 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const response = await fetch("/api/admin/berkeley/import-grade-distributions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sourceName: gradeSourceName,
                    raw: gradeRaw
                  })
                });

                const payload = (await response.json()) as SnapshotImportResponse;
                setGradeResult(payload);
              })
            }
            className="mt-3 rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white"
          >
            {pending ? "Importing..." : "Import grade snapshot"}
          </button>

          {importedGrades ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
              <p className="font-semibold">{importedGrades.importedCount} grade rows imported</p>
              {importedGrades.createdInstructors.length ? <p className="mt-2">Created instructors: {importedGrades.createdInstructors.join(", ")}</p> : null}
              {importedGrades.skippedRows.length ? <p className="mt-2">Skipped: {importedGrades.skippedRows.join(", ")}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-[#19212f]">Professor ratings snapshots</h3>
            <Badge>Manual review first</Badge>
          </div>
          <input
            value={ratingSourceName}
            onChange={(event) => setRatingSourceName(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm outline-none"
          />
          <textarea
            value={ratingRaw}
            onChange={(event) => setRatingRaw(event.target.value)}
            className="mt-3 min-h-56 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const response = await fetch("/api/admin/berkeley/import-professor-ratings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sourceName: ratingSourceName,
                    raw: ratingRaw
                  })
                });

                const payload = (await response.json()) as SnapshotImportResponse;
                setRatingResult(payload);
              })
            }
            className="mt-3 rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white"
          >
            {pending ? "Importing..." : "Import professor snapshot"}
          </button>

          {importedRatings ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
              <p className="font-semibold">{importedRatings.importedCount} professor ratings imported</p>
              {importedRatings.createdInstructors.length ? <p className="mt-2">Created instructors: {importedRatings.createdInstructors.join(", ")}</p> : null}
              {importedRatings.skippedRows.length ? <p className="mt-2">Skipped: {importedRatings.skippedRows.join(", ")}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
