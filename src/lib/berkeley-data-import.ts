import { DataStatus, TermSeason } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RawSnapshotRecord = Record<string, string>;

type SnapshotParseResult = {
  records: RawSnapshotRecord[];
  format: "json" | "delimited";
};

type GradeDistributionImportResult = {
  sourceName: string;
  schoolSlug: string;
  importedCount: number;
  createdInstructors: string[];
  updatedRows: string[];
  skippedRows: string[];
};

type ProfessorRatingsImportResult = {
  sourceName: string;
  schoolSlug: string;
  importedCount: number;
  createdInstructors: string[];
  updatedRatings: string[];
  skippedRows: string[];
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function normalizeValue(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function parseDelimitedRecords(raw: string): RawSnapshotRecord[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseSnapshot(raw: string): SnapshotParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { records: [], format: "delimited" };
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as Record<string, unknown> | Array<Record<string, unknown>>;
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return {
      format: "json",
      records: rows.map((row) =>
        Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), normalizeValue(value)]))
      )
    };
  }

  return {
    format: "delimited",
    records: parseDelimitedRecords(trimmed)
  };
}

function parseFloatField(value?: string) {
  if (!value) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseIntField(value?: string) {
  if (!value) return undefined;
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function inferSeason(termCode?: string): TermSeason {
  const normalized = termCode?.toUpperCase() ?? "";
  if (normalized.includes("SPRING")) return TermSeason.SPRING;
  if (normalized.includes("SUMMER")) return TermSeason.SUMMER;
  if (normalized.includes("WINTER")) return TermSeason.WINTER;
  return TermSeason.FALL;
}

function inferYear(termCode?: string) {
  const yearMatch = termCode?.match(/(20\d{2})/);
  return yearMatch ? Number(yearMatch[1]) : new Date().getUTCFullYear();
}

async function findOrCreateInstructor(input: {
  schoolId: string;
  name: string;
  departmentId?: string;
  departmentCode?: string;
}) {
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const existing = await prisma.instructor.findFirst({
    where: {
      schoolId: input.schoolId,
      OR: [{ slug }, { name: input.name }]
    }
  });

  if (existing) {
    return { instructor: existing, created: false };
  }

  const created = await prisma.instructor.create({
    data: {
      schoolId: input.schoolId,
      departmentId: input.departmentId,
      name: input.name,
      slug
    }
  });

  return { instructor: created, created: true };
}

export async function findOrCreateTerm(input: { schoolId: string; termCode?: string }) {
  if (!input.termCode) return null;

  const existing = await prisma.term.findFirst({
    where: {
      schoolId: input.schoolId,
      OR: [{ code: input.termCode }, { slug: input.termCode.toLowerCase().replace(/[^a-z0-9]+/g, "-") }]
    }
  });

  if (existing) return existing;

  return prisma.term.create({
    data: {
      schoolId: input.schoolId,
      code: input.termCode,
      slug: input.termCode.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: input.termCode.replace(/-/g, " "),
      season: inferSeason(input.termCode),
      year: inferYear(input.termCode),
      isFuture: true,
      isProjected: true,
      dataStatus: DataStatus.PROJECTED
    }
  });
}

export async function importBerkeleyGradeDistributionSnapshot(input: {
  raw: string;
  sourceName?: string;
  schoolSlug?: string;
}): Promise<GradeDistributionImportResult> {
  const schoolSlug = input.schoolSlug ?? "uc-berkeley";
  const sourceName = input.sourceName?.trim() || "Manual grade distribution snapshot";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const parsed = parseSnapshot(input.raw);
  const createdInstructors = new Set<string>();
  const updatedRows: string[] = [];
  const skippedRows: string[] = [];

  for (const row of parsed.records) {
    const courseCode = row.course_code || row.code;
    if (!courseCode) {
      skippedRows.push("missing-course-code");
      continue;
    }

    const course = await prisma.course.findFirst({
      where: { schoolId: school.id, code: courseCode },
      include: { department: true }
    });

    if (!course) {
      skippedRows.push(courseCode);
      continue;
    }

    const instructorName = row.instructor_name || row.professor || row.instructor;
    const instructorResult = instructorName
      ? await findOrCreateInstructor({
          schoolId: school.id,
          name: instructorName,
          departmentId: course.departmentId,
          departmentCode: course.department.code
        })
      : null;

    if (instructorResult?.created) {
      createdInstructors.add(instructorName!);
    }

    const term = await findOrCreateTerm({ schoolId: school.id, termCode: row.term_code || row.term });
    const averageGpa = parseFloatField(row.average_gpa || row.avg_gpa);
    const totalStudents = parseIntField(row.total_students || row.students || row.enrollment);
    const distribution = {
      A: parseFloatField(row.a),
      B: parseFloatField(row.b),
      C: parseFloatField(row.c),
      D: parseFloatField(row.d),
      F: parseFloatField(row.f),
      P: parseFloatField(row.p),
      NP: parseFloatField(row.np)
    };

    await prisma.gradeDistribution.create({
      data: {
        courseId: course.id,
        instructorId: instructorResult?.instructor.id,
        termId: term?.id,
        averageGpa,
        totalStudents,
        distribution,
        dataStatus: DataStatus.HISTORICAL
      }
    });

    updatedRows.push(courseCode);
  }

  return {
    sourceName,
    schoolSlug,
    importedCount: updatedRows.length,
    createdInstructors: [...createdInstructors].sort(),
    updatedRows,
    skippedRows
  };
}

export async function importProfessorRatingsSnapshot(input: {
  raw: string;
  sourceName?: string;
  schoolSlug?: string;
}): Promise<ProfessorRatingsImportResult> {
  const schoolSlug = input.schoolSlug ?? "uc-berkeley";
  const sourceName = input.sourceName?.trim() || "Manual professor ratings snapshot";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const parsed = parseSnapshot(input.raw);
  const createdInstructors = new Set<string>();
  const updatedRatings: string[] = [];
  const skippedRows: string[] = [];

  for (const row of parsed.records) {
    const instructorName = row.instructor_name || row.professor || row.name;
    if (!instructorName) {
      skippedRows.push("missing-instructor-name");
      continue;
    }

    const departmentCode = row.department_code || row.department;
    const department = departmentCode
      ? await prisma.department.findFirst({
          where: { schoolId: school.id, code: departmentCode }
        })
      : null;

    const instructorResult = await findOrCreateInstructor({
      schoolId: school.id,
      name: instructorName,
      departmentId: department?.id
    });

    if (instructorResult.created) {
      createdInstructors.add(instructorName);
    }

    await prisma.professorRating.create({
      data: {
        instructorId: instructorResult.instructor.id,
        sourceName,
        sourceUrl: row.source_url || row.url,
        rating: parseFloatField(row.rating || row.overall_rating),
        averageDifficulty: parseFloatField(row.average_difficulty || row.difficulty),
        reviewCount: parseIntField(row.review_count || row.reviews),
        sentimentSummary: row.sentiment_summary || row.summary || row.notes,
        dataStatus: DataStatus.HISTORICAL
      }
    });

    updatedRatings.push(instructorName);
  }

  return {
    sourceName,
    schoolSlug,
    importedCount: updatedRatings.length,
    createdInstructors: [...createdInstructors].sort(),
    updatedRatings,
    skippedRows
  };
}
