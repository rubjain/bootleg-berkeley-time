import { DataStatus, ProgramType, RequirementRuleType, RequirementSyncStatus } from "@prisma/client";
import {
  coursedogCourseCatalogUrl,
  coursedogProgramCatalogUrl,
  fetchAllCoursedogCourses,
  fetchAllCoursedogPrograms,
  type CoursedogCourseRecord,
  type CoursedogProgramRecord
} from "@/lib/berkeley-coursedog-api";
import { syncProgramRequirements } from "@/lib/berkeley-official-sync";
import type { ParsedRequirementDocument } from "@/lib/importers/requirements/types";
import { prisma } from "@/lib/prisma";
import { ConfidenceLevel, RequirementSourceType } from "@prisma/client";

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatCourseCode(course: CoursedogCourseRecord) {
  if (course.subjectCode && course.courseNumber) {
    return `${course.subjectCode} ${course.courseNumber}`.trim();
  }
  if (course.code) {
    const match = course.code.match(/^([A-Z&]+)([A-Z]?\d+[A-Z]?)$/);
    if (match) return `${match[1]} ${match[2]}`;
    return course.code;
  }
  return "UNKNOWN";
}

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function inferLevel(course: CoursedogCourseRecord) {
  const joined = (course.attributes ?? []).join(" ").toLowerCase();
  if (joined.includes("ugud")) return "Upper Division";
  if (joined.includes("ugld")) return "Lower Division";
  const number = Number(course.courseNumber?.match(/\d+/)?.[0] ?? "");
  if (Number.isFinite(number) && number >= 100) return "Upper Division";
  if (Number.isFinite(number) && number > 0) return "Lower Division";
  return "Undergraduate";
}

function extractCourseCodes(text: string) {
  const matches = text.match(/\b[A-Z][A-Z& ]{1,12}\s+[A-Z]?\d+[A-Z]?\b/g) ?? [];
  return [...new Set(matches.map((match) => match.replace(/\s+/g, " ").trim()))];
}

function buildProgramDocumentFromCoursedog(
  sourceUrl: string,
  program: CoursedogProgramRecord
): ParsedRequirementDocument {
  const categories =
    program.requisites?.requisitesSimple
      ?.filter((section) => section.showInCatalog !== false)
      .map((section, index) => ({
        title: section.name ?? `Requirement section ${index + 1}`,
        description: section.type,
        rules: (section.rules ?? []).map((rule, ruleIndex) => {
          const text = [rule.name, rule.description, rule.value].filter(Boolean).join(" ");
          const courseCodes = extractCourseCodes(text);
          return {
            title: rule.name ?? `Rule ${ruleIndex + 1}`,
            description: text,
            courseCodes,
            minSelect: typeof rule.restriction === "number" ? rule.restriction : courseCodes.length || 1,
            sourceRefText: section.name
          };
        })
      }))
      .filter((category) => category.rules.length > 0) ?? [];

  return {
    sourceUrl,
    sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
    parserKey: "berkeley-coursedog-api",
    parserStatus:
      categories.length > 0 ? RequirementSyncStatus.PARSED : RequirementSyncStatus.REVIEW_REQUIRED,
    confidence: categories.length > 0 ? ConfidenceLevel.HIGH : ConfidenceLevel.MEDIUM,
    notes: "Imported from Berkeley Coursedog catalog API.",
    categories
  };
}

function parseProgramType(program: CoursedogProgramRecord): ProgramType {
  const text = `${program.type ?? ""} ${program.catalogDescription ?? ""}`.toLowerCase();
  if (text.includes("minor")) return ProgramType.MINOR;
  if (text.includes("certificate")) return ProgramType.CERTIFICATE;
  return ProgramType.MAJOR;
}

export async function importBerkeleyCoursesFromCoursedog(input?: {
  schoolSlug?: string;
  maxRecords?: number;
  onProgress?: (message: string) => void;
}) {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
  if (!school) throw new Error(`School not found: ${schoolSlug}`);

  const courses = await fetchAllCoursedogCourses({
    maxRecords: input?.maxRecords,
    onProgress: input?.onProgress
  });

  const created: string[] = [];
  const updated: string[] = [];
  const departments = new Set<string>();

  for (const [index, course] of courses.entries()) {
    const departmentCode = course.subjectCode ?? "UNKNOWN";
    departments.add(departmentCode);
    const courseCode = formatCourseCode(course);
    const title = course.longName ?? course.name ?? courseCode;
    const description = stripHtml(course.catalogDescription ?? course.description ?? "");
    const unitsMin = course.credits?.creditHours?.min ?? course.credits?.numberOfCredits ?? 0;
    const unitsMax = course.credits?.creditHours?.max ?? unitsMin;

    const department = await prisma.department.upsert({
      where: { schoolId_code: { schoolId: school.id, code: departmentCode } },
      update: { name: departmentCode, slug: slugify(departmentCode) },
      create: {
        schoolId: school.id,
        code: departmentCode,
        name: departmentCode,
        slug: slugify(departmentCode)
      }
    });

    const slug = `ucb-${slugify(courseCode)}`;
    const existing = await prisma.course.findUnique({ where: { slug } });
    await prisma.course.upsert({
      where: { slug },
      update: {
        title,
        description,
        unitsMin,
        unitsMax,
        level: inferLevel(course),
        breadthTags: course.attributes ?? [],
        prerequisitesText: course.prerequisiteTextForCms ?? undefined,
        dataStatus: DataStatus.OFFICIAL
      },
      create: {
        schoolId: school.id,
        departmentId: department.id,
        code: courseCode,
        slug,
        title,
        description,
        unitsMin,
        unitsMax,
        level: inferLevel(course),
        breadthTags: course.attributes ?? [],
        requirementTags: [],
        prerequisitesText: course.prerequisiteTextForCms ?? undefined,
        dataStatus: DataStatus.OFFICIAL
      }
    });

    if (existing) updated.push(courseCode);
    else created.push(courseCode);

    if (index % 200 === 0) {
      input?.onProgress?.(`Imported ${index + 1}/${courses.length} courses...`);
    }
  }

  return {
    schoolSlug,
    importedCount: courses.length,
    departmentCount: departments.size,
    created,
    updated
  };
}

export async function importBerkeleyProgramsFromCoursedog(input?: {
  schoolSlug?: string;
  onProgress?: (message: string) => void;
}) {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
  if (!school) throw new Error(`School not found: ${schoolSlug}`);

  const programs = await fetchAllCoursedogPrograms({ onProgress: input?.onProgress });
  const created: string[] = [];
  const updated: string[] = [];

  for (const [index, program] of programs.entries()) {
    const sourceUrl = coursedogProgramCatalogUrl(program._id);
    const name = program.catalogDisplayName ?? program.code ?? "Berkeley Program";
    const programType = parseProgramType(program);
    const overview = stripHtml(program.catalogFullDescription ?? program.catalogDescription ?? "");
    const code = program.code ?? program._id;
    const slug = `ucb-coursedog-${program._id.toLowerCase()}`;

    const existing =
      (await prisma.program.findUnique({
        where: { schoolId_code_type: { schoolId: school.id, code, type: programType } }
      })) ??
      (await prisma.program.findUnique({ where: { slug } }));

    const row = existing
      ? await prisma.program.update({
          where: { id: existing.id },
          data: { name, overview, isActive: true }
        })
      : await prisma.program.create({
          data: {
            schoolId: school.id,
            code,
            slug,
            name,
            type: programType,
            overview,
            isActive: true
          }
        });

    if (existing) updated.push(name);
    else created.push(name);

    const parsed = buildProgramDocumentFromCoursedog(sourceUrl, program);
    await syncProgramRequirements({
      schoolId: school.id,
      programId: row.id,
      sourceUrl,
      parsed,
      rawSnapshotJson: program
    });

    if (index % 50 === 0) {
      input?.onProgress?.(`Imported ${index + 1}/${programs.length} programs...`);
    }
  }

  return { schoolSlug, importedCount: programs.length, created, updated };
}

export async function runBerkeleyCoursedogFullImport(input?: {
  schoolSlug?: string;
  onProgress?: (message: string) => void;
}) {
  const courses = await importBerkeleyCoursesFromCoursedog({
    schoolSlug: input?.schoolSlug,
    onProgress: input?.onProgress
  });
  const programs = await importBerkeleyProgramsFromCoursedog({
    schoolSlug: input?.schoolSlug,
    onProgress: input?.onProgress
  });
  return { courses, programs };
}
