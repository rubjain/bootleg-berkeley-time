const COURSEDOG_SCHOOL = "ucberkeley_peoplesoft";
const COURSEDOG_BASE = "https://app.coursedog.com/api/v1";
const CATALOG_ORIGIN = "https://undergraduate.catalog.berkeley.edu";

export type CoursedogCourseRecord = {
  _id: string;
  code?: string;
  subjectCode?: string;
  courseNumber?: string;
  courseGroupId?: string;
  longName?: string;
  name?: string;
  description?: string;
  catalogDescription?: string;
  prerequisiteTextForCms?: string;
  attributes?: string[];
  credits?: {
    creditHours?: { min?: number; max?: number };
    numberOfCredits?: number;
  };
  career?: string;
  archived?: boolean;
  catalogPrint?: boolean;
  status?: string;
  lastEditedAt?: number;
  requisites?: {
    requisitesSimple?: Array<{
      showInCatalog?: boolean;
      name?: string;
      type?: string;
      rules?: Array<{ name?: string; description?: string; value?: string; restriction?: number }>;
    }>;
  };
};

export type CoursedogProgramRecord = {
  _id: string;
  code?: string;
  catalogDisplayName?: string;
  catalogDescription?: string;
  catalogFullDescription?: string;
  type?: string;
  career?: string;
  archived?: boolean;
  requisites?: CoursedogCourseRecord["requisites"];
};

function coursedogHeaders() {
  return {
    "User-Agent": "CourseMap-Berkeley-Official-Sync/0.4",
    Accept: "application/json",
    "X-Requested-With": "catalog",
    Origin: CATALOG_ORIGIN,
    Referer: `${CATALOG_ORIGIN}/`
  };
}

async function coursedogGet<T extends Record<string, unknown>>(path: string): Promise<T> {
  const response = await fetch(`${COURSEDOG_BASE}${path}`, {
    headers: coursedogHeaders(),
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Coursedog API ${response.status} for ${path}: ${text.slice(0, 200)}`);
  }

  return (await response.json()) as T;
}

export async function fetchAllCoursedogCourses(input?: {
  limit?: number;
  maxRecords?: number;
  onProgress?: (message: string) => void;
}) {
  const limit = input?.limit ?? 200;
  const records = new Map<string, CoursedogCourseRecord>();
  let skip = 0;
  let stagnantBatches = 0;

  while (true) {
    if (input?.maxRecords && records.size >= input.maxRecords) break;

    input?.onProgress?.(`Fetching Coursedog courses skip=${skip} (${records.size} unique)...`);
    const batch = await coursedogGet<Record<string, CoursedogCourseRecord>>(
      `/cm/${COURSEDOG_SCHOOL}/courses?limit=${limit}&skip=${skip}&sortBy=code`
    );
    const entries = Object.values(batch);
    if (!entries.length) break;

    const sizeBefore = records.size;
    for (const course of entries) {
      if (course.archived) continue;
      if (course.career && course.career !== "Undergraduate") continue;
      if (course.status && course.status !== "Active") continue;
      const key = course.courseGroupId ?? course.code ?? course._id;
      const existing = records.get(key);
      if (!existing || (course.lastEditedAt ?? 0) > (existing.lastEditedAt ?? 0)) {
        records.set(key, course);
      }
    }

    stagnantBatches = records.size === sizeBefore ? stagnantBatches + 1 : 0;
    if (stagnantBatches >= 5) break;

    skip += limit;
    if (entries.length < limit) break;
  }

  return [...records.values()];
}

export async function fetchAllCoursedogPrograms(input?: {
  limit?: number;
  onProgress?: (message: string) => void;
}) {
  const limit = input?.limit ?? 200;
  const records = new Map<string, CoursedogProgramRecord>();
  let skip = 0;

  while (true) {
    input?.onProgress?.(`Fetching Coursedog programs skip=${skip}...`);
    const batch = await coursedogGet<Record<string, CoursedogProgramRecord>>(
      `/cm/${COURSEDOG_SCHOOL}/programs?limit=${limit}&skip=${skip}`
    );
    const entries = Object.values(batch);
    if (!entries.length) break;

    for (const program of entries) {
      if (program.archived) continue;
      records.set(program._id, program);
    }

    skip += limit;
    if (entries.length < limit) break;
  }

  return [...records.values()];
}

export function coursedogCourseCatalogUrl(courseGroupId: string) {
  return `${CATALOG_ORIGIN}/courses/${courseGroupId}`;
}

export function coursedogProgramCatalogUrl(programId: string) {
  return `${CATALOG_ORIGIN}/programs/${programId}`;
}
