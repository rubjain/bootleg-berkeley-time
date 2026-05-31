import {
  ConfidenceLevel,
  DataStatus,
  Prisma,
  ProgramType,
  RequirementRuleType,
  RequirementSourceType,
  RequirementSyncStatus
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  berkeleyCatalogCoursePageUrl,
  extractBerkeleyCatalogCoursePageIds,
  extractBerkeleyCatalogProgramPageUrls
} from "@/lib/berkeley-importer";
import { berkeleyOfficialSources } from "@/lib/berkeley-official-sources";
import { ParsedRequirementDocument } from "@/lib/importers/requirements/types";

type BerkeleyNuxtWindow = {
  routePath?: string;
  state?: {
    departments?: {
      all?: Array<{
        id: string;
        displayName?: string;
        name?: string;
        status?: string;
      }>;
    };
  };
  data?: Array<Record<string, unknown>>;
};

type BerkeleyDepartmentStateRecord = {
  id: string;
  displayName?: string;
  name?: string;
  status?: string;
};

type BerkeleyProgramRuleNode = {
  id?: string;
  condition?: string;
  name?: string;
  description?: string;
  notes?: string;
  restriction?: number;
  value?: {
    condition?: string;
    values?: Array<{
      value?: string[];
      logic?: string;
    }>;
  };
};

type BerkeleyProgramRequisite = {
  id?: string;
  name?: string;
  type?: string;
  showInCatalog?: boolean;
  requirementLevel?: string;
  notes?: string;
  description?: string;
  position?: number;
  rules?: BerkeleyProgramRuleNode[];
};

type BerkeleyProgramPayload = {
  code?: string;
  name?: string;
  catalogDescription?: string;
  catalogFullDescription?: string;
  degreeDesignation?: string;
  requisites?: {
    requisitesSimple?: BerkeleyProgramRequisite[];
  };
  ssPfM?: string[];
  type?: string;
};

type BerkeleyProgramRootRevision = {
  departmentOwnership?: Array<{
    deptId?: string;
    percentOwnership?: number;
  }>;
};

type BerkeleyCoursePayload = {
  subjectCode?: string;
  courseNumber?: string;
  code?: string;
  longName?: string;
  name?: string;
  description?: string;
  approvedBreadthAreas?: string[];
  prerequisiteTextForCms?: string;
  credits?: {
    creditHours?: {
      min?: number;
      max?: number;
    };
    numberOfCredits?: number;
  };
  courseGroupId?: string;
  departments?: Array<{
    id?: string;
    displayName?: string;
    name?: string;
  }>;
  catalogAttributes?: string[];
};

export type BerkeleyOfficialDepartmentRecord = {
  code: string;
  name: string;
  slug: string;
};

export type BerkeleyOfficialDepartmentImportResult = {
  sourceUrl: string;
  schoolSlug: string;
  officialDepartmentCount: number;
  createdDepartments: string[];
  updatedDepartments: string[];
};

export type BerkeleyOfficialProgramImportResult = {
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

export type BerkeleyOfficialCoverageReport = {
  schoolSlug: string;
  localDepartmentCount: number;
  localCourseCount: number;
  localProgramCount: number;
  localMajorCount: number;
  localMinorCount: number;
  officialDepartmentCount?: number;
  syncedProgramSourceCount: number;
  lastSyncedAt?: string | null;
  officialCatalogEndpointStatus: "public_pages_only" | "search_endpoint_blocked";
  notes: string[];
};

type BerkeleyParsedProgramPage = {
  sourceUrl: string;
  pageTitle: string;
  programCode: string;
  programType: ProgramType;
  degreeLabel?: string;
  departmentCode?: string;
  overview: string;
  rawPayload: BerkeleyProgramPayload;
  parsedRequirements: ParsedRequirementDocument;
  referencedCoursePageUrls: string[];
};

type BerkeleyParsedCoursePage = {
  sourceUrl: string;
  subjectCode: string;
  courseNumber: string;
  courseCode: string;
  slug: string;
  title: string;
  description: string;
  departmentCode: string;
  departmentName: string;
  breadthTags: string[];
  requirementTags: string[];
  prerequisitesText?: string;
  unitsMin: number;
  unitsMax: number;
  level: string;
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

function normalizeText(input?: string) {
  return input ? decodeHtml(stripTags(input)).replace(/\s+/g, " ").trim() : "";
}

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatCourseCode(subjectCode?: string, courseNumber?: string, fallbackCode?: string) {
  if (subjectCode && courseNumber) return `${subjectCode} ${courseNumber}`.trim();
  if (fallbackCode) {
    const match = fallbackCode.match(/^([A-Z&]+)([A-Z]?\d+[A-Z]?)$/);
    if (match) return `${match[1]} ${match[2]}`;
  }

  return fallbackCode ?? "UNKNOWN";
}

function inferCourseLevel(course: BerkeleyCoursePayload) {
  const joined = (course.catalogAttributes ?? []).join(" ").toLowerCase();
  if (joined.includes("ugud")) return "Upper Division";
  if (joined.includes("ugld")) return "Lower Division";

  const number = Number(course.courseNumber?.match(/\d+/)?.[0] ?? "");
  if (Number.isFinite(number) && number >= 100) return "Upper Division";
  if (Number.isFinite(number) && number > 0) return "Lower Division";
  return "Undergraduate";
}

function inferRequirementTags(text: string) {
  const normalized = text.toLowerCase();
  const tags = new Set<string>();

  if (/compsci|computer science|eecs/.test(normalized)) tags.add("cs");
  if (/data science|analytics|data /.test(normalized)) tags.add("data");
  if (/statistics|probability|inference/.test(normalized)) tags.add("statistics-foundation");
  if (/math|calculus|linear algebra|proof/.test(normalized)) tags.add("math-foundation");
  if (/business|finance|accounting|leadership/.test(normalized)) tags.add("business-core");
  if (/ethic/.test(normalized)) tags.add("data-ethics");
  if (/artificial intelligence|machine learning|ai /.test(normalized)) tags.add("ai");

  return [...tags];
}

function extractCourseCodes(input: string) {
  const matches = input.match(/\b[A-Z][A-Z& ]{1,12}\s+[A-Z]?\d+[A-Z]?\b/g) ?? [];
  return [...new Set(matches.map((match) => match.replace(/\s+/g, " ").trim()))];
}

function extractDepartmentCodes(courseCodes: string[]) {
  return [
    ...new Set(
      courseCodes
        .map((code) => code.match(/^([A-Z][A-Z& ]+)/)?.[1]?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ];
}

function parseMinUnits(input: string) {
  const match = input.match(/at least\s+(\d+)\s+units?/i) ?? input.match(/minimum\s+of\s+(\d+)\s+units?/i);
  return match ? Number(match[1]) : undefined;
}

function inferMinSelectFromText(input: string, fallbackCount: number) {
  const normalized = input.toLowerCase();

  if (/one of|choose 1|select 1|at least one/.test(normalized)) return 1;
  if (/two of|choose 2|select 2|at least two/.test(normalized)) return 2;
  if (/three of|choose 3|select 3|at least three/.test(normalized)) return 3;
  if (/four of|choose 4|select 4|at least four/.test(normalized)) return 4;
  if (/all of|complete both|required/.test(normalized)) return fallbackCount || undefined;

  return fallbackCount > 1 ? fallbackCount : undefined;
}

function parseProgramType(input?: string) {
  const normalized = (input ?? "").toLowerCase();
  if (normalized.includes("minor")) return ProgramType.MINOR;
  if (normalized.includes("certificate")) return ProgramType.CERTIFICATE;
  return ProgramType.MAJOR;
}

function pickProgramTitle(html: string, payload: BerkeleyProgramPayload) {
  const headings = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((match) => normalizeText(match[1]))
    .filter(Boolean);
  const contentHeading = headings.find((heading) => heading !== "UC Berkeley");
  if (contentHeading) return contentHeading;

  const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1];
  if (ogTitle) return normalizeText(ogTitle.replace(/\|\s*UC Berkeley Catalog/i, ""));

  return payload.name ?? payload.code ?? "Berkeley Program";
}

function extractNuxtWindow(html: string): BerkeleyNuxtWindow {
  const match = html.match(/<script>window\.__NUXT__=[\s\S]*?<\/script>/);
  if (!match) {
    throw new Error("Unable to locate Berkeley page state payload");
  }

  const script = match[0].replace(/^<script>/, "").replace(/<\/script>$/, "");
  const reader = new Function("window", `${script}; return window.__NUXT__;`);
  return reader({}) as BerkeleyNuxtWindow;
}

function collectCourseGroupIds(node?: BerkeleyProgramRuleNode["value"]) {
  if (!node?.values) return [];

  return [
    ...new Set(
      node.values
        .flatMap((entry) => entry.value ?? [])
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value && /^[a-zA-Z0-9]{6,}$/.test(value)))
    )
  ];
}

function buildProgramRequirementDocument(sourceUrl: string, payload: BerkeleyProgramPayload) {
  const categories = (payload.requisites?.requisitesSimple ?? [])
    .filter((requisite) => requisite.showInCatalog !== false)
    .map((requisite, categoryIndex) => {
      const baseDescription = normalizeText(requisite.notes || requisite.description);
      const rules = (requisite.rules ?? [])
        .map((rule, ruleIndex) => {
          const combinedText = [rule.name, rule.description, rule.notes]
            .map((value) => normalizeText(value))
            .filter(Boolean)
            .join(" ");
          const courseCodes = extractCourseCodes(combinedText);
          const courseGroupIds = collectCourseGroupIds(rule.value);
          const minUnits = parseMinUnits(combinedText);
          const minSelect =
            typeof rule.restriction === "number"
              ? rule.restriction
              : inferMinSelectFromText(combinedText, courseCodes.length || courseGroupIds.length);

          let ruleType: RequirementRuleType = RequirementRuleType.EXTERNAL_NOTE;
          if (minUnits) {
            ruleType = RequirementRuleType.MIN_UNITS;
          } else if (courseCodes.length === 1 && (rule.condition === "completedAllOf" || minSelect === 1)) {
            ruleType = RequirementRuleType.REQUIRED_COURSE;
          } else if (courseCodes.length > 0 || courseGroupIds.length > 0) {
            ruleType = RequirementRuleType.CHOOSE_N_COURSES;
          }

          const descriptionParts = [combinedText];
          if (courseGroupIds.length) {
            descriptionParts.push(`Official Berkeley course page ids: ${courseGroupIds.join(", ")}`);
          }

          return {
            title: normalizeText(rule.name) || `Rule ${categoryIndex + 1}.${ruleIndex + 1}`,
            description: descriptionParts.filter(Boolean).join(" "),
            courseCodes,
            minSelect,
            minUnits,
            allowedDepartmentCodes: extractDepartmentCodes(courseCodes),
            allowedTags: inferRequirementTags(combinedText),
            sourceRefText: requisite.name,
            ruleType
          };
        })
        .filter((rule) => rule.description || rule.courseCodes.length > 0);

      const fallbackRules =
        rules.length > 0
          ? rules
          : baseDescription
            ? [
                {
                  title: normalizeText(requisite.name) || `Category ${categoryIndex + 1}`,
                  description: baseDescription,
                  courseCodes: extractCourseCodes(baseDescription),
                  minSelect: inferMinSelectFromText(baseDescription, extractCourseCodes(baseDescription).length),
                  minUnits: parseMinUnits(baseDescription),
                  allowedDepartmentCodes: extractDepartmentCodes(extractCourseCodes(baseDescription)),
                  allowedTags: inferRequirementTags(baseDescription),
                  sourceRefText: requisite.name,
                  ruleType: RequirementRuleType.EXTERNAL_NOTE
                }
              ]
            : [];

      return {
        title: normalizeText(requisite.name) || `Requirement ${categoryIndex + 1}`,
        description: baseDescription || undefined,
        rules: fallbackRules
      };
    })
    .filter((category) => category.rules.length > 0);

  return {
    sourceUrl,
    sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
    parserKey: "berkeley-undergraduate-catalog",
    parserStatus: categories.length ? RequirementSyncStatus.PARSED : RequirementSyncStatus.REVIEW_REQUIRED,
    confidence: categories.length ? ConfidenceLevel.HIGH : ConfidenceLevel.LOW,
    notes: categories.length
      ? "Parsed the current Berkeley undergraduate catalog program page payload into draft requirement categories."
      : "No requirement blocks were found in the Berkeley program payload. Manual review is required.",
    categories
  } satisfies ParsedRequirementDocument;
}

export function parseBerkeleyProgramRequirementDocument(sourceUrl: string, html: string) {
  const nuxt = extractNuxtWindow(html);
  const payload = (nuxt.data?.[0]?.program ?? {}) as BerkeleyProgramPayload;
  return buildProgramRequirementDocument(sourceUrl, payload);
}

export async function fetchOfficialHtml(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    headers: {
      "User-Agent": "CourseMap-Berkeley-Official-Sync/0.2"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch official Berkeley source: ${response.status}`);
  }

  return response.text();
}

export async function getBerkeleyOfficialDepartments(input?: { html?: string }) {
  const html = input?.html ?? (await fetchOfficialHtml(berkeleyOfficialSources.catalogIndex));
  const nuxt = extractNuxtWindow(html);
  const departments = (nuxt.state?.departments?.all ?? [])
    .filter((department): department is BerkeleyDepartmentStateRecord => Boolean(department?.id))
    .filter((department) => department.status !== "Inactive")
    .map((department) => ({
      code: department.id,
      name: department.displayName || department.name || department.id,
      slug: slugify(department.id)
    }));

  return [...new Map(departments.map((department) => [department.code, department])).values()].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export async function importBerkeleyOfficialDepartments(input?: {
  html?: string;
  schoolSlug?: string;
}): Promise<BerkeleyOfficialDepartmentImportResult> {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const departments = await getBerkeleyOfficialDepartments({ html: input?.html });
  const createdDepartments: string[] = [];
  const updatedDepartments: string[] = [];

  for (const department of departments) {
    const existing = await prisma.department.findUnique({
      where: {
        schoolId_code: {
          schoolId: school.id,
          code: department.code
        }
      },
      select: { id: true, name: true }
    });

    await prisma.department.upsert({
      where: {
        schoolId_code: {
          schoolId: school.id,
          code: department.code
        }
      },
      update: {
        name: department.name,
        slug: department.slug
      },
      create: {
        schoolId: school.id,
        code: department.code,
        name: department.name,
        slug: department.slug
      }
    });

    if (existing) {
      updatedDepartments.push(department.code);
    } else {
      createdDepartments.push(department.code);
    }
  }

  return {
    sourceUrl: berkeleyOfficialSources.catalogIndex,
    schoolSlug,
    officialDepartmentCount: departments.length,
    createdDepartments,
    updatedDepartments
  };
}

async function parseBerkeleyCoursePage(input: { sourceUrl: string; html?: string }): Promise<BerkeleyParsedCoursePage> {
  const html = input.html ?? (await fetchOfficialHtml(input.sourceUrl));
  const nuxt = extractNuxtWindow(html);
  const course = (nuxt.data?.[0]?.course ?? {}) as BerkeleyCoursePayload;

  const subjectCode = course.subjectCode ?? course.departments?.[0]?.id ?? "UNKNOWN";
  const courseNumber = course.courseNumber ?? course.code?.replace(subjectCode, "") ?? "";
  const courseCode = formatCourseCode(subjectCode, courseNumber, course.code);
  const title = normalizeText(course.longName) || normalizeText(course.name) || courseCode;
  const description = normalizeText(course.description);
  const departmentCode = course.departments?.[0]?.id ?? subjectCode;
  const departmentName = course.departments?.[0]?.displayName ?? course.departments?.[0]?.name ?? departmentCode;
  const credits = course.credits?.creditHours;
  const fallbackCredits = course.credits?.numberOfCredits;
  const unitsMin = credits?.min ?? fallbackCredits ?? 0;
  const unitsMax = credits?.max ?? fallbackCredits ?? unitsMin;

  return {
    sourceUrl: input.sourceUrl,
    subjectCode,
    courseNumber,
    courseCode,
    slug: `ucb-${slugify(courseCode)}`,
    title,
    description,
    departmentCode,
    departmentName,
    breadthTags: course.approvedBreadthAreas ?? [],
    requirementTags: inferRequirementTags(`${courseCode} ${title} ${description}`),
    prerequisitesText: normalizeText(course.prerequisiteTextForCms) || undefined,
    unitsMin,
    unitsMax,
    level: inferCourseLevel(course)
  };
}

async function importCoursePages(input: {
  schoolId: string;
  coursePageUrls: string[];
  maxCoursePages?: number;
  onProgress?: (message: string) => void;
}) {
  const uniqueUrls = [...new Set(input.coursePageUrls)].slice(0, input.maxCoursePages);
  const createdCourses: string[] = [];
  const updatedCourses: string[] = [];
  const skippedCourseUrls: string[] = [];

  for (const [index, sourceUrl] of uniqueUrls.entries()) {
    try {
      if (index > 0) {
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      input.onProgress?.(`Importing course page ${index + 1}/${uniqueUrls.length}: ${sourceUrl}`);
      const parsed = await parseBerkeleyCoursePage({ sourceUrl });
      if (!parsed.title || !parsed.description || !parsed.unitsMin || !parsed.unitsMax) {
        skippedCourseUrls.push(sourceUrl);
        continue;
      }

      const department = await prisma.department.upsert({
        where: {
          schoolId_code: {
            schoolId: input.schoolId,
            code: parsed.departmentCode
          }
        },
        update: {
          name: parsed.departmentName,
          slug: slugify(parsed.departmentCode)
        },
        create: {
          schoolId: input.schoolId,
          code: parsed.departmentCode,
          name: parsed.departmentName,
          slug: slugify(parsed.departmentCode)
        }
      });

      const existingCourse = await prisma.course.findUnique({
        where: { slug: parsed.slug },
        select: { id: true }
      });

      await prisma.course.upsert({
        where: { slug: parsed.slug },
        update: {
          schoolId: input.schoolId,
          departmentId: department.id,
          code: parsed.courseCode,
          title: parsed.title,
          description: parsed.description,
          unitsMin: parsed.unitsMin,
          unitsMax: parsed.unitsMax,
          level: parsed.level,
          breadthTags: parsed.breadthTags,
          requirementTags: parsed.requirementTags,
          prerequisitesText: parsed.prerequisitesText,
          dataStatus: DataStatus.OFFICIAL
        },
        create: {
          schoolId: input.schoolId,
          departmentId: department.id,
          code: parsed.courseCode,
          slug: parsed.slug,
          title: parsed.title,
          description: parsed.description,
          unitsMin: parsed.unitsMin,
          unitsMax: parsed.unitsMax,
          level: parsed.level,
          breadthTags: parsed.breadthTags,
          requirementTags: parsed.requirementTags,
          prerequisitesText: parsed.prerequisitesText,
          dataStatus: DataStatus.OFFICIAL
        }
      });

      if (existingCourse) {
        updatedCourses.push(parsed.courseCode);
      } else {
        createdCourses.push(parsed.courseCode);
      }
    } catch {
      skippedCourseUrls.push(sourceUrl);
    }
  }

  return {
    createdCourses,
    updatedCourses,
    skippedCourseUrls,
    importedCoursePageCount: uniqueUrls.length
  };
}

async function parseBerkeleyProgramPage(input: {
  sourceUrl: string;
  html?: string;
}): Promise<BerkeleyParsedProgramPage> {
  const html = input.html ?? (await fetchOfficialHtml(input.sourceUrl));
  const nuxt = extractNuxtWindow(html);
  const payload = (nuxt.data?.[0]?.program ?? {}) as BerkeleyProgramPayload;
  const rootRevision = (nuxt.data?.[0]?.rootRevision ?? {}) as BerkeleyProgramRootRevision;
  const pageTitle = pickProgramTitle(html, payload);
  const programCode = payload.code ?? input.sourceUrl.split("/").filter(Boolean).at(-1) ?? "unknown-program";
  const programType = parseProgramType(payload.ssPfM?.[0] ?? payload.type);
  const departmentCode = rootRevision.departmentOwnership?.[0]?.deptId;
  const overview = normalizeText(payload.catalogFullDescription) || normalizeText(payload.catalogDescription) || pageTitle;
  const parsedRequirements = buildProgramRequirementDocument(input.sourceUrl, payload);
  const referencedCoursePageUrls = [
    ...new Set([
      ...(payload.requisites?.requisitesSimple ?? []).flatMap((requisite) =>
        (requisite.rules ?? [])
          .flatMap((rule) => collectCourseGroupIds(rule.value))
          .map((courseGroupId) => berkeleyCatalogCoursePageUrl(courseGroupId))
      ),
      ...extractBerkeleyCatalogCoursePageIds(html).map((courseGroupId) => berkeleyCatalogCoursePageUrl(courseGroupId))
    ])
  ];

  return {
    sourceUrl: input.sourceUrl,
    pageTitle,
    programCode,
    programType,
    degreeLabel: payload.degreeDesignation ?? undefined,
    departmentCode,
    overview,
    rawPayload: payload,
    parsedRequirements,
    referencedCoursePageUrls
  };
}

async function syncProgramRequirements(input: {
  schoolId: string;
  programId: string;
  sourceUrl: string;
  parsed: ParsedRequirementDocument;
  rawSnapshotJson: unknown;
}) {
  const snapshotJson = JSON.parse(JSON.stringify(input.rawSnapshotJson ?? null)) as Prisma.InputJsonValue;
  const sourceByUrl = await prisma.requirementSource.findFirst({
    where: {
      schoolId: input.schoolId,
      sourceUrl: input.sourceUrl
    },
    select: { id: true, programId: true }
  });
  const existingSource = sourceByUrl?.programId === input.programId ? sourceByUrl : null;

  if (sourceByUrl && sourceByUrl.programId !== input.programId) {
    await prisma.programRequirementSet.deleteMany({
      where: {
        sourceId: sourceByUrl.id
      }
    });
  }

  const source = existingSource
    ? await prisma.requirementSource.update({
        where: { id: existingSource.id },
        data: {
          schoolId: input.schoolId,
          sourceType: input.parsed.sourceType,
          parserKey: input.parsed.parserKey,
          parserStatus: input.parsed.parserStatus,
          lastSyncedAt: new Date(),
          notes: input.parsed.notes,
          confidence: input.parsed.confidence,
          rawSnapshotJson: snapshotJson
        }
      })
    : sourceByUrl
      ? await prisma.requirementSource.update({
          where: { id: sourceByUrl.id },
          data: {
            programId: input.programId,
            schoolId: input.schoolId,
            sourceType: input.parsed.sourceType,
            parserKey: input.parsed.parserKey,
            parserStatus: input.parsed.parserStatus,
            lastSyncedAt: new Date(),
            notes: input.parsed.notes,
            confidence: input.parsed.confidence,
            rawSnapshotJson: snapshotJson
          }
        })
      : await prisma.requirementSource.create({
          data: {
            schoolId: input.schoolId,
            programId: input.programId,
            sourceUrl: input.sourceUrl,
            sourceType: input.parsed.sourceType,
            parserKey: input.parsed.parserKey,
            parserStatus: input.parsed.parserStatus,
            lastSyncedAt: new Date(),
            notes: input.parsed.notes,
            confidence: input.parsed.confidence,
            rawSnapshotJson: snapshotJson
          }
        });

  await prisma.programRequirementSet.updateMany({
    where: {
      programId: input.programId,
      isActive: true
    },
    data: { isActive: false }
  });

  const existingSet = await prisma.programRequirementSet.findFirst({
    where: {
      programId: input.programId,
      sourceId: source.id
    },
    select: { id: true }
  });

  const requirementSet = existingSet
    ? await prisma.programRequirementSet.update({
        where: { id: existingSet.id },
        data: {
          versionLabel: `Berkeley Catalog Sync ${new Date().toISOString().slice(0, 10)}`,
          effectiveFrom: new Date(),
          isActive: true,
          notes: input.parsed.notes
        }
      })
    : await prisma.programRequirementSet.create({
        data: {
          programId: input.programId,
          sourceId: source.id,
          versionLabel: `Berkeley Catalog Sync ${new Date().toISOString().slice(0, 10)}`,
          effectiveFrom: new Date(),
          isActive: true,
          notes: input.parsed.notes
        }
      });

  await prisma.requirementCategory.deleteMany({
    where: { requirementSetId: requirementSet.id }
  });

  for (const [categoryIndex, category] of input.parsed.categories.entries()) {
    const createdCategory = await prisma.requirementCategory.create({
      data: {
        requirementSetId: requirementSet.id,
        title: category.title,
        slug: slugify(category.title || `category-${categoryIndex + 1}`),
        description: category.description,
        displayOrder: categoryIndex
      }
    });

    for (const [ruleIndex, rule] of category.rules.entries()) {
      const minUnits = parseMinUnits(rule.description ?? "");
      await prisma.requirementRule.create({
        data: {
          categoryId: createdCategory.id,
          ruleType: (rule as { ruleType?: RequirementRuleType }).ruleType ?? RequirementRuleType.EXTERNAL_NOTE,
          title: rule.title,
          description: rule.description,
          minSelect: rule.minSelect,
          minUnits,
          courseCodes: rule.courseCodes,
          allowedDepartmentCodes: rule.allowedDepartmentCodes ?? [],
          allowedTags: rule.allowedTags ?? [],
          sourceRefText: rule.sourceRefText,
          inferred: true,
          displayOrder: ruleIndex
        }
      });
    }
  }
}

export async function syncBerkeleyOfficialPrograms(input?: {
  programUrls?: string[];
  schoolSlug?: string;
  maxCoursePages?: number;
  onProgress?: (message: string) => void;
}): Promise<BerkeleyOfficialProgramImportResult> {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const sourceUrls = input?.programUrls?.length
    ? input.programUrls
    : berkeleyOfficialSources.defaultProgramUrls;

  const createdPrograms: string[] = [];
  const updatedPrograms: string[] = [];
  const skippedProgramUrls: string[] = [];
  const referencedCourseUrls = new Set<string>();

  for (const [index, sourceUrl] of sourceUrls.entries()) {
    try {
      input?.onProgress?.(`Syncing program page ${index + 1}/${sourceUrls.length}: ${sourceUrl}`);
      const parsed = await parseBerkeleyProgramPage({ sourceUrl });
      const candidateSlug = `ucb-${slugify(parsed.pageTitle)}`;

      let departmentId: string | undefined;
      if (parsed.departmentCode) {
        const department = await prisma.department.upsert({
          where: {
            schoolId_code: {
              schoolId: school.id,
              code: parsed.departmentCode
            }
          },
          update: {
            slug: slugify(parsed.departmentCode)
          },
          create: {
            schoolId: school.id,
            code: parsed.departmentCode,
            name: parsed.departmentCode,
            slug: slugify(parsed.departmentCode)
          }
        });
        departmentId = department.id;
      }

      const existingProgramByCode = await prisma.program.findFirst({
        where: {
          schoolId: school.id,
          code: parsed.programCode
        },
        select: { id: true }
      });
      const existingProgramByNameAndType = existingProgramByCode
        ? null
        : await prisma.program.findFirst({
            where: {
              schoolId: school.id,
              name: parsed.pageTitle,
              type: parsed.programType
            },
            select: { id: true }
          });
      const existingProgramBySlug =
        existingProgramByCode || existingProgramByNameAndType
          ? null
          : await prisma.program.findFirst({
              where: {
                schoolId: school.id,
                slug: candidateSlug,
                type: parsed.programType
              },
              select: { id: true }
            });
      const existingProgram = existingProgramByCode ?? existingProgramByNameAndType ?? existingProgramBySlug;

      const program = existingProgram
        ? await prisma.program.update({
            where: { id: existingProgram.id },
            data: {
              departmentId,
              code: parsed.programCode,
              name: parsed.pageTitle,
              type: parsed.programType,
              degreeLabel: parsed.degreeLabel,
              overview: parsed.overview,
              isActive: true
            }
          })
        : await prisma.program.create({
            data: {
              schoolId: school.id,
              departmentId,
              code: parsed.programCode,
              name: parsed.pageTitle,
              slug: candidateSlug,
              type: parsed.programType,
              degreeLabel: parsed.degreeLabel,
              overview: parsed.overview,
              isActive: true
            }
          });

      if (existingProgram) {
        updatedPrograms.push(parsed.pageTitle);
      } else {
        createdPrograms.push(parsed.pageTitle);
      }

      await syncProgramRequirements({
        schoolId: school.id,
        programId: program.id,
        sourceUrl,
        parsed: parsed.parsedRequirements,
        rawSnapshotJson: parsed.rawPayload
      });

      for (const courseUrl of parsed.referencedCoursePageUrls) {
        referencedCourseUrls.add(courseUrl);
      }
    } catch {
      skippedProgramUrls.push(sourceUrl);
    }
  }

  const { createdCourses, updatedCourses, skippedCourseUrls, importedCoursePageCount } = await importCoursePages({
    schoolId: school.id,
    coursePageUrls: [...referencedCourseUrls],
    maxCoursePages: input?.maxCoursePages,
    onProgress: input?.onProgress
  });

  return {
    sourceUrls,
    schoolSlug,
    createdPrograms,
    updatedPrograms,
    skippedProgramUrls,
    referencedCoursePageCount: referencedCourseUrls.size,
    importedCoursePageCount,
    createdCourses,
    updatedCourses,
    skippedCourseUrls
  };
}

/** Import official catalog course detail pages (Nuxt payloads) into Course rows. */
export async function importBerkeleyOfficialCatalogCoursePages(input: {
  coursePageUrls: string[];
  schoolSlug?: string;
  maxCoursePages?: number;
  onProgress?: (message: string) => void;
}): Promise<{
  schoolSlug: string;
  createdCourses: string[];
  updatedCourses: string[];
  skippedCourseUrls: string[];
  importedCoursePageCount: number;
}> {
  const schoolSlug = input.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const { createdCourses, updatedCourses, skippedCourseUrls, importedCoursePageCount } = await importCoursePages({
    schoolId: school.id,
    coursePageUrls: input.coursePageUrls,
    maxCoursePages: input.maxCoursePages,
    onProgress: input.onProgress
  });

  return {
    schoolSlug,
    createdCourses,
    updatedCourses,
    skippedCourseUrls,
    importedCoursePageCount
  };
}

export async function getBerkeleyOfficialCoverage(input?: {
  schoolSlug?: string;
  refreshOfficialDepartmentCount?: boolean;
}): Promise<BerkeleyOfficialCoverageReport> {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const [localDepartmentCount, localCourseCount, localProgramCount, localMajorCount, localMinorCount, syncedProgramSourceCount, latestSource] =
    await Promise.all([
      prisma.department.count({ where: { schoolId: school.id } }),
      prisma.course.count({ where: { schoolId: school.id } }),
      prisma.program.count({ where: { schoolId: school.id } }),
      prisma.program.count({ where: { schoolId: school.id, type: ProgramType.MAJOR } }),
      prisma.program.count({ where: { schoolId: school.id, type: ProgramType.MINOR } }),
      prisma.requirementSource.count({
        where: {
          schoolId: school.id,
          sourceUrl: {
            contains: "undergraduate.catalog.berkeley.edu/programs/"
          }
        }
      }),
      prisma.requirementSource.findFirst({
        where: { schoolId: school.id },
        orderBy: { lastSyncedAt: "desc" },
        select: { lastSyncedAt: true }
      })
    ]);

  let officialDepartmentCount: number | undefined;
  if (input?.refreshOfficialDepartmentCount) {
    try {
      officialDepartmentCount = (await getBerkeleyOfficialDepartments()).length;
    } catch {
      officialDepartmentCount = undefined;
    }
  }

  return {
    schoolSlug,
    localDepartmentCount,
    localCourseCount,
    localProgramCount,
    localMajorCount,
    localMinorCount,
    officialDepartmentCount,
    syncedProgramSourceCount,
    lastSyncedAt: latestSource?.lastSyncedAt?.toISOString() ?? null,
    officialCatalogEndpointStatus: "search_endpoint_blocked",
    notes: [
      "Live Berkeley program and course detail pages are syncable from their embedded Nuxt payloads.",
      "The Berkeley catalog search/export endpoints still return 302/404 from this environment, so full inventory enumeration is not yet available through the same official host."
    ]
  };
}
