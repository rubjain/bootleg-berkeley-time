"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/badge";
import type { BerkeleyCatalogDiscoveryResult, BerkeleyCatalogPipelineResult } from "@/lib/berkeley-catalog-discovery";
import type { BerkeleyScheduleImportResult } from "@/lib/berkeley-importer";
import { berkeleyOfficialSources } from "@/lib/berkeley-official-sources";

type BerkeleyBulkCourseImportResponse =
  | {
      imported: {
        schoolSlug: string;
        createdCourses: string[];
        updatedCourses: string[];
        skippedCourseUrls: string[];
        importedCoursePageCount: number;
        requestedUrlCount: number;
        fromHtmlCount: number;
        explicitUrlCount: number;
      };
    }
  | { error: string };

function hasBulkCourseImport(
  result: BerkeleyBulkCourseImportResponse | null
): result is Extract<BerkeleyBulkCourseImportResponse, { imported: unknown }> {
  return Boolean(result && "imported" in result);
}

type BerkeleyScheduleOfferingImportResponse =
  | { imported: BerkeleyScheduleImportResult }
  | { error: string };

function hasScheduleOfferingImport(
  result: BerkeleyScheduleOfferingImportResponse | null
): result is Extract<BerkeleyScheduleOfferingImportResponse, { imported: unknown }> {
  return Boolean(result && "imported" in result);
}

type BerkeleyCatalogDiscoveryResponse = { discovery: BerkeleyCatalogDiscoveryResult } | { error: string };

type BerkeleyCatalogPipelineResponse = { result: BerkeleyCatalogPipelineResult } | { error: string };

function hasCatalogDiscovery(
  result: BerkeleyCatalogDiscoveryResponse | null
): result is Extract<BerkeleyCatalogDiscoveryResponse, { discovery: unknown }> {
  return Boolean(result && "discovery" in result);
}

function hasCatalogPipeline(
  result: BerkeleyCatalogPipelineResponse | null
): result is Extract<BerkeleyCatalogPipelineResponse, { result: unknown }> {
  return Boolean(result && "result" in result);
}

type BerkeleyParseResponse =
  | {
      parsed:
        | {
            sourceType: "catalog";
            sourceUrl: string;
            linkCount: number;
            courseCount: number;
            summary: {
              totalLinks: number;
              totalCourseRecords: number;
              prerequisiteCoverageCount: number;
              unitsCoverageCount: number;
              departmentCodes: string[];
              normalizedCandidateCount: number;
            };
            links: Array<{ href: string; title: string }>;
            courseRecords: Array<{
              code: string;
              title: string;
              unitsText?: string;
              description?: string;
              prerequisiteText?: string;
            }>;
            requirementSections: Array<{
              heading: string;
              items: string[];
            }>;
            normalizedCandidates: Array<{
              code: string;
              departmentCode: string;
              slug: string;
              title: string;
              description?: string;
              unitsMin?: number;
              unitsMax?: number;
              level: string;
              breadthTags: string[];
              requirementTags: string[];
              prerequisitesText?: string;
              importConfidence: "HIGH" | "MEDIUM" | "LOW";
            }>;
          }
        | {
            sourceType: "schedule";
            sourceUrl: string;
            offeringCount: number;
            summary: {
              totalOfferings: number;
              projectedCount: number;
              withInstructorCount: number;
              withMeetingCount: number;
              statusBreakdown: Array<{ status: string; count: number }>;
            };
            offerings: Array<{
              courseCode: string;
              courseTitle: string;
              instructorText?: string;
              status?: string;
              meetingText?: string;
              location?: string;
              projected: boolean;
            }>;
          };
    }
  | {
      imported: {
        sourceUrl: string;
        schoolSlug: string;
        candidateCount: number;
        createdDepartments: string[];
        createdCourses: string[];
        updatedCourses: string[];
        skippedCourses: string[];
      };
    }
  | { error: string };

type BerkeleyDepartmentSyncResponse =
  | {
      imported: {
        sourceUrl: string;
        schoolSlug: string;
        officialDepartmentCount: number;
        createdDepartments: string[];
        updatedDepartments: string[];
      };
    }
  | { error: string };

type BerkeleyProgramSyncResponse =
  | {
      synced: {
        sourceUrls: string[];
        schoolSlug: string;
        createdPrograms: string[];
        updatedPrograms: string[];
        createdCourses: string[];
        updatedCourses: string[];
        skippedProgramUrls: string[];
        skippedCourseUrls: string[];
        referencedCoursePageCount: number;
        importedCoursePageCount: number;
      };
    }
  | { error: string };

type BerkeleyCoverageResponse =
  | {
      coverage: {
        schoolSlug: string;
        localDepartmentCount: number;
        localCourseCount: number;
        localProgramCount: number;
        localMajorCount: number;
        localMinorCount: number;
        officialDepartmentCount?: number;
        syncedProgramSourceCount: number;
        officialCatalogEndpointStatus: "public_pages_only" | "search_endpoint_blocked";
        notes: string[];
      };
    }
  | { error: string };

function hasDepartmentSync(
  result: BerkeleyDepartmentSyncResponse | null
): result is Extract<BerkeleyDepartmentSyncResponse, { imported: unknown }> {
  return Boolean(result && "imported" in result);
}

function hasProgramSync(
  result: BerkeleyProgramSyncResponse | null
): result is Extract<BerkeleyProgramSyncResponse, { synced: unknown }> {
  return Boolean(result && "synced" in result);
}

function hasCoverage(
  result: BerkeleyCoverageResponse | null
): result is Extract<BerkeleyCoverageResponse, { coverage: unknown }> {
  return Boolean(result && "coverage" in result);
}

function hasParsedResult(
  result: BerkeleyParseResponse | null
): result is Extract<BerkeleyParseResponse, { parsed: unknown }> {
  return Boolean(result && "parsed" in result);
}

function hasImportedResult(
  result: BerkeleyParseResponse | null
): result is Extract<BerkeleyParseResponse, { imported: unknown }> {
  return Boolean(result && "imported" in result);
}

export function BerkeleyParseForm() {
  const [sourceType, setSourceType] = useState<"catalog" | "schedule">("catalog");
  const [sourceUrl, setSourceUrl] = useState("https://undergraduate.catalog.berkeley.edu/");
  const [html, setHtml] = useState("");
  const [result, setResult] = useState<BerkeleyParseResponse | null>(null);
  const [programUrls, setProgramUrls] = useState(berkeleyOfficialSources.defaultProgramUrls.join("\n"));
  const [maxCoursePages, setMaxCoursePages] = useState("75");
  const [bulkHtml, setBulkHtml] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [maxBulkCourses, setMaxBulkCourses] = useState("200");
  const [maxPipelineDepartments, setMaxPipelineDepartments] = useState("177");
  const [maxPipelinePrograms, setMaxPipelinePrograms] = useState("40");
  const [maxPipelineCourses, setMaxPipelineCourses] = useState("500");
  const [bulkCourseImport, setBulkCourseImport] = useState<BerkeleyBulkCourseImportResponse | null>(null);
  const [catalogDiscovery, setCatalogDiscovery] = useState<BerkeleyCatalogDiscoveryResponse | null>(null);
  const [catalogPipeline, setCatalogPipeline] = useState<BerkeleyCatalogPipelineResponse | null>(null);
  const [scheduleTermCode, setScheduleTermCode] = useState("2025-FALL");
  const [scheduleOfferingImport, setScheduleOfferingImport] = useState<BerkeleyScheduleOfferingImportResponse | null>(
    null
  );
  const [departmentSync, setDepartmentSync] = useState<BerkeleyDepartmentSyncResponse | null>(null);
  const [programSync, setProgramSync] = useState<BerkeleyProgramSyncResponse | null>(null);
  const [coverage, setCoverage] = useState<BerkeleyCoverageResponse | null>(null);
  const [pending, startTransition] = useTransition();
  const parsed = hasParsedResult(result) ? result.parsed : undefined;
  const imported = hasImportedResult(result) ? result.imported : undefined;
  const departmentImport = hasDepartmentSync(departmentSync) ? departmentSync.imported : undefined;
  const syncedPrograms = hasProgramSync(programSync) ? programSync.synced : undefined;
  const coverageReport = hasCoverage(coverage) ? coverage.coverage : undefined;
  const bulkImported = hasBulkCourseImport(bulkCourseImport) ? bulkCourseImport.imported : undefined;
  const scheduleImported = hasScheduleOfferingImport(scheduleOfferingImport)
    ? scheduleOfferingImport.imported
    : undefined;
  const discoveredCatalog = hasCatalogDiscovery(catalogDiscovery) ? catalogDiscovery.discovery : undefined;
  const pipelineResult = hasCatalogPipeline(catalogPipeline) ? catalogPipeline.result : undefined;

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#19212f]">Berkeley parser sandbox</h2>
      <p className="mt-2 text-sm leading-6 text-[#4b5668]">
        Paste official Berkeley HTML or point the parser at an official Berkeley catalog or schedule URL. This is the bridge between source scraping and reviewed normalized records.
      </p>
      <div className="mt-4 grid gap-3">
        <select
          value={sourceType}
          onChange={(event) => {
            const next = event.target.value as "catalog" | "schedule";
            setSourceType(next);
            if (next === "schedule" && !sourceUrl.includes("classes.berkeley.edu")) {
              setSourceUrl(berkeleyOfficialSources.classSearch);
            }
            if (next === "catalog" && sourceUrl.includes("classes.berkeley.edu")) {
              setSourceUrl(berkeleyOfficialSources.catalogIndex);
            }
          }}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        >
          <option value="catalog">Catalog</option>
          <option value="schedule">Schedule</option>
        </select>
        <input
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        />
        <textarea
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          placeholder="Optional HTML snapshot for offline parsing"
          className="min-h-[180px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const response = await fetch("/api/admin/berkeley/parse", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sourceType,
                    sourceUrl,
                    html: html.trim() || undefined
                  })
                });

                const payload = (await response.json()) as BerkeleyParseResponse;
                setResult(payload);
              })
            }
            className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white"
          >
            {pending ? "Working..." : "Parse Berkeley source"}
          </button>
          {sourceType === "catalog" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const response = await fetch("/api/admin/berkeley/import-catalog", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      sourceUrl,
                      html: html.trim() || undefined
                    })
                  });

                  const payload = (await response.json()) as BerkeleyParseResponse;
                  setResult(payload);
                })
              }
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
            >
              {pending ? "Working..." : "Import catalog candidates"}
            </button>
          ) : null}
        </div>
        {sourceType === "schedule" ? (
          <div className="mt-4 rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] p-4">
            <h3 className="font-semibold text-[#19212f]">Persist Class Search rows</h3>
            <p className="mt-2 text-sm leading-6 text-[#4b5668]">
              After you parse HTML from{" "}
              <span className="font-medium">classes.berkeley.edu</span>, upsert matching rows into{" "}
              <code className="text-[#1d6b6d]">CourseOffering</code> for the term you specify. Course codes in the HTML
              must match catalog codes already in the database (for example <span className="font-medium">COMPSCI 61A</span>
              ). Unknown codes are counted as skipped.
            </p>
            <input
              value={scheduleTermCode}
              onChange={(event) => setScheduleTermCode(event.target.value)}
              placeholder="Term code, e.g. 2025-FALL"
              className="mt-3 w-full max-w-sm rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const response = await fetch("/api/admin/berkeley/import-schedule-offerings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      sourceUrl,
                      html: html.trim() || undefined,
                      termCode: scheduleTermCode.trim()
                    })
                  });
                  const payload = (await response.json()) as BerkeleyScheduleOfferingImportResponse;
                  setScheduleOfferingImport(payload);
                })
              }
              className="mt-3 rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white"
            >
              {pending ? "Working..." : "Import schedule offerings"}
            </button>
            {scheduleImported ? (
              <div className="mt-4 rounded-2xl border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] p-4 text-sm text-[#2f4f4c]">
                <p className="font-semibold text-[#19212f]">
                  Term {scheduleImported.termCode}: created {scheduleImported.createdOfferings}, updated{" "}
                  {scheduleImported.updatedOfferings} (parsed {scheduleImported.parsedRowCount} rows, processed cap{" "}
                  {scheduleImported.processedRowCount})
                </p>
                {scheduleImported.skippedRowCount ? (
                  <p className="mt-2 text-xs text-[#6a7383]">
                    Skipped {scheduleImported.skippedRowCount} rows (unknown course codes:{" "}
                    {scheduleImported.skippedUnknownCourses.slice(0, 16).join(", ")}
                    {scheduleImported.skippedUnknownCourses.length > 16 ? "…" : ""})
                  </p>
                ) : null}
              </div>
            ) : null}
            {scheduleOfferingImport && "error" in scheduleOfferingImport ? (
              <p className="mt-3 text-sm text-[#c96f4a]">{scheduleOfferingImport.error}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-[#19212f]">Official Berkeley sync</h3>
        <p className="mt-2 text-sm leading-6 text-[#4b5668]">
          Sync the live Berkeley department list plus selected official program pages, then import the course pages referenced by those program requirements.
        </p>
        <textarea
          value={programUrls}
          onChange={(event) => setProgramUrls(event.target.value)}
          className="mt-4 min-h-[180px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
        />
        <input
          value={maxCoursePages}
          onChange={(event) => setMaxCoursePages(event.target.value)}
          inputMode="numeric"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const response = await fetch("/api/admin/berkeley/import-departments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({})
                });

                const payload = (await response.json()) as BerkeleyDepartmentSyncResponse;
                setDepartmentSync(payload);
              })
            }
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
          >
            {pending ? "Working..." : "Sync official departments"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const urls = programUrls
                  .split(/\r?\n/)
                  .map((value) => value.trim())
                  .filter(Boolean);
                const response = await fetch("/api/admin/berkeley/sync-programs", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    programUrls: urls,
                    maxCoursePages: Number(maxCoursePages) || undefined
                  })
                });

                const payload = (await response.json()) as BerkeleyProgramSyncResponse;
                setProgramSync(payload);
              })
            }
            className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white"
          >
            {pending ? "Working..." : "Sync official program pages"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const response = await fetch("/api/admin/berkeley/coverage?refresh=1");
                const payload = (await response.json()) as BerkeleyCoverageResponse;
                setCoverage(payload);
              })
            }
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
          >
            {pending ? "Working..." : "Refresh Berkeley coverage"}
          </button>
        </div>
        {departmentImport ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="official">{departmentImport.officialDepartmentCount} official departments</Badge>
              <Badge>{departmentImport.createdDepartments.length} created</Badge>
              <Badge>{departmentImport.updatedDepartments.length} updated</Badge>
            </div>
          </div>
        ) : null}
        {syncedPrograms ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="official">{syncedPrograms.sourceUrls.length} program pages</Badge>
              <Badge>{syncedPrograms.createdPrograms.length} created programs</Badge>
              <Badge>{syncedPrograms.updatedPrograms.length} updated programs</Badge>
              <Badge>{syncedPrograms.createdCourses.length} created courses</Badge>
              <Badge>{syncedPrograms.updatedCourses.length} updated courses</Badge>
            </div>
            <p className="mt-3 text-sm text-emerald-900">
              Referenced official course pages: {syncedPrograms.referencedCoursePageCount}; imported this run: {syncedPrograms.importedCoursePageCount}
            </p>
            {syncedPrograms.skippedProgramUrls.length ? (
              <p className="mt-2 text-xs text-emerald-900">
                Skipped program URLs: {syncedPrograms.skippedProgramUrls.join(", ")}
              </p>
            ) : null}
            {syncedPrograms.skippedCourseUrls.length ? (
              <p className="mt-2 text-xs text-emerald-900">
                Skipped course URLs: {syncedPrograms.skippedCourseUrls.slice(0, 8).join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
        {coverageReport ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Local departments" value={String(coverageReport.localDepartmentCount)} />
              <MetricCard label="Local courses" value={String(coverageReport.localCourseCount)} />
              <MetricCard label="Local programs" value={String(coverageReport.localProgramCount)} />
              <MetricCard label="Synced program sources" value={String(coverageReport.syncedProgramSourceCount)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="official">Majors: {coverageReport.localMajorCount}</Badge>
              <Badge tone="official">Minors: {coverageReport.localMinorCount}</Badge>
              {coverageReport.officialDepartmentCount ? (
                <Badge>
                  Official departments available: {coverageReport.officialDepartmentCount}
                </Badge>
              ) : null}
              <Badge>{coverageReport.officialCatalogEndpointStatus}</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {coverageReport.notes.map((note: string) => (
                <p key={note} className="text-xs leading-5 text-slate-500">
                  {note}
                </p>
              ))}
            </div>
          </div>
        ) : null}
        <CatalogDiscoveryPipelinePanel
          pending={pending}
          maxPipelineDepartments={maxPipelineDepartments}
          setMaxPipelineDepartments={setMaxPipelineDepartments}
          maxPipelinePrograms={maxPipelinePrograms}
          setMaxPipelinePrograms={setMaxPipelinePrograms}
          maxPipelineCourses={maxPipelineCourses}
          setMaxPipelineCourses={setMaxPipelineCourses}
          discoveredCatalog={discoveredCatalog}
          pipelineResult={pipelineResult}
          catalogDiscovery={catalogDiscovery}
          catalogPipeline={catalogPipeline}
          onDiscover={() =>
            startTransition(async () => {
              const response = await fetch("/api/admin/berkeley/discover-catalog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  maxDepartments: Number(maxPipelineDepartments) || undefined,
                  maxProgramPages: Number(maxPipelinePrograms) || undefined,
                  scanProgramPagesForCourses: true
                })
              });
              setCatalogDiscovery((await response.json()) as BerkeleyCatalogDiscoveryResponse);
            })
          }
          onRunPipeline={() =>
            startTransition(async () => {
              const response = await fetch("/api/admin/berkeley/run-catalog-pipeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  maxDepartments: Number(maxPipelineDepartments) || undefined,
                  maxProgramPages: Number(maxPipelinePrograms) || undefined,
                  maxCoursePages: Number(maxPipelineCourses) || undefined,
                  syncPrograms: true,
                  importCourses: true
                })
              });
              setCatalogPipeline((await response.json()) as BerkeleyCatalogPipelineResponse);
            })
          }
        />
        <div className="mt-6 rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] p-4">
          <h3 className="font-semibold text-[#19212f]">Bulk import catalog course pages</h3>
          <p className="mt-2 text-sm leading-6 text-[#4b5668]">
            Fetches each official{" "}
            <code className="text-[#1d6b6d]">undergraduate.catalog.berkeley.edu/courses/&lt;id&gt;</code> page and upserts
            structured course rows. Paste HTML from a catalog search or program listing, and/or one course URL per line.
            Use <span className="font-medium">max pages</span> to cap how many fetches run in one request (Berkeley rate limits apply).
          </p>
          <textarea
            value={bulkHtml}
            onChange={(event) => setBulkHtml(event.target.value)}
            placeholder="Optional: paste HTML containing /courses/12345 links"
            className="mt-3 min-h-[120px] w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
          />
          <textarea
            value={bulkUrls}
            onChange={(event) => setBulkUrls(event.target.value)}
            placeholder="Optional: one official catalog course URL per line"
            className="mt-3 min-h-[100px] w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
          />
          <input
            value={maxBulkCourses}
            onChange={(event) => setMaxBulkCourses(event.target.value)}
            inputMode="numeric"
            placeholder="Max course pages"
            className="mt-3 w-full max-w-xs rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const urls = bulkUrls
                  .split(/\r?\n/)
                  .map((value) => value.trim())
                  .filter(Boolean);
                const response = await fetch("/api/admin/berkeley/import-courses", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    coursePageUrls: urls.length ? urls : undefined,
                    html: bulkHtml.trim() || undefined,
                    maxCoursePages: Number(maxBulkCourses) || undefined
                  })
                });
                const payload = (await response.json()) as BerkeleyBulkCourseImportResponse;
                setBulkCourseImport(payload);
              })
            }
            className="mt-3 rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white"
          >
            {pending ? "Working..." : "Import catalog course pages"}
          </button>
          {bulkImported ? (
            <div className="mt-4 rounded-2xl border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] p-4 text-sm text-[#2f4f4c]">
              <p className="font-semibold text-[#19212f]">
                Requested {bulkImported.requestedUrlCount} URLs (HTML links: {bulkImported.fromHtmlCount}, explicit lines:{" "}
                {bulkImported.explicitUrlCount})
              </p>
              <p className="mt-2">
                Created {bulkImported.createdCourses.length} · updated {bulkImported.updatedCourses.length} · attempted fetch count{" "}
                {bulkImported.importedCoursePageCount}
              </p>
              {bulkImported.skippedCourseUrls.length ? (
                <p className="mt-2 text-xs text-[#6a7383]">
                  Skipped (fetch/parse): {bulkImported.skippedCourseUrls.slice(0, 12).join(", ")}
                  {bulkImported.skippedCourseUrls.length > 12 ? "…" : ""}
                </p>
              ) : null}
            </div>
          ) : null}
          {bulkCourseImport && "error" in bulkCourseImport ? (
            <p className="mt-3 text-sm text-[#c96f4a]">{bulkCourseImport.error}</p>
          ) : null}
        </div>
      </div>
      {imported ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="official">Catalog import applied</Badge>
            <Badge>{imported.candidateCount} candidates</Badge>
            <Badge>{imported.createdCourses.length} created</Badge>
            <Badge>{imported.updatedCourses.length} updated</Badge>
            {imported.skippedCourses.length ? <Badge>{imported.skippedCourses.length} skipped</Badge> : null}
          </div>
          <p className="mt-3 text-sm text-emerald-900">
            Imported into <span className="font-semibold">{imported.schoolSlug}</span> from {imported.sourceUrl}
          </p>
          {imported.createdDepartments.length ? (
            <p className="mt-2 text-sm text-emerald-900">Created departments: {imported.createdDepartments.join(", ")}</p>
          ) : null}
        </div>
      ) : null}
      {parsed ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{parsed.sourceType.toUpperCase()}</Badge>
              {"courseCount" in parsed ? <Badge>{parsed.courseCount} course records</Badge> : null}
              {"offeringCount" in parsed ? <Badge>{parsed.offeringCount} offerings</Badge> : null}
            </div>
            <p className="mt-3 text-sm text-[#4b5668]">{parsed.sourceUrl}</p>
          </div>

          {"courseCount" in parsed ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Links found" value={String(parsed.summary.totalLinks)} />
                <MetricCard label="Course records" value={String(parsed.summary.totalCourseRecords)} />
                <MetricCard label="With prerequisites" value={String(parsed.summary.prerequisiteCoverageCount)} />
                <MetricCard label="Normalized candidates" value={String(parsed.summary.normalizedCandidateCount)} />
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#19212f]">Detected departments</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsed.summary.departmentCodes.map((departmentCode) => (
                    <Badge key={departmentCode} tone="official">
                      {departmentCode}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#19212f]">Requirement section preview</h3>
                <p className="mt-2 text-sm leading-6 text-[#4b5668]">
                  Official catalog headings and bullet items extracted before rule normalization, useful for reviewing lower-division, upper-division, and grouped-option language.
                </p>
                <div className="mt-4 space-y-3">
                  {parsed.requirementSections.length ? (
                    parsed.requirementSections.map((section) => (
                      <div key={section.heading} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-medium text-slate-900">{section.heading}</p>
                        <div className="mt-2 space-y-2">
                          {section.items.map((item) => (
                            <p key={item} className="text-sm text-[#4b5668]">{item}</p>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No requirement-list sections were extracted from this HTML snapshot.</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#19212f]">Normalized import candidates</h3>
                <p className="mt-2 text-sm leading-6 text-[#4b5668]">
                  Draft import rows inferred from official catalog text so we can scale beyond hand-seeded classes.
                </p>
                <div className="mt-4 space-y-3">
                  {parsed.normalizedCandidates.map((candidate) => (
                    <div key={candidate.code} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{candidate.code}</p>
                        <Badge tone="official">{candidate.importConfidence}</Badge>
                        <Badge>{candidate.level}</Badge>
                        {candidate.unitsMin ? (
                          <Badge>
                            {candidate.unitsMin === candidate.unitsMax ? candidate.unitsMin : `${candidate.unitsMin}-${candidate.unitsMax}`} units
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{candidate.title}</p>
                      <p className="mt-2 text-xs text-slate-500">Dept {candidate.departmentCode} | {candidate.slug}</p>
                      {candidate.prerequisitesText ? (
                        <p className="mt-2 text-xs text-slate-500">Prereqs: {candidate.prerequisitesText}</p>
                      ) : null}
                      {candidate.breadthTags.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {candidate.breadthTags.map((tag) => (
                            <Badge key={`${candidate.code}-${tag}`} tone="official">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      {candidate.requirementTags.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {candidate.requirementTags.map((tag) => (
                            <Badge key={`${candidate.code}-${tag}`}>{tag}</Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-[#19212f]">Catalog links</h3>
                  <div className="mt-3 space-y-3">
                    {parsed.links.map((link) => (
                      <div key={link.href} className="rounded-2xl bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">{link.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{link.href}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-[#19212f]">Course record preview</h3>
                  <div className="mt-3 space-y-3">
                    {parsed.courseRecords.map((record) => (
                      <div key={record.code} className="rounded-2xl bg-slate-50 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">{record.code}</p>
                          {record.unitsText ? <Badge>{record.unitsText}</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{record.title}</p>
                        {record.prerequisiteText ? <p className="mt-2 text-xs text-slate-500">Prereqs: {record.prerequisiteText}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Offerings found" value={String(parsed.summary.totalOfferings)} />
                <MetricCard label="Projected" value={String(parsed.summary.projectedCount)} />
                <MetricCard label="With instructor" value={String(parsed.summary.withInstructorCount)} />
                <MetricCard label="With meeting time" value={String(parsed.summary.withMeetingCount)} />
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#19212f]">Status breakdown</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsed.summary.statusBreakdown.map((entry) => (
                    <Badge key={entry.status}>
                      {entry.status}: {entry.count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-[#19212f]">Offering preview</h3>
                <div className="mt-3 space-y-3">
                  {parsed.offerings.map((offering) => (
                    <div key={`${offering.courseCode}-${offering.courseTitle}`} className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{offering.courseCode}</p>
                        {offering.status ? <Badge>{offering.status}</Badge> : null}
                        {offering.projected ? <Badge tone="official">Projected</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{offering.courseTitle}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {[offering.instructorText, offering.meetingText, offering.location].filter(Boolean).join(" | ") || "No meeting details parsed"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
      {!parsed && result ? (
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#243047] p-4 text-xs text-slate-100">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

function CatalogDiscoveryPipelinePanel({
  pending,
  maxPipelineDepartments,
  setMaxPipelineDepartments,
  maxPipelinePrograms,
  setMaxPipelinePrograms,
  maxPipelineCourses,
  setMaxPipelineCourses,
  discoveredCatalog,
  pipelineResult,
  catalogDiscovery,
  catalogPipeline,
  onDiscover,
  onRunPipeline
}: {
  pending: boolean;
  maxPipelineDepartments: string;
  setMaxPipelineDepartments: (value: string) => void;
  maxPipelinePrograms: string;
  setMaxPipelinePrograms: (value: string) => void;
  maxPipelineCourses: string;
  setMaxPipelineCourses: (value: string) => void;
  discoveredCatalog?: BerkeleyCatalogDiscoveryResult;
  pipelineResult?: BerkeleyCatalogPipelineResult;
  catalogDiscovery: BerkeleyCatalogDiscoveryResponse | null;
  catalogPipeline: BerkeleyCatalogPipelineResponse | null;
  onDiscover: () => void;
  onRunPipeline: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] p-4">
      <h3 className="font-semibold text-[#19212f]">Catalog discovery pipeline</h3>
      <p className="mt-2 text-sm leading-6 text-[#4b5668]">
        Crawls official Berkeley department course listings (embedded Nuxt{" "}
        <code className="text-[#1d6b6d]">courseGroupId</code> values), optionally scans program pages, then can sync
        programs and import course detail pages. Expect several minutes when scanning all ~177 departments.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <input
          value={maxPipelineDepartments}
          onChange={(event) => setMaxPipelineDepartments(event.target.value)}
          inputMode="numeric"
          placeholder="Max departments"
          className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
        />
        <input
          value={maxPipelinePrograms}
          onChange={(event) => setMaxPipelinePrograms(event.target.value)}
          inputMode="numeric"
          placeholder="Max programs to sync"
          className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
        />
        <input
          value={maxPipelineCourses}
          onChange={(event) => setMaxPipelineCourses(event.target.value)}
          inputMode="numeric"
          placeholder="Max course pages to import"
          className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={onDiscover}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
        >
          {pending ? "Working..." : "Discover catalog links only"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onRunPipeline}
          className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white"
        >
          {pending ? "Working..." : "Run full catalog pipeline"}
        </button>
      </div>
      {discoveredCatalog ? (
        <div className="mt-4 rounded-2xl border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] p-4 text-sm text-[#2f4f4c]">
          <p className="font-semibold text-[#19212f]">
            Discovered {discoveredCatalog.discoveredCoursePageCount} course pages across{" "}
            {discoveredCatalog.departmentCoursePagesWithCourses}/{discoveredCatalog.departmentCoursePagesScanned}{" "}
            department listings
          </p>
          <p className="mt-2">
            Program URLs known: {discoveredCatalog.discoveredProgramPageCount} · program HTML scans:{" "}
            {discoveredCatalog.programPagesScannedForCourses}
          </p>
          {discoveredCatalog.notes.map((note) => (
            <p key={note} className="mt-2 text-xs text-[#6a7383]">
              {note}
            </p>
          ))}
        </div>
      ) : null}
      {pipelineResult ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-semibold">Pipeline: discovered {pipelineResult.discovery.discoveredCoursePageCount} courses</p>
          {pipelineResult.courseImport ? (
            <p className="mt-2">
              Course import — created {pipelineResult.courseImport.createdCourses.length}, updated{" "}
              {pipelineResult.courseImport.updatedCourses.length}, fetched {pipelineResult.courseImport.importedCoursePageCount}
            </p>
          ) : null}
          {pipelineResult.programSync ? (
            <p className="mt-2">
              Programs — created {pipelineResult.programSync.createdPrograms.length}, updated{" "}
              {pipelineResult.programSync.updatedPrograms.length}
            </p>
          ) : null}
        </div>
      ) : null}
      {catalogDiscovery && "error" in catalogDiscovery ? (
        <p className="mt-3 text-sm text-[#c96f4a]">{catalogDiscovery.error}</p>
      ) : null}
      {catalogPipeline && "error" in catalogPipeline ? (
        <p className="mt-3 text-sm text-[#c96f4a]">{catalogPipeline.error}</p>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#19212f]">{value}</p>
    </div>
  );
}
