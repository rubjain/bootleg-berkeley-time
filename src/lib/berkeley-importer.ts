import { DataStatus, OfferingStatus } from "@prisma/client";
import { findOrCreateTerm } from "@/lib/berkeley-data-import";
import { getBerkeleyImportPlan } from "@/lib/berkeley-official-sources";
import { prisma } from "@/lib/prisma";

export type BerkeleyImporterPreview = {
  officialSources: ReturnType<typeof getBerkeleyImportPlan>;
  parserStatus: "scaffolded" | "html_parser_ready";
  nextStep: string;
};

export type BerkeleyCatalogLink = {
  href: string;
  title: string;
};

export type BerkeleyCatalogCourseRecord = {
  code: string;
  title: string;
  unitsText?: string;
  description?: string;
  prerequisiteText?: string;
};

export type BerkeleyProgramRequirementSection = {
  heading: string;
  items: string[];
};

export type BerkeleyCatalogParseSummary = {
  totalLinks: number;
  totalCourseRecords: number;
  prerequisiteCoverageCount: number;
  unitsCoverageCount: number;
  departmentCodes: string[];
  normalizedCandidateCount: number;
};

export type BerkeleyNormalizedCourseCandidate = {
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
};

export type BerkeleyScheduleOfferingRecord = {
  courseCode: string;
  courseTitle: string;
  instructorText?: string;
  status?: string;
  meetingText?: string;
  location?: string;
  projected: boolean;
  /** Parsed section/CCN hint when present in the row (e.g. LEC 001). */
  sectionHint?: string;
  /** Short decoded row text for component inference. */
  rawLineText: string;
};

export type BerkeleyScheduleParseSummary = {
  totalOfferings: number;
  projectedCount: number;
  withInstructorCount: number;
  withMeetingCount: number;
  statusBreakdown: Array<{ status: string; count: number }>;
};

export type BerkeleyCatalogParseResult = {
  sourceType: "catalog";
  sourceUrl: string;
  linkCount: number;
  courseCount: number;
  summary: BerkeleyCatalogParseSummary;
  links: BerkeleyCatalogLink[];
  courseRecords: BerkeleyCatalogCourseRecord[];
  requirementSections: BerkeleyProgramRequirementSection[];
  normalizedCandidates: BerkeleyNormalizedCourseCandidate[];
};

export type BerkeleyScheduleParseResult = {
  sourceType: "schedule";
  sourceUrl: string;
  offeringCount: number;
  summary: BerkeleyScheduleParseSummary;
  offerings: BerkeleyScheduleOfferingRecord[];
};

export type BerkeleyCatalogImportResult = {
  sourceUrl: string;
  schoolSlug: string;
  candidateCount: number;
  createdDepartments: string[];
  createdCourses: string[];
  updatedCourses: string[];
  skippedCourses: string[];
};

function stripTags(input: string) {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function extractCatalogLinks(html: string) {
  const links: BerkeleyCatalogLink[] = [];
  const pattern = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gim;

  for (const match of html.matchAll(pattern)) {
    const href = match[1];
    const title = decodeHtml(stripTags(match[2]));
    if (!href || !title) continue;

    if (
      href.includes("/courses/") ||
      href.includes("/programs/") ||
      href.includes("/departments/")
    ) {
      links.push({ href, title });
    }
  }

  return links;
}

export function extractCatalogCourseRecords(html: string) {
  const records: BerkeleyCatalogCourseRecord[] = [];
  const blocks = html.match(/<article[\s\S]*?<\/article>/gim) ?? html.match(/<section[\s\S]*?<\/section>/gim) ?? [];

  for (const block of blocks) {
    const text = decodeHtml(stripTags(block));
    const codeMatch = text.match(/([A-Z& ]+\s+[A-Z]?\d+[A-Z]?)\s+-\s+([^|]+)/);
    if (!codeMatch) continue;

    const code = codeMatch[1].trim();
    const title = codeMatch[2].trim();
    const unitsText = text.match(/(\d+(\.\d+)?\s*(units?|credits?))/i)?.[1];
    const prerequisiteText = text.match(/Prerequisites?:\s*(.*?)(?=(Course|Repeatable|Credit|$))/i)?.[1]?.trim();

    records.push({
      code,
      title,
      unitsText,
      description: text,
      prerequisiteText
    });
  }

  return records;
}

export function extractProgramRequirementSections(html: string) {
  const normalizedHtml = html.replace(/\r/g, "");
  const sections: BerkeleyProgramRequirementSection[] = [];
  const headingPattern = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>/gim;
  const headings = [...normalizedHtml.matchAll(headingPattern)];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = decodeHtml(stripTags(headings[index][2]));
    if (!/requirements?|plan of study|major map|minor requirements?/i.test(heading)) continue;

    const start = headings[index].index ?? 0;
    const end = headings[index + 1]?.index ?? normalizedHtml.length;
    const segment = normalizedHtml.slice(start, end);
    const listItems = [...segment.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gim)]
      .map((match) => decodeHtml(stripTags(match[1])))
      .filter(Boolean);

    if (listItems.length) {
      sections.push({
        heading,
        items: listItems.slice(0, 15)
      });
    }
  }

  return sections;
}

function summarizeCatalogRecords(
  links: BerkeleyCatalogLink[],
  courseRecords: BerkeleyCatalogCourseRecord[],
  normalizedCandidates: BerkeleyNormalizedCourseCandidate[]
): BerkeleyCatalogParseSummary {
  const departmentCodes = [
    ...new Set(
      courseRecords
        .map((record) => record.code.match(/^([A-Z& ]+)/)?.[1]?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ];

  return {
    totalLinks: links.length,
    totalCourseRecords: courseRecords.length,
    prerequisiteCoverageCount: courseRecords.filter((record) => Boolean(record.prerequisiteText)).length,
    unitsCoverageCount: courseRecords.filter((record) => Boolean(record.unitsText)).length,
    departmentCodes,
    normalizedCandidateCount: normalizedCandidates.length
  };
}

function slugifyCourseCode(courseCode: string) {
  return `ucb-${courseCode.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function slugifyDepartmentCode(departmentCode: string) {
  return departmentCode.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseUnitRange(unitsText?: string) {
  if (!unitsText) return {};

  const numbers = unitsText.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length === 0) return {};
  if (numbers.length === 1) return { unitsMin: numbers[0], unitsMax: numbers[0] };

  return {
    unitsMin: Math.min(...numbers),
    unitsMax: Math.max(...numbers)
  };
}

function inferCourseLevel(courseCode: string) {
  const numberText = courseCode.match(/(\d{1,3})/)?.[1];
  const courseNumber = numberText ? Number(numberText) : undefined;

  if (!courseNumber) return "Unknown";
  if (courseNumber >= 100) return "Upper Division";
  return "Lower Division";
}

function inferBreadthTags(record: BerkeleyCatalogCourseRecord) {
  const text = `${record.title} ${record.description ?? ""}`.toLowerCase();
  const tags = new Set<string>();

  if (/ethic/.test(text)) tags.add("Human Contexts");
  if (/economics|market|policy/.test(text)) tags.add("Social and Behavioral Sciences");
  if (/physics|mechanics|thermodynamics/.test(text)) tags.add("Physical Science");
  if (/biology|health|disease/.test(text)) tags.add("Biological Science");
  if (/cognitive|mind|behavior/.test(text)) tags.add("Social and Behavioral Sciences");

  return [...tags];
}

function inferRequirementTags(record: BerkeleyCatalogCourseRecord) {
  const text = `${record.code} ${record.title} ${record.description ?? ""}`.toLowerCase();
  const tags = new Set<string>();

  if (/compsci/.test(text)) tags.add("cs");
  if (/data|analytics|database|mining/.test(text)) tags.add("data");
  if (/probability|statistics|inference/.test(text)) tags.add("statistics-foundation");
  if (/algorithm/.test(text)) tags.add("algorithms");
  if (/systems|operating system/.test(text)) tags.add("systems");
  if (/ethic/.test(text)) tags.add("data-ethics");
  if (/business|finance|accounting|leadership/.test(text)) tags.add("business-core");
  if (/biology|physiology|disease|organismal/.test(text)) tags.add("biology-core");
  if (/math|linear algebra|calculus|proof/.test(text)) tags.add("math-foundation");
  if (/engineering|scientists and engineers/.test(text)) tags.add("engineering-foundation");
  if (/ai|artificial intelligence|cognition/.test(text)) tags.add("ai");

  return [...tags];
}

function inferImportConfidence(record: BerkeleyCatalogCourseRecord) {
  if (record.unitsText && record.prerequisiteText) return "HIGH" as const;
  if (record.unitsText || record.prerequisiteText) return "MEDIUM" as const;
  return "LOW" as const;
}

export function normalizeCatalogCourseRecords(records: BerkeleyCatalogCourseRecord[]) {
  return records.map((record) => {
    const departmentCode = record.code.match(/^([A-Z& ]+)/)?.[1]?.trim() ?? "UNKNOWN";
    const units = parseUnitRange(record.unitsText);

    return {
      code: record.code,
      departmentCode,
      slug: slugifyCourseCode(record.code),
      title: record.title,
      description: record.description,
      unitsMin: units.unitsMin,
      unitsMax: units.unitsMax,
      level: inferCourseLevel(record.code),
      breadthTags: inferBreadthTags(record),
      requirementTags: inferRequirementTags(record),
      prerequisitesText: record.prerequisiteText,
      importConfidence: inferImportConfidence(record)
    };
  });
}

const berkeleyDepartmentMetadata: Record<string, { name: string; website?: string }> = {
  COMPSCI: {
    name: "Electrical Engineering and Computer Sciences",
    website: "https://eecs.berkeley.edu"
  },
  DATA: {
    name: "Data Science Undergraduate Studies",
    website: "https://data.berkeley.edu"
  },
  UGBA: {
    name: "Haas School of Business Undergraduate Program",
    website: "https://haas.berkeley.edu/undergrad"
  },
  IB: {
    name: "Integrative Biology",
    website: "https://ib.berkeley.edu"
  },
  MATH: {
    name: "Mathematics",
    website: "https://math.berkeley.edu"
  },
  STAT: {
    name: "Statistics",
    website: "https://statistics.berkeley.edu"
  },
  COGSCI: {
    name: "Cognitive Science Program",
    website: "https://cogsci.berkeley.edu"
  },
  ECON: {
    name: "Economics",
    website: "https://www.econ.berkeley.edu"
  },
  ENGIN: {
    name: "College of Engineering",
    website: "https://engineering.berkeley.edu"
  },
  PHYSICS: {
    name: "Physics",
    website: "https://physics.berkeley.edu"
  }
};

function fallbackDepartmentName(departmentCode: string) {
  return departmentCode
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function extractScheduleOfferings(html: string) {
  const records: BerkeleyScheduleOfferingRecord[] = [];
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gim) ?? html.match(/<article[\s\S]*?<\/article>/gim) ?? [];

  for (const row of rows) {
    const text = decodeHtml(stripTags(row));
    const codeMatch = text.match(/([A-Z& ]+\s+[A-Z]?\d+[A-Z]?)/);
    if (!codeMatch) continue;

    const courseCode = codeMatch[1].trim();
    const statusMatch = text.match(/\b(OPEN|CLOSED|WAITLIST|PLANNED|PROJECTED)\b/i);
    const instructorMatch = text.match(/Instructor[s]?:\s*([^|]+?)(?=(Location|Meeting|Status|$))/i);
    const locationMatch = text.match(/Location:\s*([^|]+?)(?=(Meeting|Status|Instructor|$))/i);
    const meetingMatch = text.match(/(MWF|TuTh|MW|Tu|Th|F)\s+\d{1,2}:\d{2}/);
    const sectionFromLabel =
      text.match(/\b(?:Section|Sec\.?)\s*([A-Z0-9]{1,5})\b/i)?.[1]?.toUpperCase() ??
      text.match(/\b(?:LEC|LAB|SEM|DIS|TUT)\s+(\d{1,3})\b/i)?.[1];
    const sectionHint =
      sectionFromLabel && /^\d+$/.test(sectionFromLabel) ? sectionFromLabel.padStart(3, "0") : sectionFromLabel;

    records.push({
      courseCode,
      courseTitle: text.replace(courseCode, "").trim().slice(0, 120),
      instructorText: instructorMatch?.[1]?.trim(),
      status: statusMatch?.[1]?.toUpperCase(),
      meetingText: meetingMatch?.[0],
      location: locationMatch?.[1]?.trim(),
      projected: /projected/i.test(text),
      sectionHint,
      rawLineText: text.slice(0, 240)
    });
  }

  return records;
}

function summarizeScheduleOfferings(offerings: BerkeleyScheduleOfferingRecord[]): BerkeleyScheduleParseSummary {
  const statusCounts = new Map<string, number>();

  for (const offering of offerings) {
    const status = offering.status ?? "UNKNOWN";
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  return {
    totalOfferings: offerings.length,
    projectedCount: offerings.filter((offering) => offering.projected).length,
    withInstructorCount: offerings.filter((offering) => Boolean(offering.instructorText)).length,
    withMeetingCount: offerings.filter((offering) => Boolean(offering.meetingText)).length,
    statusBreakdown: [...statusCounts.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((left, right) => right.count - left.count)
  };
}

export async function fetchBerkeleyOfficialHtml(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    headers: {
      "User-Agent": "CourseMap-Berkeley-Importer/0.1"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Berkeley source: ${response.status}`);
  }

  return response.text();
}

const DEFAULT_PARSE_PREVIEW = {
  links: 30,
  courseRecords: 30,
  requirementSections: 8,
  normalizedCandidates: 50,
  scheduleOfferings: 40
};

const BERKELEY_CATALOG_COURSE_ID = /[a-zA-Z0-9]{6,}/;

export function berkeleyCatalogCoursePageUrl(coursePageId: string) {
  return `https://undergraduate.catalog.berkeley.edu/courses/${coursePageId}`;
}

/** Collects official catalog course page ids embedded in Berkeley catalog HTML / Nuxt payloads. */
export function extractBerkeleyCatalogCoursePageIds(html: string): string[] {
  const ids = new Set<string>();
  for (const match of html.matchAll(/courseGroupId:"([^"]+)"/gi)) {
    const id = match[1]?.trim();
    if (id && BERKELEY_CATALOG_COURSE_ID.test(id)) ids.add(id);
  }
  for (const match of html.matchAll(/https:\/\/undergraduate\.catalog\.berkeley\.edu\/courses\/([a-zA-Z0-9]+)/gi)) {
    ids.add(match[1]);
  }
  for (const match of html.matchAll(/["'](\/courses\/([a-zA-Z0-9]+))["']/gi)) {
    if (match[2]) ids.add(match[2]);
  }
  return [...ids].sort((left, right) => left.localeCompare(right));
}

export function extractBerkeleyCatalogCoursePageUrls(html: string): string[] {
  return extractBerkeleyCatalogCoursePageIds(html).map((id) => berkeleyCatalogCoursePageUrl(id));
}

export function extractBerkeleyCatalogProgramPageUrls(html: string): string[] {
  const codes = new Set<string>();
  for (const match of html.matchAll(/https:\/\/undergraduate\.catalog\.berkeley\.edu\/programs\/([A-Z0-9]+U)/gi)) {
    codes.add(match[1]);
  }
  for (const match of html.matchAll(/["'](\/programs\/([A-Z0-9]+U))["']/gi)) {
    if (match[2]) codes.add(match[2]);
  }
  return [...codes]
    .sort((left, right) => left.localeCompare(right))
    .map((code) => `https://undergraduate.catalog.berkeley.edu/programs/${code}`);
}

export async function parseBerkeleyOfficialSource(input: {
  sourceType: "catalog" | "schedule";
  sourceUrl: string;
  html?: string;
  /** When true (default), response arrays are truncated for admin UI previews. Set false before DB import. */
  preview?: boolean;
}): Promise<BerkeleyCatalogParseResult | BerkeleyScheduleParseResult> {
  const html = input.html ?? (await fetchBerkeleyOfficialHtml(input.sourceUrl));
  const preview = input.preview ?? true;
  const lim = DEFAULT_PARSE_PREVIEW;

  if (input.sourceType === "catalog") {
    const links = extractCatalogLinks(html);
    const courseRecords = extractCatalogCourseRecords(html);
    const requirementSections = extractProgramRequirementSections(html);
    const normalizedCandidates = normalizeCatalogCourseRecords(courseRecords);

    return {
      sourceType: input.sourceType,
      sourceUrl: input.sourceUrl,
      linkCount: links.length,
      courseCount: courseRecords.length,
      summary: summarizeCatalogRecords(links, courseRecords, normalizedCandidates),
      links: preview ? links.slice(0, lim.links) : links,
      courseRecords: preview ? courseRecords.slice(0, lim.courseRecords) : courseRecords,
      requirementSections: preview ? requirementSections.slice(0, lim.requirementSections) : requirementSections,
      normalizedCandidates: preview ? normalizedCandidates.slice(0, lim.normalizedCandidates) : normalizedCandidates
    };
  }

  const offerings = extractScheduleOfferings(html);

  return {
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    offeringCount: offerings.length,
    summary: summarizeScheduleOfferings(offerings),
    offerings: preview ? offerings.slice(0, lim.scheduleOfferings) : offerings
  };
}

export async function importBerkeleyCatalogCourses(input: {
  sourceUrl: string;
  html?: string;
  schoolSlug?: string;
}): Promise<BerkeleyCatalogImportResult> {
  const schoolSlug = input.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({
    where: { slug: schoolSlug }
  });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const parsed = await parseBerkeleyOfficialSource({
    sourceType: "catalog",
    sourceUrl: input.sourceUrl,
    html: input.html,
    preview: false
  });

  if (parsed.sourceType !== "catalog") {
    throw new Error("Catalog import can only run against catalog parser results");
  }

  const createdDepartments = new Set<string>();
  const createdCourses: string[] = [];
  const updatedCourses: string[] = [];
  const skippedCourses: string[] = [];

  for (const candidate of parsed.normalizedCandidates) {
    if (!candidate.title || !candidate.description || !candidate.unitsMin || !candidate.unitsMax) {
      skippedCourses.push(candidate.code);
      continue;
    }

    const departmentMeta = berkeleyDepartmentMetadata[candidate.departmentCode];
    const existingDepartment = await prisma.department.findUnique({
      where: {
        schoolId_code: {
          schoolId: school.id,
          code: candidate.departmentCode
        }
      },
      select: { id: true }
    });

    const department = await prisma.department.upsert({
      where: {
        schoolId_code: {
          schoolId: school.id,
          code: candidate.departmentCode
        }
      },
      update: {
        name: departmentMeta?.name ?? fallbackDepartmentName(candidate.departmentCode),
        website: departmentMeta?.website
      },
      create: {
        schoolId: school.id,
        code: candidate.departmentCode,
        slug: slugifyDepartmentCode(candidate.departmentCode),
        name: departmentMeta?.name ?? fallbackDepartmentName(candidate.departmentCode),
        website: departmentMeta?.website
      }
    });

    if (!existingDepartment) {
      createdDepartments.add(candidate.departmentCode);
    }

    const existingCourse = await prisma.course.findUnique({
      where: { slug: candidate.slug },
      select: { id: true }
    });

    await prisma.course.upsert({
      where: { slug: candidate.slug },
      update: {
        schoolId: school.id,
        departmentId: department.id,
        code: candidate.code,
        title: candidate.title,
        description: candidate.description,
        unitsMin: candidate.unitsMin,
        unitsMax: candidate.unitsMax,
        level: candidate.level,
        breadthTags: candidate.breadthTags,
        requirementTags: candidate.requirementTags,
        prerequisitesText: candidate.prerequisitesText
      },
      create: {
        schoolId: school.id,
        departmentId: department.id,
        code: candidate.code,
        slug: candidate.slug,
        title: candidate.title,
        description: candidate.description,
        unitsMin: candidate.unitsMin,
        unitsMax: candidate.unitsMax,
        level: candidate.level,
        breadthTags: candidate.breadthTags,
        requirementTags: candidate.requirementTags,
        prerequisitesText: candidate.prerequisitesText
      }
    });

    if (existingCourse) {
      updatedCourses.push(candidate.code);
    } else {
      createdCourses.push(candidate.code);
    }
  }

  return {
    sourceUrl: input.sourceUrl,
    schoolSlug,
    candidateCount: parsed.normalizedCandidates.length,
    createdDepartments: [...createdDepartments].sort(),
    createdCourses,
    updatedCourses,
    skippedCourses
  };
}

function djb2Base36(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(h >>> 0).toString(36).slice(0, 12);
}

function deriveScheduleSectionCode(record: BerkeleyScheduleOfferingRecord): string {
  if (record.sectionHint) {
    return `sec-${record.sectionHint}`;
  }
  return `h-${djb2Base36(
    [record.courseCode, record.instructorText ?? "", record.meetingText ?? "", record.location ?? ""].join("|")
  )}`;
}

function inferScheduleComponent(raw: string): string {
  if (/\bLAB\b/i.test(raw)) return "LAB";
  if (/\bDIS\b/i.test(raw)) return "DIS";
  if (/\bSEM\b/i.test(raw)) return "SEM";
  if (/\bTUT\b/i.test(raw)) return "TUT";
  return "LEC";
}

function splitMeetingFields(meetingText?: string): {
  meetingDays?: string;
  timeStart?: string;
  timeEnd?: string;
} {
  if (!meetingText) return {};
  const match = meetingText.match(/^([A-Za-z]+)\s+(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/);
  if (!match) return { meetingDays: meetingText };
  return { meetingDays: match[1], timeStart: match[2], timeEnd: match[3] };
}

function mapScheduleOfferingStatus(rawStatus: string | undefined, projected: boolean): OfferingStatus {
  if (projected) return OfferingStatus.PROJECTED;
  switch (rawStatus) {
    case "OPEN":
      return OfferingStatus.OPEN;
    case "CLOSED":
      return OfferingStatus.CLOSED;
    case "WAITLIST":
      return OfferingStatus.WAITLIST;
    case "PLANNED":
      return OfferingStatus.PLANNED;
    case "PROJECTED":
      return OfferingStatus.PROJECTED;
    default:
      return OfferingStatus.PLANNED;
  }
}

function buildScheduleCourseLookup(
  courses: Array<{ id: string; code: string; departmentId: string }>
): Map<string, { id: string; code: string; departmentId: string }> {
  const map = new Map<string, { id: string; code: string; departmentId: string }>();
  for (const course of courses) {
    const upperSpaced = course.code.replace(/\s+/g, " ").trim().toUpperCase();
    map.set(upperSpaced, course);
    map.set(course.code.replace(/\s+/g, "").toUpperCase(), course);
  }
  return map;
}

function lookupCourseFromScheduleMap(
  map: Map<string, { id: string; code: string; departmentId: string }>,
  scheduleCode: string
) {
  const normalized = scheduleCode.replace(/\s+/g, " ").trim().toUpperCase();
  return map.get(normalized) ?? map.get(normalized.replace(/ /g, ""));
}

export type BerkeleyScheduleImportResult = {
  sourceUrl: string;
  schoolSlug: string;
  termCode: string;
  parsedRowCount: number;
  processedRowCount: number;
  createdOfferings: number;
  updatedOfferings: number;
  skippedRowCount: number;
  skippedUnknownCourses: string[];
};

export async function importBerkeleyScheduleOfferings(input: {
  sourceUrl: string;
  html?: string;
  termCode: string;
  schoolSlug?: string;
  maxRows?: number;
}): Promise<BerkeleyScheduleImportResult> {
  const schoolSlug = input.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const html = input.html ?? (await fetchBerkeleyOfficialHtml(input.sourceUrl));
  const offerings = extractScheduleOfferings(html);
  const limit = Math.min(Math.max(input.maxRows ?? 5000, 1), 10000);
  const capped = offerings.slice(0, limit);

  const term = await findOrCreateTerm({ schoolId: school.id, termCode: input.termCode });
  if (!term) {
    throw new Error("termCode is required to attach schedule rows to a term");
  }

  const courseRows = await prisma.course.findMany({
    where: { schoolId: school.id },
    select: { id: true, code: true, departmentId: true }
  });
  const courseLookup = buildScheduleCourseLookup(courseRows);

  const skippedUnknownCourses = new Set<string>();
  let createdOfferings = 0;
  let updatedOfferings = 0;
  let skippedRowCount = 0;

  for (const row of capped) {
    const course = lookupCourseFromScheduleMap(courseLookup, row.courseCode);
    if (!course) {
      skippedRowCount += 1;
      skippedUnknownCourses.add(row.courseCode);
      continue;
    }

    const sectionCode = deriveScheduleSectionCode(row);
    const uniqueKey = {
      termId: term.id,
      courseId: course.id,
      sectionCode
    };

    const existing = await prisma.courseOffering.findUnique({
      where: { termId_courseId_sectionCode: uniqueKey },
      select: { id: true }
    });

    const meeting = splitMeetingFields(row.meetingText);
    const status = mapScheduleOfferingStatus(row.status, row.projected);
    const component = inferScheduleComponent(row.rawLineText);

    await prisma.courseOffering.upsert({
      where: { termId_courseId_sectionCode: uniqueKey },
      create: {
        ...uniqueKey,
        component,
        instructorText: row.instructorText,
        location: row.location,
        meetingDays: meeting.meetingDays,
        timeStart: meeting.timeStart,
        timeEnd: meeting.timeEnd,
        status,
        isProjected: row.projected,
        dataStatus: row.projected ? DataStatus.PROJECTED : DataStatus.OFFICIAL
      },
      update: {
        component,
        instructorText: row.instructorText,
        location: row.location,
        meetingDays: meeting.meetingDays,
        timeStart: meeting.timeStart,
        timeEnd: meeting.timeEnd,
        status,
        isProjected: row.projected,
        dataStatus: row.projected ? DataStatus.PROJECTED : DataStatus.OFFICIAL
      }
    });

    if (existing) {
      updatedOfferings += 1;
    } else {
      createdOfferings += 1;
    }
  }

  return {
    sourceUrl: input.sourceUrl,
    schoolSlug,
    termCode: input.termCode,
    parsedRowCount: offerings.length,
    processedRowCount: capped.length,
    createdOfferings,
    updatedOfferings,
    skippedRowCount,
    skippedUnknownCourses: [...skippedUnknownCourses].sort()
  };
}

export function previewBerkeleyFullCourseImport(): BerkeleyImporterPreview {
  return {
    officialSources: getBerkeleyImportPlan(),
    parserStatus: "html_parser_ready",
    nextStep:
      "Use the catalog parser to enumerate official Berkeley catalog links and course records, then use the schedule parser on classes.berkeley.edu HTML snapshots to normalize term offerings and enrollment state."
  };
}
