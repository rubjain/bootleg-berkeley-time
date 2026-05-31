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

const OFFICIAL_FETCH_DELAY_MS = 80;

export type BerkeleyCatalogDiscoveryResult = {
  schoolSlug: string;
  discoveredProgramPageCount: number;
  discoveredCoursePageCount: number;
  programPageUrls: string[];
  coursePageUrls: string[];
  departmentCoursePagesScanned: number;
  departmentCoursePagesWithCourses: number;
  programPagesScannedForCourses: number;
  notes: string[];
};

export type BerkeleyCatalogPipelineResult = {
  discovery: BerkeleyCatalogDiscoveryResult;
  programSync?: BerkeleyOfficialProgramImportResult;
  courseImport?: Awaited<ReturnType<typeof importBerkeleyOfficialCatalogCoursePages>>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function departmentCoursesUrl(departmentCode: string) {
  return `https://undergraduate.catalog.berkeley.edu/departments/${encodeURIComponent(departmentCode)}/courses`;
}

export async function discoverBerkeleyOfficialCatalogLinks(input?: {
  schoolSlug?: string;
  programUrls?: string[];
  html?: string;
  includeDepartmentCoursePages?: boolean;
  scanProgramPagesForCourses?: boolean;
  maxDepartments?: number;
  maxProgramPages?: number;
  departmentCodes?: string[];
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

  let departmentCoursePagesScanned = 0;
  let departmentCoursePagesWithCourses = 0;

  if (input?.includeDepartmentCoursePages !== false) {
    const departments = await getBerkeleyOfficialDepartments();
    const selected = input?.departmentCodes?.length
      ? departments.filter((department) => input.departmentCodes!.includes(department.code))
      : departments;
    const maxDepartments = Math.min(Math.max(input?.maxDepartments ?? 177, 1), 250);
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
  if (input?.scanProgramPagesForCourses) {
    const programList = [...programUrls].slice(0, Math.min(Math.max(input?.maxProgramPages ?? 40, 1), 200));
    for (const [index, programUrl] of programList.entries()) {
      if (index > 0) {
        await sleep(OFFICIAL_FETCH_DELAY_MS);
      }
      input?.onProgress?.(`Scanning program page ${index + 1}/${programList.length} for course links`);
      programPagesScannedForCourses += 1;
      try {
        const html = await fetchOfficialHtml(programUrl);
        for (const id of extractBerkeleyCatalogCoursePageIds(html)) {
          coursePageIds.add(id);
        }
        for (const url of extractBerkeleyCatalogProgramPageUrls(html)) {
          programUrls.add(url);
        }
      } catch {
        notes.push(`Skipped program page scan: ${programUrl}`);
      }
    }
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
  maxDepartments?: number;
  maxProgramPages?: number;
  maxCoursePages?: number;
  departmentCodes?: string[];
  onProgress?: (message: string) => void;
}): Promise<BerkeleyCatalogPipelineResult> {
  const discovery = await discoverBerkeleyOfficialCatalogLinks({
    schoolSlug: input?.schoolSlug,
    programUrls: input?.programUrls,
    html: input?.html,
    includeDepartmentCoursePages: input?.includeDepartmentCoursePages,
    scanProgramPagesForCourses: input?.scanProgramPagesForCourses ?? true,
    maxDepartments: input?.maxDepartments,
    maxProgramPages: input?.maxProgramPages,
    departmentCodes: input?.departmentCodes,
    onProgress: input?.onProgress
  });

  let programSync: BerkeleyOfficialProgramImportResult | undefined;
  if (input?.syncPrograms) {
    const maxProgramPages = Math.min(Math.max(input?.maxProgramPages ?? 40, 1), 200);
    const programUrlsForSync = discovery.programPageUrls.slice(0, maxProgramPages);
    input?.onProgress?.(`Syncing ${programUrlsForSync.length} official program pages...`);
    programSync = await syncBerkeleyOfficialPrograms({
      schoolSlug: input.schoolSlug,
      programUrls: programUrlsForSync,
      maxCoursePages: input?.maxCoursePages,
      onProgress: input.onProgress
    });
  }

  let courseImport: BerkeleyCatalogPipelineResult["courseImport"];
  if (input?.importCourses !== false) {
    input?.onProgress?.(
      `Importing discovered catalog course pages (up to ${input?.maxCoursePages ?? discovery.coursePageUrls.length})...`
    );
    courseImport = await importBerkeleyOfficialCatalogCoursePages({
      schoolSlug: input?.schoolSlug,
      coursePageUrls: discovery.coursePageUrls,
      maxCoursePages: input?.maxCoursePages,
      onProgress: input?.onProgress
    });
  }

  return { discovery, programSync, courseImport };
}

/** Re-export for admin paste workflows that only need URL extraction. */
export { extractBerkeleyCatalogCoursePageUrls, extractBerkeleyCatalogProgramPageUrls };
