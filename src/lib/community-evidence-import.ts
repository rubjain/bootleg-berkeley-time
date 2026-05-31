import { CourseFeedbackTag, ReviewReasonTag } from "@prisma/client";
import { getDemoUserEmail } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { sanitizeCommunityText } from "@/lib/content-moderation";

type RawRecord = Record<string, string>;

type CommunityEvidenceImportResult = {
  sourceName: string;
  schoolSlug: string;
  importedReviews: string[];
  importedPosts: string[];
  skippedRows: string[];
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseRecords(raw: string): RawRecord[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as Record<string, unknown> | Array<Record<string, unknown>>;
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), typeof value === "string" ? value.trim() : String(value ?? "")]))
    );
  }

  const lines = trimmed
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

function parseIntField(value?: string, fallback = 0) {
  const numeric = Number.parseInt(value ?? "", 10);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseFloatField(value?: string) {
  const numeric = Number(value ?? "");
  return Number.isFinite(numeric) ? numeric : undefined;
}

function mapReasonTag(value?: string) {
  const normalized = value?.trim().toUpperCase().replace(/[^A-Z]+/g, "_");
  if (!normalized) return undefined;
  return Object.values(ReviewReasonTag).includes(normalized as ReviewReasonTag) ? (normalized as ReviewReasonTag) : undefined;
}

function mapTags(value?: string) {
  const tags = (value ?? "")
    .split(/[|,]/)
    .map((tag) => tag.trim().toUpperCase().replace(/[^A-Z]+/g, "_"))
    .filter(Boolean);

  return tags.filter((tag): tag is CourseFeedbackTag => Object.values(CourseFeedbackTag).includes(tag as CourseFeedbackTag));
}

export async function importCommunityEvidenceSnapshot(input: {
  raw: string;
  sourceName?: string;
  schoolSlug?: string;
}): Promise<CommunityEvidenceImportResult> {
  const schoolSlug = input.schoolSlug ?? "uc-berkeley";
  const sourceName = input.sourceName?.trim() || "Reviewed community evidence snapshot";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });

  if (!school) {
    throw new Error(`School not found for slug "${schoolSlug}"`);
  }

  const systemUser = await prisma.user.findUnique({
    where: { email: await getDemoUserEmail() }
  });

  if (!systemUser) {
    throw new Error("Demo user not found for community evidence imports");
  }

  const rows = parseRecords(input.raw);
  const importedReviews: string[] = [];
  const importedPosts: string[] = [];
  const skippedRows: string[] = [];

  for (const row of rows) {
    const courseCode = row.course_code || row.code;
    if (!courseCode) {
      skippedRows.push("missing-course-code");
      continue;
    }

    const course = await prisma.course.findFirst({
      where: { schoolId: school.id, code: courseCode }
    });

    if (!course) {
      skippedRows.push(courseCode);
      continue;
    }

    const body = sanitizeCommunityText(row.body || row.summary || row.commentary || "");
    const title = sanitizeCommunityText(row.title || row.headline || `${sourceName} note`);
    const professorName = sanitizeCommunityText(row.professor_name || row.instructor_name || "");
    const sourceUrl = row.source_url?.trim();
    const sourceLabel = row.source_kind?.trim() || row.source_label?.trim() || "Community source";
    const decoratedBody = [body, sourceUrl ? `Source: ${sourceLabel} - ${sourceUrl}` : `Source: ${sourceLabel}`]
      .filter(Boolean)
      .join("\n\n");

    const hasRatings =
      Boolean(row.difficulty_rating || row.workload_rating || row.usefulness_rating || row.recommendation_rating);

    if (hasRatings) {
      await prisma.courseReview.create({
        data: {
          courseId: course.id,
          userId: systemUser.id,
          title: professorName ? `${title} (${professorName})` : title,
          body: decoratedBody,
          pseudonym: sourceLabel,
          difficultyRating: parseIntField(row.difficulty_rating, 3),
          workloadRating: parseIntField(row.workload_rating, 3),
          usefulnessRating: parseIntField(row.usefulness_rating, 4),
          recommendationRating: parseIntField(row.recommendation_rating, 4),
          averageWeeklyHours: parseFloatField(row.average_weekly_hours),
          lecturesUseful: row.lectures_useful ? row.lectures_useful.toLowerCase() === "true" : undefined,
          attendanceImportant: row.attendance_important ? row.attendance_important.toLowerCase() === "true" : undefined,
          hardestPart: sanitizeCommunityText(row.hardest_part || ""),
          advice: sanitizeCommunityText(row.advice || ""),
          reasonTag: mapReasonTag(row.reason_tag),
          tags: mapTags(row.tags)
        }
      });

      importedReviews.push(courseCode);
      continue;
    }

    await prisma.courseDiscussionPost.create({
      data: {
        courseId: course.id,
        userId: systemUser.id,
        title: professorName ? `${title} (${professorName})` : title,
        body: decoratedBody
      }
    });

    importedPosts.push(courseCode);
  }

  return {
    sourceName,
    schoolSlug,
    importedReviews,
    importedPosts,
    skippedRows
  };
}
