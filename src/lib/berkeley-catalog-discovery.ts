import {
  fetchAllCoursedogCourses,
  fetchAllCoursedogPrograms,
  coursedogProgramCatalogUrl
} from "@/lib/berkeley-coursedog-api";
import {
  berkeleyCatalogCoursePageUrl,
  extractBerkeleyCatalogCoursePageIds,
  extractBerkeleyCatalogCoursePageUrls,
  extractBerkeleyCatalogProgramPageUrls
} from "@/lib/berkeley-importer";
import { berkeleyOfficialSources } from "@/lib/berkeley-official-sources";
import {
  fetchOfficialHtml,
  getBerkeleyOfficialDepartments,
  importBerkeleyOfficialCatalogCoursePages,
  syncBerkeleyOfficialPrograms,
  type BerkeleyOfficialProgramImportResult
} from "@/lib/berkeley-official-sync";
import {
  createBerkeleySyncRun,
  getBerkeleySyncRun,
  parseCheckpoint,
  updateBerkeleySyncRun,
  type BerkeleySyncCheckpoint
} from "@/lib/berkeley-sync-checkpoint";
import { BerkeleySyncRunStatus } from "@prisma/client";
import { normalizeInstructorsFromOfferings } from "@/lib/instructors/from-offerings";
import { syncRmpForSchool } from "@/lib/rmp/sync-to-db";

const OFFICIAL_FETCH_DELAY_MS = 80;
const DEFAULT_MAX_PROGRAM_PAGES = 500;
const DEFAULT_MAX_DEPARTMENTS = 177;
const DEFAULT_BFS_DEPTH = 2;

export type BerkeleyCatalogDiscoveryResult = {
  schoolSlug: string;
  discoveredProgramPageCount: number;
  discoveredCoursePageCount: number;
  programPageUrls: string[];
  coursePageUrls: string[];
  departmentCoursePagesScanned: number;
  departmentCoursePagesWithCourses: number;
  programPagesScannedForCourses: number;
  programsFromIndex: number;
  programsFromCrossLinks: number;
  programsFromCoursedogApi: number;
  coursesFromCoursedogApi: number;
  notes: string[];
};

export type BerkeleyCatalogPipelineResult = {
  discovery: BerkeleyCatalogDiscoveryResult;
  programSync?: BerkeleyOfficialProgramImportResult;
  courseImport?: Awaited<ReturnType<typeof importBerkeleyOfficialCatalogCoursePages>>;
  syncRunId?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function departmentCoursesUrl(departmentCode: string) {
  return `https://undergraduate.catalog.berkeley.edu/departments/${encodeURIComponent(departmentCode)}/courses`;
}

function resolveMaxProgramPages(input?: { maxProgramPages?: number; full?: boolean }) {
  if (input?.full) return undefined;
  if (input?.maxProgramPages === undefined) return DEFAULT_MAX_PROGRAM_PAGES;
  return Math.min(Math.max(input.maxProgramPages, 1), 2000);
}

function resolveMaxDepartments(input?: { maxDepartments?: number; full?: boolean }) {
  if (input?.full) return 250;
  return Math.min(Math.max(input?.maxDepartments ?? DEFAULT_MAX_DEPARTMENTS, 1), 250);
}

async function bootstrapProgramsFromIndex(programUrls: Set<string>, notes: string[]) {
  let programsFromIndex = 0;
  try {
    const html = await fetchOfficialHtml(berkeleyOfficialSources.programsIndex);
    const urls = extractBerkeleyCatalogProgramPageUrls(html);
    for (const url of urls) {
      if (!programUrls.has(url)) {
        programsFromIndex += 1;
      }
      programUrls.add(url);
    }
    notes.push(`Programs index returned ${urls.length} program URLs (${programsFromIndex} new).`);
  } catch (error) {
    notes.push(
      `Programs index fetch failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
  return programsFromIndex;
}

async function bfsScanProgramPages(input: {
  programUrls: Set<string>;
  coursePageIds: Set<string>;
  maxDepth: number;
  maxProgramPages?: number;
  full?: boolean;
  onProgress?: (message: string) => void;
  notes: string[];
}) {
  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [...input.programUrls].map((url) => ({
    url,
    depth: 0
  }));
  let programPagesScannedForCourses = 0;
  let programsFromCrossLinks = 0;
  const maxPages = resolveMaxProgramPages({ maxProgramPages: input.maxProgramPages, full: input.full });

  while (queue.length > 0) {
    if (maxPages !== undefined && visited.size >= maxPages) break;

    const current = queue.shift();
    if (!current || visited.has(current.url)) continue;
    if (current.depth > input.maxDepth) continue;

    visited.add(current.url);
    if (visited.size > 1) {
      await sleep(OFFICIAL_FETCH_DELAY_MS);
    }

    input.onProgress?.(`BFS program scan ${visited.size}${maxPages ? `/${maxPages}` : ""}: ${current.url}`);
    programPagesScannedForCourses += 1;

    try {
      const html = await fetchOfficialHtml(current.url);
      for (const id of extractBerkeleyCatalogCoursePageIds(html)) {
        input.coursePageIds.add(id);
      }
      for (const url of extractBerkeleyCatalogProgramPageUrls(html)) {
        if (!input.programUrls.has(url)) {
          programsFromCrossLinks += 1;
          input.programUrls.add(url);
          if (current.depth < input.maxDepth) {
            queue.push({ url, depth: current.depth + 1 });
          }
        }
      }
    } catch {
      input.notes.push(`Skipped program page scan: ${current.url}`);
    }
  }

  return { programPagesScannedForCourses, programsFromCrossLinks };
}

export async function discoverBerkeleyOfficialCatalogLinks(input?: {
  schoolSlug?: string;
  programUrls?: string[];
  html?: string;
  includeDepartmentCoursePages?: boolean;
  scanProgramPagesForCourses?: boolean;
  maxDepartments?: number;
  maxProgramPages?: number;
  programBfsDepth?: number;
  departmentCodes?: string[];
  full?: boolean;
  onProgress?: (message: string) => void;
}): Promise<BerkeleyCatalogDiscoveryResult> {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  const notes: string[] = [];
  const programUrls = new Set<string>([
    ...berkeleyOfficialSources.defaultProgramUrls,
    ...(input?.programUrls ?? [])
  ]);
  const coursePageIds = new Set<string>();

  if (input?.html?.trim()) {
    for (const url of extractBerkeleyCatalogProgramPageUrls(input.html)) {
      programUrls.add(url);
    }
    for (const id of extractBerkeleyCatalogCoursePageIds(input.html)) {
      coursePageIds.add(id);
    }
  }

  let programsFromCoursedogApi = 0;
  let coursesFromCoursedogApi = 0;
  try {
    input?.onProgress?.("Fetching course inventory from Berkeley Coursedog API...");
    const coursedogCourses = await fetchAllCoursedogCourses({
      maxRecords: input?.full ? undefined : input?.maxCoursePages,
      onProgress: input?.onProgress
    });
    for (const course of coursedogCourses) {
      const groupId = course.courseGroupId ?? course._id.split("-")[0];
      if (groupId) {
        coursePageIds.add(groupId);
        coursesFromCoursedogApi += 1;
      }
    }
    notes.push(`Coursedog API returned ${coursedogCourses.length} unique undergraduate courses.`);

    input?.onProgress?.("Fetching program inventory from Berkeley Coursedog API...");
    const coursedogPrograms = await fetchAllCoursedogPrograms({ onProgress: input?.onProgress });
    for (const program of coursedogPrograms) {
      programUrls.add(coursedogProgramCatalogUrl(program._id));
      programsFromCoursedogApi += 1;
    }
    notes.push(`Coursedog API returned ${coursedogPrograms.length} programs.`);
  } catch (error) {
    notes.push(
      `Coursedog API discovery failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }

  const programsFromIndex =
    coursesFromCoursedogApi > 0
      ? 0
      : await bootstrapProgramsFromIndex(programUrls, notes);

  let departmentCoursePagesScanned = 0;
  let departmentCoursePagesWithCourses = 0;

  if (input?.includeDepartmentCoursePages !== false && coursesFromCoursedogApi === 0) {
    const departments = await getBerkeleyOfficialDepartments();
    const selected = input?.departmentCodes?.length
      ? departments.filter((department) => input.departmentCodes!.includes(department.code))
      : departments;
    const maxDepartments = resolveMaxDepartments({ maxDepartments: input?.maxDepartments, full: input?.full });
    const capped = selected.slice(0, maxDepartments);

    for (const [index, department] of capped.entries()) {
      if (index > 0) {
        await sleep(OFFICIAL_FETCH_DELAY_MS);
      }
      const sourceUrl = departmentCoursesUrl(department.code);
      input?.onProgress?.(`Scanning department courses ${index + 1}/${capped.length}: ${department.code}`);
      departmentCoursePagesScanned += 1;

      try {
        const html = await fetchOfficialHtml(sourceUrl);
        const ids = extractBerkeleyCatalogCoursePageIds(html);
        if (ids.length) {
          departmentCoursePagesWithCourses += 1;
          for (const id of ids) {
            coursePageIds.add(id);
          }
        }
      } catch {
        notes.push(`Skipped department course listing: ${department.code}`);
      }
    }

    notes.push(
      `Scanned ${departmentCoursePagesScanned} official department course listings; ${departmentCoursePagesWithCourses} returned embedded course page ids.`
    );
  }

  let programPagesScannedForCourses = 0;
  let programsFromCrossLinks = 0;

  if (input?.scanProgramPagesForCourses !== false && coursesFromCoursedogApi === 0) {
    const bfs = await bfsScanProgramPages({
      programUrls,
      coursePageIds,
      maxDepth: input?.programBfsDepth ?? DEFAULT_BFS_DEPTH,
      maxProgramPages: input?.maxProgramPages,
      full: input?.full,
      onProgress: input?.onProgress,
      notes
    });
    programPagesScannedForCourses = bfs.programPagesScannedForCourses;
    programsFromCrossLinks = bfs.programsFromCrossLinks;
    notes.push(`BFS discovered ${programsFromCrossLinks} additional program URLs via cross-links.`);
  }

  const coursePageUrls = [...coursePageIds]
    .sort((left, right) => left.localeCompare(right))
    .map((id) => berkeleyCatalogCoursePageUrl(id));

  return {
    schoolSlug,
    discoveredProgramPageCount: programUrls.size,
    discoveredCoursePageCount: coursePageUrls.length,
    programPageUrls: [...programUrls].sort((left, right) => left.localeCompare(right)),
    coursePageUrls,
    departmentCoursePagesScanned,
    departmentCoursePagesWithCourses,
    programPagesScannedForCourses,
    programsFromIndex,
    programsFromCrossLinks,
    programsFromCoursedogApi,
    coursesFromCoursedogApi,
    notes
  };
}

export async function runBerkeleyOfficialCatalogPipeline(input?: {
  schoolSlug?: string;
  programUrls?: string[];
  html?: string;
  includeDepartmentCoursePages?: boolean;
  scanProgramPagesForCourses?: boolean;
  syncPrograms?: boolean;
  importCourses?: boolean;
  syncInstructors?: boolean;
  syncRmp?: boolean;
  maxDepartments?: number;
  maxProgramPages?: number;
  maxCoursePages?: number;
  courseChunkSize?: number;
  departmentCodes?: string[];
  full?: boolean;
  resumeRunId?: string;
  createSyncRun?: boolean;
  onProgress?: (message: string) => void;
}): Promise<BerkeleyCatalogPipelineResult> {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  let syncRunId = input?.resumeRunId;
  let checkpoint: BerkeleySyncCheckpoint | null = null;

  if (syncRunId) {
    const existing = await getBerkeleySyncRun(syncRunId);
    if (!existing) {
      throw new Error(`Sync run not found: ${syncRunId}`);
    }
    checkpoint = parseCheckpoint(existing);
  } else if (input?.createSyncRun !== false && (input?.full || input?.resumeRunId)) {
    const run = await createBerkeleySyncRun({ schoolSlug, phase: "discover" });
    syncRunId = run.id;
  }

  const discovery = await discoverBerkeleyOfficialCatalogLinks({
    schoolSlug,
    programUrls: input?.programUrls,
    html: input?.html,
    includeDepartmentCoursePages: input?.includeDepartmentCoursePages,
    scanProgramPagesForCourses: input?.scanProgramPagesForCourses ?? true,
    maxDepartments: input?.maxDepartments,
    maxProgramPages: input?.maxProgramPages,
    full: input?.full,
    departmentCodes: input?.departmentCodes,
    onProgress: input?.onProgress
  });

  const fullCheckpoint: BerkeleySyncCheckpoint = {
    programPageUrls: discovery.programPageUrls,
    coursePageUrls: discovery.coursePageUrls,
    departmentCodes: input?.departmentCodes
  };

  if (syncRunId) {
    await updateBerkeleySyncRun(syncRunId, {
      phase: "sync_programs",
      discoveredProgramCount: discovery.discoveredProgramPageCount,
      discoveredCourseCount: discovery.discoveredCoursePageCount,
      checkpoint: fullCheckpoint
    });
  }

  const programOffset = checkpoint && syncRunId ? (await getBerkeleySyncRun(syncRunId))?.programOffset ?? 0 : 0;
  const maxProgramPages = input?.full ? discovery.programPageUrls.length : resolveMaxProgramPages(input);
  const programUrlsForSync = discovery.programPageUrls.slice(
    programOffset,
    maxProgramPages !== undefined ? programOffset + maxProgramPages : undefined
  );

  let programSync: BerkeleyOfficialProgramImportResult | undefined;
  if (input?.syncPrograms) {
    input?.onProgress?.(`Syncing ${programUrlsForSync.length} official program pages...`);
    programSync = await syncBerkeleyOfficialPrograms({
      schoolSlug,
      programUrls: programUrlsForSync,
      maxCoursePages: input?.full ? undefined : input?.maxCoursePages,
      onProgress: input.onProgress
    });
    if (syncRunId) {
      await updateBerkeleySyncRun(syncRunId, {
        programsSynced: (programSync.createdPrograms.length + programSync.updatedPrograms.length),
        programOffset: programOffset + programUrlsForSync.length
      });
    }
  }

  let courseImport: BerkeleyCatalogPipelineResult["courseImport"];
  if (input?.importCourses !== false) {
    const courseOffset =
      syncRunId && checkpoint ? (await getBerkeleySyncRun(syncRunId))?.courseOffset ?? 0 : 0;
    const chunkSize = input?.courseChunkSize ?? (input?.full ? discovery.coursePageUrls.length : 200);
    const courseBatch = discovery.coursePageUrls.slice(
      courseOffset,
      input?.full ? undefined : courseOffset + (input?.maxCoursePages ?? chunkSize)
    );

    input?.onProgress?.(`Importing ${courseBatch.length} catalog course pages (offset ${courseOffset})...`);
    courseImport = await importBerkeleyOfficialCatalogCoursePages({
      schoolSlug,
      coursePageUrls: courseBatch,
      maxCoursePages: input?.full ? undefined : input?.maxCoursePages,
      onProgress: input?.onProgress
    });

    if (syncRunId) {
      await updateBerkeleySyncRun(syncRunId, {
        phase: "import_courses",
        coursesImported: courseImport.importedCoursePageCount,
        courseOffset: courseOffset + courseImport.importedCoursePageCount,
        checkpoint: fullCheckpoint
      });
    }
  }

  if (input?.syncInstructors !== false && input?.importCourses !== false) {
    input?.onProgress?.("Normalizing instructors from offerings...");
    await normalizeInstructorsFromOfferings({ schoolSlug, limit: input?.full ? 5000 : 500 });
  }

  if (input?.syncRmp && input?.importCourses !== false) {
    input?.onProgress?.("Syncing Rate My Professors ratings...");
    await syncRmpForSchool({ schoolSlug, batchSize: 50, maxBatches: input?.full ? 20 : 2 });
  }

  if (syncRunId) {
    await updateBerkeleySyncRun(syncRunId, {
      phase: "completed",
      status: BerkeleySyncRunStatus.COMPLETED,
      completed: true
    });
  }

  return { discovery, programSync, courseImport, syncRunId };
}

/** Re-export for admin paste workflows that only need URL extraction. */
export { extractBerkeleyCatalogCoursePageUrls, extractBerkeleyCatalogProgramPageUrls };
