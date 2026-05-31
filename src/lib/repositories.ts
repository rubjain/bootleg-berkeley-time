import { DataStatus, ProgramType } from "@prisma/client";
import { getCourseCatalogDetail, truncateDescription } from "@/lib/course-catalog-detail";
import { getOptionalUserEmail } from "@/lib/demo-user";
import { buildInstructorProfiles, summarizeProfessorQuality } from "@/lib/instructor-profiles";
import { mergeCourseDescription } from "@/lib/course-descriptions";
import { enrichInstructorProfiles } from "@/lib/rmp/enrich-instructors";
import { getInstructorRmpProfessorId } from "@/lib/prisma-instructor";
import { prisma } from "@/lib/prisma";
import { allowMockFallback } from "@/lib/mock-fallback";
import { mockCourses, mockPrograms, mockRecommendations, mockSchools, mockTerms } from "@/lib/mock-data";
import { scoreRecommendedCourses } from "@/lib/recommendation";
import {
  CourseComparisonView,
  CourseDetail,
  CoursePickerOption,
  CourseSummary,
  InstructorDetail,
  InstructorSummary,
  RelatedCourseLink,
  ProgramDetail,
  ProgramSummary,
  RecommendationResult,
  SchoolSummary,
  TermDetail,
  TermSummary
} from "@/lib/types";

function mapDataTone(status: DataStatus | "OFFICIAL" | "HISTORICAL" | "PROJECTED" | "MANUAL_PLACEHOLDER") {
  if (status === "OFFICIAL") return "official";
  if (status === "PROJECTED") return "projected";
  if (status === "MANUAL_PLACEHOLDER") return "placeholder";
  return "historical";
}

function isOfficialProgramSource(sourceUrl?: string | null) {
  return Boolean(sourceUrl?.includes("undergraduate.catalog.berkeley.edu/programs/"));
}

async function getLiveRecommendationSignals(candidateCourses: CourseSummary[]) {
  const slugs = candidateCourses.map((course) => course.slug);

  if (slugs.length === 0) {
    return {};
  }

  const liveCourses = await prisma.course.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true }
  });

  if (liveCourses.length === 0) {
    return {};
  }

  const courseIdBySlug = new Map(liveCourses.map((course) => [course.slug, course.id]));
  const courseIds = liveCourses.map((course) => course.id);

  const [reviewStats, discussionStats] = await Promise.all([
    prisma.courseReview.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _avg: {
        recommendationRating: true,
        difficultyRating: true
      },
      _count: {
        _all: true
      }
    }),
    prisma.courseDiscussionPost.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _count: {
        _all: true
      }
    })
  ]);

  const reviewByCourseId = new Map(reviewStats.map((item) => [item.courseId, item]));
  const discussionByCourseId = new Map(discussionStats.map((item) => [item.courseId, item]));

  return Object.fromEntries(
    candidateCourses.map((course) => {
      const courseId = courseIdBySlug.get(course.slug);
      const review = courseId ? reviewByCourseId.get(courseId) : undefined;
      const discussion = courseId ? discussionByCourseId.get(courseId) : undefined;
      const reviewCount = review?._count._all ?? 0;
      const discussionCount = discussion?._count._all ?? 0;

      if (!review && !discussion) {
        return [
          course.slug,
          {
            scoreDelta: 0,
            summary: "No live student signal yet"
          }
        ];
      }

      let scoreDelta = 0;
      if ((review?._avg.recommendationRating ?? 0) >= 4) scoreDelta += 6;
      if ((review?._avg.recommendationRating ?? 0) >= 3.5 && (review?._avg.recommendationRating ?? 0) < 4) scoreDelta += 3;
      if ((review?._avg.difficultyRating ?? 0) <= 3.2 && reviewCount > 0) scoreDelta += 2;
      if ((review?._avg.difficultyRating ?? 0) >= 4.3) scoreDelta -= 2;
      if (discussionCount >= 2) scoreDelta += 1;

      const summaryParts: string[] = [];
      if (reviewCount > 0) {
        summaryParts.push(`${(review?._avg.recommendationRating ?? 0).toFixed(1)}/5 from ${reviewCount} review${reviewCount === 1 ? "" : "s"}`);
      }
      if (discussionCount > 0) {
        summaryParts.push(`${discussionCount} discussion post${discussionCount === 1 ? "" : "s"}`);
      }

      return [
        course.slug,
        {
          scoreDelta,
          summary: summaryParts.join(" and ")
        }
      ];
    })
  );
}

export async function getSchools(): Promise<SchoolSummary[]> {
  try {
    const rows = await prisma.school.findMany({
      select: { id: true, code: true, name: true, shortName: true, slug: true, city: true, state: true, isActive: true },
      orderBy: { shortName: "asc" }
    });

    return rows.map((school) => ({
      ...school,
      city: school.city ?? undefined,
      state: school.state ?? undefined
    }));
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return mockSchools;
  }
}

export type CourseListFilters = {
  q?: string;
  department?: string;
  level?: string;
  tone?: string;
};

export const COURSE_LIST_PAGE_SIZE = 12;

export type CourseListPage = {
  courses: CourseSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const courseListInclude = {
  department: true,
  offerings: {
    include: {
      term: true,
      instructors: {
        include: {
          instructor: {
            include: {
              department: true,
              ratings: { orderBy: { createdAt: "desc" as const }, take: 1 }
            }
          }
        }
      }
    }
  },
  enrollmentHistory: { orderBy: { createdAt: "desc" as const }, take: 1 }
} as const;

type CourseListRow = Awaited<
  ReturnType<typeof prisma.course.findMany<{ include: typeof courseListInclude }>>
>[number];

function mapCourseListRow(item: CourseListRow): CourseSummary {
  const description = mergeCourseDescription(item.code, item.description);
  const instructors = buildInstructorProfiles(
    item.offerings.map((offering) => ({
      term: offering.term,
      instructors: offering.instructors.map((link) => ({
        role: link.role,
        instructor: {
          id: link.instructor.id,
          name: link.instructor.name,
          slug: link.instructor.slug,
          bio: link.instructor.bio,
          rmpProfessorId: getInstructorRmpProfessorId(link.instructor),
          department: link.instructor.department ?? item.department,
          ratings: link.instructor.ratings
        }
      }))
    }))
  );

  const topInstructor = instructors.find((instructor) => instructor.rating);

  return {
    id: item.id,
    code: item.code,
    slug: item.slug,
    title: item.title,
    departmentCode: item.department.code,
    departmentName: item.department.name,
    descriptionPreview: truncateDescription(description),
    units: item.unitsMin === item.unitsMax ? `${item.unitsMin} units` : `${item.unitsMin}-${item.unitsMax} units`,
    level: item.level,
    requirementTags: item.requirementTags,
    breadthTags: item.breadthTags,
    termsOffered: [...new Set(item.offerings.map((offering) => offering.term.name))],
    fillRisk: item.enrollmentHistory[0]?.fillRateBucket ?? "Limited historical data",
    dataTone: mapDataTone(item.dataStatus),
    topInstructorName: topInstructor?.name,
    topInstructorSlug: topInstructor?.slug,
    topInstructorRating: topInstructor?.rating?.overall
  };
}

function filterMockCourses(filters?: CourseListFilters) {
  let courses = [...mockCourses];
  if (filters?.q) {
    const query = filters.q.toLowerCase();
    courses = courses.filter(
      (course) =>
        course.code.toLowerCase().includes(query) ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.departmentCode.toLowerCase().includes(query)
    );
  }
  if (filters?.department) {
    courses = courses.filter((course) => course.departmentCode === filters.department);
  }
  if (filters?.level) {
    courses = courses.filter((course) => course.level === filters.level);
  }
  if (filters?.tone) {
    courses = courses.filter((course) => course.dataTone === filters.tone);
  }
  return courses;
}

function mapMockCourseSummary(course: (typeof mockCourses)[number]): CourseSummary {
  return {
    id: course.id,
    code: course.code,
    slug: course.slug,
    title: course.title,
    departmentCode: course.departmentCode,
    departmentName: course.departmentCode,
    descriptionPreview: course.descriptionPreview ?? truncateDescription(course.description),
    units: course.units,
    level: course.level,
    requirementTags: course.requirementTags,
    breadthTags: course.breadthTags,
    termsOffered: course.termsOffered,
    fillRisk: course.fillRisk,
    dataTone: course.dataTone,
    topInstructorName: course.instructors?.[0]?.name ?? course.historicalInstructors[0],
    topInstructorSlug: course.instructors?.[0]?.slug,
    topInstructorRating: course.instructors?.[0]?.rating?.overall
  };
}

export async function getCourseFilterOptions() {
  try {
    const rows = await prisma.course.findMany({
      select: { level: true, department: { select: { code: true } } },
      orderBy: { code: "asc" }
    });
    return {
      departments: [...new Set(rows.map((row) => row.department.code))].sort(),
      levels: [...new Set(rows.map((row) => row.level))].sort()
    };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const departments = [...new Set(mockCourses.map((course) => course.departmentCode))].sort();
    const levels = [...new Set(mockCourses.map((course) => course.level))].sort();
    return { departments, levels };
  }
}

function buildCourseWhere(filters?: CourseListFilters) {
  const clauses: Record<string, unknown>[] = [];

  if (filters?.q) {
    const query = filters.q;
    clauses.push({
      OR: [
        { code: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { department: { code: { contains: query, mode: "insensitive" } } },
        { department: { name: { contains: query, mode: "insensitive" } } },
        { requirementTags: { has: query.toLowerCase() } }
      ]
    });
  }

  if (filters?.department) {
    clauses.push({ department: { code: filters.department } });
  }

  if (filters?.level) {
    clauses.push({ level: filters.level });
  }

  if (filters?.tone === "official") {
    clauses.push({ dataStatus: "OFFICIAL" });
  } else if (filters?.tone === "projected") {
    clauses.push({ dataStatus: "PROJECTED" });
  } else if (filters?.tone === "historical") {
    clauses.push({ dataStatus: "HISTORICAL" });
  }

  if (clauses.length === 0) return undefined;
  return { AND: clauses };
}

export async function getCourses(filters?: CourseListFilters): Promise<CourseSummary[]> {
  const page = await getCoursesPage(filters, 1, Number.MAX_SAFE_INTEGER);
  return page.courses;
}

export async function getCoursesPage(
  filters?: CourseListFilters,
  page = 1,
  pageSize = COURSE_LIST_PAGE_SIZE
): Promise<CourseListPage> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  try {
    const where = buildCourseWhere(filters);
    const [total, rows] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        include: courseListInclude,
        orderBy: { code: "asc" },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize
      })
    ]);

    const totalPages = Math.max(1, Math.ceil(total / safePageSize));

    return {
      courses: rows.map(mapCourseListRow),
      total,
      page: Math.min(safePage, totalPages),
      pageSize: safePageSize,
      totalPages
    };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const filtered = filterMockCourses(filters);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const boundedPage = Math.min(safePage, totalPages);
    const start = (boundedPage - 1) * safePageSize;

    return {
      courses: filtered.slice(start, start + safePageSize).map(mapMockCourseSummary),
      total,
      page: boundedPage,
      pageSize: safePageSize,
      totalPages
    };
  }
}

export async function getCoursePickerOptions(): Promise<CoursePickerOption[]> {
  try {
    const rows = await prisma.course.findMany({
      include: { department: true },
      orderBy: [{ department: { code: "asc" } }, { code: "asc" }]
    });

    return rows.map((course) => ({
      id: course.id,
      slug: course.slug,
      code: course.code,
      title: course.title,
      departmentCode: course.department.code
    }));
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return mockCourses.map((course) => ({
      id: course.id,
      slug: course.slug,
      code: course.code,
      title: course.title,
      departmentCode: course.departmentCode
    }));
  }
}

export async function getCoursesByCodes(courseCodes: string[]): Promise<CoursePickerOption[]> {
  if (courseCodes.length === 0) return [];

  try {
    const rows = await prisma.course.findMany({
      where: { code: { in: courseCodes } },
      include: { department: true },
      orderBy: [{ department: { code: "asc" } }, { code: "asc" }]
    });

    return rows.map((course) => ({
      id: course.id,
      slug: course.slug,
      code: course.code,
      title: course.title,
      departmentCode: course.department.code
    }));
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return mockCourses
      .filter((course) => courseCodes.includes(course.code))
      .map((course) => ({
        id: course.id,
        slug: course.slug,
        code: course.code,
        title: course.title,
        departmentCode: course.departmentCode
      }));
  }
}

export async function getCourseByIdOrSlug(idOrSlug: string): Promise<CourseDetail | null> {
  try {
    const item = await prisma.course.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        department: true,
        relationshipsFrom: { include: { toCourse: true } },
        relationshipsTo: { include: { fromCourse: true } },
        offerings: {
          include: {
            term: true,
            instructors: {
              include: {
                instructor: {
                  include: {
                    department: true,
                    ratings: { orderBy: { createdAt: "desc" } }
                  }
                }
              }
            }
          }
        },
        gradeDistributions: { take: 1, orderBy: { createdAt: "desc" } },
        enrollmentHistory: { take: 6, orderBy: { createdAt: "desc" }, include: { term: true } }
      }
    });

    if (!item) return null;

    const sessionEmail = await getOptionalUserEmail();
    const demoUser = sessionEmail
      ? await prisma.user.findUnique({
          where: { email: sessionEmail },
          include: {
            courseHistory: {
              where: { status: "COMPLETED" },
              include: { course: true }
            }
          }
        })
      : null;
    const completedCodes = new Set(demoUser?.courseHistory.map((history) => history.course.code) ?? []);
    const prerequisiteCodes = item.relationshipsFrom
      .filter((relationship) => relationship.type === "PREREQUISITE")
      .map((relationship) => relationship.toCourse.code);
    const unmetPrerequisiteCodes = prerequisiteCodes.filter((code) => !completedCodes.has(code));
    const completedPrerequisiteCodes = prerequisiteCodes.filter((code) => completedCodes.has(code));

    const matchingPrograms = await prisma.program.findMany({
      where: {
        requirementSets: {
          some: {
            isActive: true,
            categories: {
              some: {
                rules: {
                  some: {
                    OR: [
                      { courseCodes: { has: item.code } },
                      { allowedTags: { hasSome: item.requirementTags } }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      include: {
        requirementSets: {
          where: { isActive: true },
          take: 1,
          include: {
            categories: {
              include: {
                rules: true
              }
            }
          }
        }
      }
    });

    const requirementsSatisfied = matchingPrograms.flatMap((program) =>
      (program.requirementSets[0]?.categories ?? []).flatMap((category) =>
        category.rules
          .filter((rule) => rule.courseCodes.includes(item.code) || rule.allowedTags.some((tag) => item.requirementTags.includes(tag)))
          .map(() => ({
            program: program.name,
            bucket: category.title
          }))
      )
    );

    const relatedCourses = [
      ...item.relationshipsFrom.map((relationship) => relationship.toCourse.code),
      ...item.relationshipsTo.map((relationship) => relationship.fromCourse.code)
    ];
    const relatedCourseLinks = await resolveRelatedCourseLinks([...new Set(relatedCourses)]);

    const description = mergeCourseDescription(item.code, item.description);
    const instructors = await enrichInstructorProfiles(
      buildInstructorProfiles(
        item.offerings.map((offering) => ({
          term: offering.term,
          instructors: offering.instructors.map((link) => ({
            role: link.role,
                instructor: {
                  id: link.instructor.id,
                  name: link.instructor.name,
                  slug: link.instructor.slug,
                  bio: link.instructor.bio,
                  rmpProfessorId: getInstructorRmpProfessorId(link.instructor),
                  department: link.instructor.department ?? item.department,
                  ratings: link.instructor.ratings
                }
          }))
        }))
      )
    );

    const catalogDetail = getCourseCatalogDetail({
      code: item.code,
      title: item.title,
      description,
      level: item.level,
      departmentCode: item.department.code,
      requirementTags: item.requirementTags,
      prerequisitesText: item.prerequisitesText
    });

    const topInstructor = instructors.find((instructor) => instructor.rating);

    return {
      id: item.id,
      code: item.code,
      slug: item.slug,
      title: item.title,
      departmentCode: item.department.code,
      departmentName: item.department.name,
      descriptionPreview: truncateDescription(description),
      units: item.unitsMin === item.unitsMax ? `${item.unitsMin} units` : `${item.unitsMin}-${item.unitsMax} units`,
      level: item.level,
      requirementTags: item.requirementTags,
      breadthTags: item.breadthTags,
      termsOffered: [...new Set(item.offerings.map((offering) => offering.term.name))],
      fillRisk: item.enrollmentHistory[0]?.fillRateBucket ?? "Limited historical data",
      dataTone: mapDataTone(item.dataStatus),
      topInstructorName: topInstructor?.name,
      topInstructorSlug: topInstructor?.slug,
      topInstructorRating: topInstructor?.rating?.overall,
      description,
      catalogDetail,
      prerequisitesText: item.prerequisitesText ?? undefined,
      gradeDistribution: (item.gradeDistributions[0]?.distribution as Record<string, number> | undefined) ?? undefined,
      averageGpa: item.gradeDistributions[0]?.averageGpa ?? undefined,
      historicalInstructors: instructors.map((instructor) => instructor.name),
      instructors,
      professorSummary: summarizeProfessorQuality(instructors),
      futureOfferingNote: item.offerings.some((offering) => offering.isProjected) ? "Some future offerings are projected from historical patterns and are not guaranteed." : undefined,
      bestSemesterNote:
        item.offerings.some((offering) => offering.term.season === "FALL")
          ? "Best in Fall when historical offering coverage is strongest and prerequisite chains line up cleanly."
          : "Best in a historically offered term after prerequisite completion.",
      weeklyScheduleSummary: item.offerings.slice(0, 3).map((offering) => ({
        label: `${offering.component} ${offering.sectionCode}`,
        days: offering.meetingDays ?? undefined,
        time: offering.timeStart && offering.timeEnd ? `${offering.timeStart}-${offering.timeEnd}` : undefined,
        location: offering.location ?? undefined,
        status: offering.status
      })),
      requirementsSatisfied: requirementsSatisfied.length ? requirementsSatisfied : [{ program: "No mapped program yet", bucket: "Requirement mapping pending expansion" }],
      relatedCourses: [...new Set(relatedCourses)],
      relatedCourseLinks,
      enrollmentTrend: item.enrollmentHistory
        .map((record) => ({
          termName: record.term.name,
          enrolled: record.enrolled ?? 0,
          capacity: record.capacity ?? record.enrolled ?? 1,
          fillRateBucket: record.fillRateBucket
        }))
        .reverse(),
      completedPrerequisiteCodes,
      unmetPrerequisiteCodes
    };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const course = mockCourses.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
    if (!course) return null;
    const description = mergeCourseDescription(course.code, course.description);
    const catalogDetail =
      course.catalogDetail ??
      getCourseCatalogDetail({
        code: course.code,
        title: course.title,
        description,
        level: course.level,
        departmentCode: course.departmentCode,
        requirementTags: course.requirementTags,
        prerequisitesText: course.prerequisitesText
      });

    const baseInstructors =
      course.instructors ??
      course.historicalInstructors.map((name, index) => ({
        id: `mock-instructor-${index}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        recentTerms: course.termsOffered,
        rating:
          name === "Jennifer Wang"
            ? {
                overall: 4.5,
                difficulty: 4.2,
                reviewCount: 126,
                summary: "Students praise clarity and strong exam preparation.",
                sourceName: "Rate My Professors (sample)",
                sourceUrl: "https://www.ratemyprofessors.com/"
              }
            : name === "Miguel Alvarez"
              ? {
                  overall: 4.1,
                  difficulty: 3.8,
                  reviewCount: 41,
                  summary: "Project-heavy but highly practical.",
                  sourceName: "Rate My Professors (sample)",
                  sourceUrl: "https://www.ratemyprofessors.com/"
                }
              : name === "Priya Shah"
                ? {
                    overall: 4.0,
                    difficulty: 3.2,
                    reviewCount: 58,
                    summary: "Clear communicator with fair grading on business writing assignments.",
                    sourceName: "Rate My Professors (sample)",
                    sourceUrl: "https://www.ratemyprofessors.com/"
                  }
                : undefined
      }));

    const instructors = await enrichInstructorProfiles(baseInstructors);

    const relatedCourseLinks =
      course.relatedCourseLinks ??
      course.relatedCourses.map((code) => {
        const match = mockCourses.find((item) => item.code === code);
        return match
          ? { code: match.code, slug: match.slug, title: match.title }
          : { code, slug: code.toLowerCase().replace(/\s+/g, "-"), title: code };
      });

    return {
      ...course,
      description,
      catalogDetail,
      instructors,
      departmentName: course.departmentName ?? course.departmentCode,
      descriptionPreview: course.descriptionPreview ?? truncateDescription(description),
      professorSummary: summarizeProfessorQuality(instructors),
      relatedCourseLinks,
      enrollmentTrend: course.enrollmentTrend ?? [],
      completedPrerequisiteCodes: course.completedPrerequisiteCodes ?? [],
      unmetPrerequisiteCodes: course.unmetPrerequisiteCodes ?? course.relatedCourses.slice(0, 1)
    };
  }
}

async function resolveRelatedCourseLinks(codes: string[]): Promise<RelatedCourseLink[]> {
  if (!codes.length) return [];

  try {
    const rows = await prisma.course.findMany({
      where: { code: { in: codes } },
      select: { code: true, slug: true, title: true }
    });
    const byCode = new Map(rows.map((row) => [row.code, row]));
    return codes.map((code) => {
      const match = byCode.get(code);
      return match
        ? { code: match.code, slug: match.slug, title: match.title }
        : { code, slug: code.toLowerCase().replace(/\s+/g, "-"), title: code };
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return codes.map((code) => {
      const match = mockCourses.find((course) => course.code === code);
      return match
        ? { code: match.code, slug: match.slug, title: match.title }
        : { code, slug: code.toLowerCase().replace(/\s+/g, "-"), title: code };
    });
  }
}

export type InstructorListFilters = {
  q?: string;
  department?: string;
};

export async function getInstructors(filters?: InstructorListFilters): Promise<InstructorSummary[]> {
  try {
    const where: Record<string, unknown> = {};
    if (filters?.department) {
      where.department = { code: filters.department };
    }
    if (filters?.q) {
      const query = filters.q;
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query.toLowerCase().replace(/\s+/g, "-"), mode: "insensitive" } },
        { department: { code: { contains: query, mode: "insensitive" } } },
        { department: { name: { contains: query, mode: "insensitive" } } }
      ];
    }

    const rows = await prisma.instructor.findMany({
      where,
      include: {
        department: true,
        ratings: { orderBy: { reviewCount: "desc" }, take: 1 },
        offeringLinks: {
          include: {
            courseOffering: { include: { course: true, term: true } }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    const profiles = rows.map((instructor) => {
      const courseCodes = [
        ...new Set(instructor.offeringLinks.map((link) => link.courseOffering.course.code))
      ];
      const offerings =
        instructor.offeringLinks.length > 0
          ? instructor.offeringLinks.map((link) => ({
              term: link.courseOffering.term,
              instructors: [
                {
                  role: link.role,
                  instructor: {
                    id: instructor.id,
                    name: instructor.name,
                    slug: instructor.slug,
                    bio: instructor.bio,
                    department: instructor.department,
                    ratings: instructor.ratings
                  }
                }
              ]
            }))
          : [
              {
                term: { name: "Catalog" },
                instructors: [
                  {
                    role: "Instructor",
                    instructor: {
                      id: instructor.id,
                      name: instructor.name,
                      slug: instructor.slug,
                      bio: instructor.bio,
                      department: instructor.department,
                      ratings: instructor.ratings
                    }
                  }
                ]
              }
            ];

      return { profile: buildInstructorProfiles(offerings)[0], courseCodes };
    });

    const enriched = await enrichInstructorProfiles(
      profiles.map((entry) => entry.profile).filter((profile): profile is NonNullable<typeof profile> => Boolean(profile))
    );
    const enrichedById = new Map(enriched.map((profile) => [profile.id, profile]));

    const summaries: InstructorSummary[] = [];
    for (const entry of profiles) {
      if (!entry.profile) continue;
      const profile = enrichedById.get(entry.profile.id) ?? entry.profile;
      summaries.push({
        id: profile.id,
        name: profile.name,
        slug: profile.slug,
        departmentCode: profile.departmentCode,
        departmentName: profile.departmentName,
        courseCount: entry.courseCodes.length,
        recentCourseCodes: entry.courseCodes.slice(0, 4),
        rating: profile.rating
      });
    }

    return summaries.sort((left, right) => (right.rating?.overall ?? 0) - (left.rating?.overall ?? 0));
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const mockInstructors: InstructorSummary[] = [
      { id: "inst-1", name: "Jennifer Wang", slug: "jennifer-wang", departmentCode: "COMPSCI", departmentName: "EECS", courseCount: 1, recentCourseCodes: ["COMPSCI 61A"] },
      { id: "inst-2", name: "Miguel Alvarez", slug: "miguel-alvarez", departmentCode: "DATA", departmentName: "Data Science", courseCount: 1, recentCourseCodes: ["DATA C100"] },
      { id: "inst-3", name: "Ava Sullivan", slug: "ava-sullivan", departmentCode: "COMPSCI", departmentName: "EECS", courseCount: 2, recentCourseCodes: ["COMPSCI 162", "COMPSCI 186"] },
      { id: "inst-4", name: "Sara Lopez", slug: "sara-lopez", departmentCode: "STAT", departmentName: "Statistics", courseCount: 1, recentCourseCodes: ["STAT 20"] }
    ];

    let filtered = mockInstructors;
    if (filters?.department) {
      filtered = filtered.filter((instructor) => instructor.departmentCode === filters.department);
    }
    if (filters?.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter(
        (instructor) =>
          instructor.name.toLowerCase().includes(query) ||
          instructor.departmentCode?.toLowerCase().includes(query) ||
          instructor.recentCourseCodes.some((code) => code.toLowerCase().includes(query))
      );
    }

    const profiles = await enrichInstructorProfiles(
      filtered.map((instructor) => ({
        id: instructor.id,
        name: instructor.name,
        slug: instructor.slug,
        departmentCode: instructor.departmentCode,
        departmentName: instructor.departmentName,
        recentTerms: ["Fall 2024"],
        rating: undefined
      }))
    );

    return profiles.map((profile, index) => ({
      ...filtered[index],
      rating: profile.rating
    }));
  }
}

export async function getInstructorFilterOptions() {
  try {
    const rows = await prisma.instructor.findMany({
      select: { department: { select: { code: true } } },
      where: { departmentId: { not: null } }
    });
    return { departments: [...new Set(rows.map((row) => row.department?.code).filter(Boolean))].sort() as string[] };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return { departments: ["COMPSCI", "DATA", "STAT", "UGBA", "MATH", "ECON", "PHYSICS", "COGSCI", "ENGIN", "IB"] };
  }
}

export async function getTerms(): Promise<TermSummary[]> {
  try {
    const rows = await prisma.term.findMany({
      include: { _count: { select: { offerings: true } } },
      orderBy: [{ year: "desc" }, { season: "desc" }]
    });

    return rows.map((term) => ({
      id: term.id,
      slug: term.slug,
      name: term.name,
      season: term.season,
      year: term.year,
      isProjected: term.isProjected,
      offeringCount: term._count.offerings
    }));
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return mockTerms.map((term) => ({
      id: term.id,
      slug: term.slug,
      name: term.name,
      season: term.season,
      year: term.year,
      isProjected: term.isProjected,
      offeringCount: term.offerings.length
    }));
  }
}

export async function getCourseComparison(leftIdOrSlug: string, rightIdOrSlug: string): Promise<CourseComparisonView | null> {
  const [left, right] = await Promise.all([
    getCourseByIdOrSlug(leftIdOrSlug),
    getCourseByIdOrSlug(rightIdOrSlug)
  ]);

  if (!left || !right) return null;

  const workloadSignal =
    left.fillRisk === right.fillRisk
      ? "Both courses have a similar enrollment pressure profile."
      : `${left.code} is ${left.fillRisk.toLowerCase()}, while ${right.code} is ${right.fillRisk.toLowerCase()}.`;

  const gradingSignal =
    left.averageGpa && right.averageGpa
      ? left.averageGpa > right.averageGpa
        ? `${left.code} has the softer recent grade profile in the sample data.`
        : `${right.code} has the softer recent grade profile in the sample data.`
      : "Grade history is incomplete for at least one course.";

  const enrollmentSignal =
    left.futureOfferingNote || right.futureOfferingNote
      ? "At least one of these courses depends partly on projected future availability."
      : "Both comparison entries are grounded in currently available historical data.";

  return {
    left,
    right,
    summary: {
      workloadSignal,
      gradingSignal,
      enrollmentSignal
    }
  };
}

export type ProgramListFilters = {
  q?: string;
  type?: ProgramType;
};

export async function getPrograms(filters?: ProgramListFilters): Promise<ProgramSummary[]> {
  try {
    const where: Record<string, unknown> = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.q) {
      const query = filters.q;
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { overview: { contains: query, mode: "insensitive" } }
      ];
    }

    const rows = await prisma.program.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: { requirementSources: { orderBy: { updatedAt: "desc" }, take: 1 } },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });

    const deduped = [...rows]
      .sort((left, right) => {
        const leftSource = left.requirementSources[0]?.sourceUrl;
        const rightSource = right.requirementSources[0]?.sourceUrl;
        return Number(isOfficialProgramSource(rightSource)) - Number(isOfficialProgramSource(leftSource));
      })
      .filter((item, index, array) => {
        const key = `${item.type}:${item.name.toLowerCase()}`;
        return array.findIndex((candidate) => `${candidate.type}:${candidate.name.toLowerCase()}` === key) === index;
      });

    return deduped.map((item) => ({
      id: item.id,
      slug: item.slug,
      code: item.code,
      name: item.name,
      type: item.type,
      degreeLabel: item.degreeLabel ?? undefined,
      overview: item.overview,
      sourceUrl: item.requirementSources[0]?.sourceUrl,
      sourceConfidence: item.requirementSources[0]?.confidence,
      parserStatus: item.requirementSources[0]?.parserStatus
    }));
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return mockPrograms.map(({ categories: _categories, unitMinimum: _unitMinimum, ...program }) => program);
  }
}

export async function getProgramByIdOrSlug(idOrSlug: string): Promise<ProgramDetail | null> {
  try {
    const item = await prisma.program.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        requirementSources: { orderBy: { updatedAt: "desc" }, take: 1 },
        requirementSets: {
          where: { isActive: true },
          take: 1,
          include: {
            categories: {
              include: { rules: { orderBy: { displayOrder: "asc" } } },
              orderBy: { displayOrder: "asc" }
            }
          }
        }
      }
    });

    if (!item) return null;

    return {
      id: item.id,
      slug: item.slug,
      code: item.code,
      name: item.name,
      type: item.type,
      degreeLabel: item.degreeLabel ?? undefined,
      overview: item.overview,
      sourceUrl: item.requirementSources[0]?.sourceUrl,
      sourceConfidence: item.requirementSources[0]?.confidence,
      parserStatus: item.requirementSources[0]?.parserStatus,
      unitMinimum: item.unitMinimum ?? undefined,
      categories:
        item.requirementSets[0]?.categories.map((category) => ({
          id: category.id,
          title: category.title,
          description: category.description ?? undefined,
          rules: category.rules.map((rule) => ({
            id: rule.id,
            ruleType: rule.ruleType,
            title: rule.title,
            description: rule.description ?? undefined,
            minSelect: rule.minSelect,
            courseCodes: rule.courseCodes,
            allowedDepartmentCodes: rule.allowedDepartmentCodes,
            allowedTags: rule.allowedTags,
            sourceRefText: rule.sourceRefText
          }))
        })) ?? []
    };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return mockPrograms.find((program) => program.id === idOrSlug || program.slug === idOrSlug) ?? null;
  }
}

export async function getTermByIdOrSlug(idOrSlug: string): Promise<TermDetail | null> {
  try {
    const item = await prisma.term.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        offerings: {
          include: { course: { include: { department: true } } },
          orderBy: { course: { code: "asc" } }
        }
      }
    });

    if (!item) return null;

    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      season: item.season,
      year: item.year,
      isProjected: item.isProjected,
      offerings: item.offerings.map((offering) => ({
        id: offering.id,
        courseId: offering.course.id,
        courseSlug: offering.course.slug,
        courseCode: offering.course.code,
        courseTitle: offering.course.title,
        departmentCode: offering.course.department.code,
        sectionCode: offering.sectionCode,
        component: offering.component,
        instructorText: offering.instructorText,
        location: offering.location,
        meetingDays: offering.meetingDays,
        timeStart: offering.timeStart,
        timeEnd: offering.timeEnd,
        capacity: offering.capacity,
        enrolled: offering.enrolled,
        waitlist: offering.waitlist,
        status: offering.status,
        projectedReason: offering.projectedReason
      }))
    };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return mockTerms.find((term) => term.id === idOrSlug || term.slug === idOrSlug) ?? null;
  }
}

export async function getInstructorBySlug(slug: string): Promise<InstructorDetail | null> {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { slug },
      include: {
        department: true,
        ratings: { orderBy: { createdAt: "desc" } },
        offeringLinks: {
          include: {
            courseOffering: {
              include: {
                term: true,
                course: true
              }
            }
          },
        }
      }
    });

    if (!instructor) return null;

    const offerings =
      instructor.offeringLinks.length > 0
        ? instructor.offeringLinks.map((link) => ({
            term: link.courseOffering.term,
            instructors: [
              {
                role: link.role,
                instructor: {
                  id: instructor.id,
                  name: instructor.name,
                  slug: instructor.slug,
                  bio: instructor.bio,
                  rmpProfessorId: getInstructorRmpProfessorId(instructor),
                  department: instructor.department,
                  ratings: instructor.ratings
                }
              }
            ]
          }))
        : [
            {
              term: { name: "Catalog" },
              instructors: [
                {
                  role: "Instructor",
                  instructor: {
                    id: instructor.id,
                    name: instructor.name,
                    slug: instructor.slug,
                    bio: instructor.bio,
                    department: instructor.department,
                    ratings: instructor.ratings
                  }
                }
              ]
            }
          ];

    const [profile] = await enrichInstructorProfiles(buildInstructorProfiles(offerings));
    if (!profile) return null;

    const coursesTaught = instructor.offeringLinks.map((link) => ({
      courseId: link.courseOffering.course.id,
      courseCode: link.courseOffering.course.code,
      courseSlug: link.courseOffering.course.slug,
      courseTitle: link.courseOffering.course.title,
      termName: link.courseOffering.term.name,
      role: link.role ?? undefined
    }));

    return { ...profile, coursesTaught };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const mockCourse = mockCourses.find((course) =>
      (course.instructors ?? []).some((instructor) => instructor.slug === slug)
    );
    const mockInstructor = mockCourse?.instructors?.find((instructor) => instructor.slug === slug);
    if (!mockInstructor) return null;

    const [profile] = await enrichInstructorProfiles([mockInstructor]);
    if (!profile) return null;

    return {
      ...profile,
      coursesTaught: mockCourse
        ? [
            {
              courseId: mockCourse.id,
              courseCode: mockCourse.code,
              courseSlug: mockCourse.slug,
              courseTitle: mockCourse.title,
              termName: mockCourse.termsOffered[0] ?? "Recent term",
              role: "Instructor"
            }
          ]
        : []
    };
  }
}

export async function getRecommendationPreview(): Promise<RecommendationResult[]> {
  try {
    const candidates = await getCourses();
    const sessionEmail = await getOptionalUserEmail();
    const demoUser = sessionEmail
      ? await prisma.user.findUnique({
          where: { email: sessionEmail },
          include: {
            courseHistory: {
              where: { status: "COMPLETED" as any },
              include: { course: true }
            },
            programSelections: {
              include: { program: true }
            }
          }
        })
      : null;

    const completedCourseCodes = demoUser?.courseHistory.map((history) => history.course.code) ?? ["COMPSCI 61A", "DATA C8"];
    const selectedProgramNames = demoUser?.programSelections.map((selection) => selection.program.name) ?? ["Data Science"];
    const socialSignalsBySlug = await getLiveRecommendationSignals(candidates);

    return scoreRecommendedCourses({
      selectedProgramNames,
      completedCourseCodes,
      desiredUnitLoad: 16,
      candidateCourses: candidates.filter((course) => !completedCourseCodes.includes(course.code)),
      socialSignalsBySlug
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return mockRecommendations;
  }
}
