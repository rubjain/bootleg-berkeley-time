"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/badge";
import type { BerkeleyOfficialCoverageReport } from "@/lib/berkeley-official-sync";

export function BerkeleyCoveragePanel() {
  const [coverage, setCoverage] = useState<BerkeleyOfficialCoverageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadCoverage = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/berkeley/coverage?refresh=1");
      const data = await response.json();
      setCoverage(data.coverage ?? null);
    } catch {
      setCoverage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoverage();
  }, [loadCoverage]);

  async function runChunk(flags: string) {
    setBusy(true);
    setPipelineMessage(null);
    try {
      const response = await fetch("/api/admin/berkeley/run-catalog-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncPrograms: true,
          importCourses: true,
          maxDepartments: flags.includes("full") ? 177 : 60,
          maxProgramPages: flags.includes("full") ? 500 : 40,
          maxCoursePages: flags.includes("full") ? undefined : 200
        })
      });
      const data = await response.json();
      setPipelineMessage(
        data.error ??
          `Pipeline complete: ${data.discovery?.discoveredCoursePageCount ?? 0} courses discovered.`
      );
      await loadCoverage();
    } catch (error) {
      setPipelineMessage(error instanceof Error ? error.message : "Pipeline failed");
    } finally {
      setBusy(false);
    }
  }

  async function importCoursedog() {
    setBusy(true);
    setPipelineMessage(null);
    try {
      const response = await fetch("/api/admin/berkeley/import-coursedog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await response.json();
      setPipelineMessage(
        data.error ??
          `Coursedog import: ${data.courses?.importedCount ?? 0} courses, ${data.programs?.importedCount ?? 0} programs.`
      );
      await loadCoverage();
    } catch (error) {
      setPipelineMessage(error instanceof Error ? error.message : "Coursedog import failed");
    } finally {
      setBusy(false);
    }
  }

  async function syncSupplementary() {
    setBusy(true);
    setPipelineMessage(null);
    try {
      const response = await fetch("/api/admin/berkeley/sync-supplementary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 25 })
      });
      const data = await response.json();
      setPipelineMessage(`Supplementary sync: ${data.results?.length ?? 0} programs processed.`);
      await loadCoverage();
    } catch (error) {
      setPipelineMessage(error instanceof Error ? error.message : "Supplementary sync failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !coverage) {
    return <p className="text-sm text-[#6a7383]">Loading Berkeley coverage…</p>;
  }

  if (!coverage) {
    return <p className="text-sm text-[#8a3f20]">Could not load coverage report.</p>;
  }

  const deptCoverage = coverage.estimatedDepartmentCoveragePercent;

  return (
    <div className="rounded-[1.75rem] border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#19212f]">Berkeley catalog coverage</h2>
        <Badge tone="official">{coverage.officialCatalogEndpointStatus.replace(/_/g, " ")}</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Courses" value={String(coverage.localCourseCount)} />
        <Stat label="Programs" value={String(coverage.localProgramCount)} />
        <Stat
          label="Majors / minors"
          value={`${coverage.localMajorCount} / ${coverage.localMinorCount}`}
        />
        <Stat
          label="Dept coverage"
          value={deptCoverage !== undefined ? `${deptCoverage}%` : "—"}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#4b5668]">
        <span>Parsed sources: {coverage.parsedProgramSourceCount}</span>
        <span>·</span>
        <span>Review required: {coverage.reviewRequiredProgramSourceCount}</span>
        <span>·</span>
        <span>Supplementary: {coverage.supplementarySourceCount}</span>
      </div>

      {coverage.latestSyncRun ? (
        <p className="mt-3 text-xs text-[#6a7383]">
          Last sync run {coverage.latestSyncRun.status} ({coverage.latestSyncRun.phase}) —{" "}
          {coverage.latestSyncRun.coursesImported} courses imported of{" "}
          {coverage.latestSyncRun.discoveredCourseCount} discovered
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={importCoursedog}
          className="rounded-full bg-[#1d6b6d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Import all from Coursedog API
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => runChunk("chunk")}
          className="rounded-full border border-[rgba(39,50,71,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[#19212f] disabled:opacity-50"
        >
          Run HTML chunk
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => runChunk("full")}
          className="rounded-full border border-[rgba(39,50,71,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[#19212f] disabled:opacity-50"
        >
          Run large batch
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={syncSupplementary}
          className="rounded-full border border-[rgba(39,50,71,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[#19212f] disabled:opacity-50"
        >
          Sync supplementary sources
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={loadCoverage}
          className="rounded-full border border-[rgba(39,50,71,0.12)] px-4 py-2 text-sm text-[#4b5668] disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {pipelineMessage ? <p className="mt-4 text-sm text-[#2f4f4c]">{pipelineMessage}</p> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6a7383]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#19212f]">{value}</p>
    </div>
  );
}
