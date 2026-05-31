import { CourseHistoryStatus, PlanCourseStatus, ProgramSelectionType, RelationshipType, RequirementRuleType, TermSeason } from "@prisma/client";
import { getDemoUserEmail } from "@/lib/demo-user";
import { mockCourses, mockPrograms } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { allowMockFallback } from "@/lib/mock-fallback";
import { evaluateRequirementProgress } from "@/lib/progress";
import { DashboardView, PlanDetailView } from "@/lib/types";

function parseUnits(unitsMin: number, unitsMax: number) {
  return unitsMin === unitsMax ? unitsMin : unitsMax;
}

let fallbackPlansState: PlanDetailView[] | null = null;

function getInitialFallbackPlans(): PlanDetailView[] {
  return [
    {
      id: "fallback-plan",
      title: "4-Year Graduation Plan",
      catalogYear: "2025-26",
      notes: "Fallback sample plan loaded because the database is not connected yet.",
      semesters: [
        {
          id: "fallback-sem-1",
          label: "Fall Year 2",
          season: "FALL",
          yearIndex: 2,
          unitsTarget: 15,
          totalUnits: 8,
          courses: [
            {
              id: "planned-61b",
              courseId: "course_61b",
              courseCode: "COMPSCI 61B",
              courseTitle: "Data Structures",
              units: 4,
              status: "PLANNED",
              plannedTermName: "Fall 2025",
              warnings: ["Historically hard to enroll in"]
            },
            {
              id: "planned-54",
              courseId: "course_math54",
              courseCode: "MATH 54",
              courseTitle: "Linear Algebra and Differential Equations",
              units: 4,
              status: "PLANNED",
              plannedTermName: "Fall 2025",
              warnings: []
            }
          ]
        },
        {
          id: "fallback-sem-2",
          label: "Spring Year 2",
          season: "SPRING",
          yearIndex: 2,
          unitsTarget: 16,
          totalUnits: 4,
          courses: [
            {
              id: "planned-c100",
              courseId: mockCourses[1].id,
              courseCode: "DATA C100",
              courseTitle: "Principles and Techniques of Data Science",
              units: 4,
              status: "PLANNED",
              plannedTermName: "Spring 2025",
              warnings: ["Check prerequisite text before enrolling"]
            }
          ]
        }
      ],
      totalPlannedUnits: 12,
      warnings: [
        "COMPSCI 61B: Historically hard to enroll in",
        "DATA C100: Check prerequisite text before enrolling"
      ]
    }
  ];
}

function getFallbackPlansState() {
  if (!fallbackPlansState) {
    fallbackPlansState = getInitialFallbackPlans();
  }

  return fallbackPlansState;
}

function recomputeFallbackPlan(plan: PlanDetailView): PlanDetailView {
  const semesters = plan.semesters.map((semester) => ({
    ...semester,
    totalUnits: semester.courses.reduce((sum, course) => sum + course.units, 0)
  }));
  const warnings = semesters.flatMap((semester) =>
    semester.courses.flatMap((course) => course.warnings.map((warning) => `${course.courseCode}: ${warning}`))
  );

  return {
    ...plan,
    semesters,
    totalPlannedUnits: semesters.reduce((sum, semester) => sum + semester.totalUnits, 0),
    warnings
  };
}

function getPlannedCourseWarnings(input: {
  prerequisitesText?: string | null;
  relationships: string[];
  completedCodes: Set<string>;
  fillRisk?: string | null;
  plannedTermProjected?: boolean;
}) {
  const warnings: string[] = [];

  if (input.relationships.length > 0) {
    const unmet = input.relationships.filter((code) => !input.completedCodes.has(code));
    if (unmet.length > 0) {
      warnings.push(`Missing prerequisite path: ${unmet.join(", ")}`);
    }
  }

  if (input.prerequisitesText && input.prerequisitesText !== "No formal prerequisites." && warnings.length === 0) {
    warnings.push("Check prerequisite text before enrolling");
  }

  if (input.fillRisk?.toLowerCase().includes("quick")) {
    warnings.push("Historically hard to enroll in");
  }

  if (input.plannedTermProjected) {
    warnings.push("Planned term availability is projected, not guaranteed");
  }

  return warnings;
}

export async function getDemoUser() {
  try {
    return await prisma.user.findUnique({
      where: { email: await getDemoUserEmail() }
    });
  } catch {
    return null;
  }
}

export async function getUserPlanDetails(userId: string): Promise<PlanDetailView[]> {
  try {
    const plans = await prisma.userPlan.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      include: {
        semesters: {
          orderBy: { sortOrder: "asc" },
          include: {
            courses: {
              include: {
                plannedTerm: true,
                course: {
                  include: {
                    relationshipsFrom: {
                      where: { type: RelationshipType.PREREQUISITE },
                      include: { toCourse: true }
                    },
                    enrollmentHistory: {
                      orderBy: { createdAt: "desc" },
                      take: 1
                    }
                  }
                }
              },
              orderBy: { createdAt: "asc" }
            }
          }
        },
        user: {
          include: {
            courseHistory: {
              where: { status: CourseHistoryStatus.COMPLETED },
              include: { course: true }
            }
          }
        }
      }
    });

    const completedCodes = new Set(
      plans.flatMap((plan) => plan.user.courseHistory.map((history) => history.course.code))
    );

    return plans.map((plan) => {
      const semesters = plan.semesters.map((semester) => {
        const courses = semester.courses.map((planned) => {
          const units = parseUnits(planned.course.unitsMin, planned.course.unitsMax);
          const warnings = getPlannedCourseWarnings({
            prerequisitesText: planned.course.prerequisitesText,
            relationships: planned.course.relationshipsFrom.map((relationship) => relationship.toCourse.code),
            completedCodes,
            fillRisk: planned.course.enrollmentHistory[0]?.fillRateBucket,
            plannedTermProjected: planned.plannedTerm?.isProjected
          });

          return {
            id: planned.id,
            courseId: planned.courseId,
            courseCode: planned.course.code,
            courseTitle: planned.course.title,
            units,
            status: planned.status,
            plannedTermName: planned.plannedTerm?.name,
            warnings
          };
        });

        return {
          id: semester.id,
          label: semester.label,
          season: semester.season,
          yearIndex: semester.yearIndex,
          unitsTarget: semester.unitsTarget ?? undefined,
          totalUnits: courses.reduce((sum, course) => sum + course.units, 0),
          courses
        };
      });

      const totalPlannedUnits = semesters.reduce((sum, semester) => sum + semester.totalUnits, 0);
      const warnings = semesters.flatMap((semester) =>
        semester.courses.flatMap((course) => course.warnings.map((warning) => `${course.courseCode}: ${warning}`))
      );

      return {
        id: plan.id,
        title: plan.title,
        catalogYear: plan.catalogYear ?? undefined,
        notes: plan.notes ?? undefined,
        semesters,
        totalPlannedUnits,
        warnings
      };
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    return getFallbackPlansState();
  }
}

export async function getDashboardView(): Promise<DashboardView | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: await getDemoUserEmail() },
      include: {
        school: true,
        favoriteCourses: {
          include: { course: true },
          orderBy: { createdAt: "desc" }
        },
        courseHistory: {
          where: { status: CourseHistoryStatus.COMPLETED },
          include: { course: true },
          orderBy: { createdAt: "asc" }
        },
        programSelections: {
          include: {
            program: {
              include: {
                requirementSources: { orderBy: { updatedAt: "desc" }, take: 1 },
                requirementSets: {
                  where: { isActive: true },
                  take: 1,
                  include: {
                    categories: {
                      include: {
                        rules: {
                          include: {
                            optionGroups: true
                          },
                          orderBy: { displayOrder: "asc" }
                        }
                      },
                      orderBy: { displayOrder: "asc" }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!user) return null;

    const plans = await getUserPlanDetails(user.id);
    const completedCodes = user.courseHistory.map((history) => history.course.code);
    const plannedCodes = plans.flatMap((plan) =>
      plan.semesters.flatMap((semester) => semester.courses.map((course) => course.courseCode))
    );

    const progress = evaluateRequirementProgress(
      user.programSelections.map((selection) => selection.program),
      [...completedCodes, ...plannedCodes]
    );

    return {
      userId: user.id,
      userName: user.name ?? undefined,
      schoolName: user.school?.shortName ?? undefined,
      selectedPrograms: user.programSelections.map((selection) => ({
        id: selection.program.id,
        name: selection.program.name,
        type: selection.program.type,
        selectionType: selection.selectionType
      })),
      favoriteCourses: user.favoriteCourses.map((favorite) => ({
        id: favorite.course.id,
        code: favorite.course.code,
        slug: favorite.course.slug,
        title: favorite.course.title
      })),
      completedCourses: user.courseHistory.map((history) => ({
        id: history.course.id,
        code: history.course.code,
        title: history.course.title,
        grade: history.grade ?? undefined
      })),
      plans,
      requirementProgress: progress
    };
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const plans = await getUserPlanDetails("fallback-user");
    const progress = evaluateRequirementProgress(
      mockPrograms.map((program) => ({
        id: program.id,
        name: program.name,
        requirementSources: program.sourceUrl ? [{ sourceUrl: program.sourceUrl }] : [],
        requirementSets: [
          {
            categories: program.categories.map((category) => ({
              id: category.id,
              title: category.title,
              rules: category.rules.map((rule) => ({
                title: rule.title,
                ruleType: RequirementRuleType.CHOOSE_N_COURSES,
                minSelect: rule.minSelect ?? null,
                courseCodes: rule.courseCodes,
                optionGroups: []
              }))
            }))
          }
        ]
      })),
      ["COMPSCI 61A", "DATA C8", "COMPSCI 61B", "DATA C100"]
    );

    return {
      userId: "fallback-user",
      userName: "Alex Student",
      schoolName: "UC Berkeley",
      selectedPrograms: [
        { id: mockPrograms[0].id, name: mockPrograms[0].name, type: mockPrograms[0].type, selectionType: "PRIMARY_MAJOR" },
        { id: "program_data_minor", name: "Data Science Minor", type: "MINOR", selectionType: "MINOR" }
      ],
      favoriteCourses: [
        { id: mockCourses[1].id, code: mockCourses[1].code, slug: mockCourses[1].slug, title: mockCourses[1].title },
        { id: mockCourses[0].id, code: mockCourses[0].code, slug: mockCourses[0].slug, title: mockCourses[0].title }
      ],
      completedCourses: [
        { id: mockCourses[0].id, code: mockCourses[0].code, title: mockCourses[0].title, grade: "A-" },
        { id: "course_c8", code: "DATA C8", title: "Foundations of Data Science", grade: "A" }
      ],
      plans,
      requirementProgress: progress
    };
  }
}

export async function createUserPlan(input: {
  userId: string;
  schoolId: string;
  title: string;
  catalogYear?: string;
}) {
  try {
    return await prisma.userPlan.create({
      data: {
        userId: input.userId,
        schoolId: input.schoolId,
        title: input.title,
        catalogYear: input.catalogYear,
        semesters: {
          create: [
            { label: "Fall Year 1", yearIndex: 1, season: TermSeason.FALL, unitsTarget: 15, sortOrder: 1 },
            { label: "Spring Year 1", yearIndex: 1, season: TermSeason.SPRING, unitsTarget: 15, sortOrder: 2 },
            { label: "Fall Year 2", yearIndex: 2, season: TermSeason.FALL, unitsTarget: 15, sortOrder: 3 },
            { label: "Spring Year 2", yearIndex: 2, season: TermSeason.SPRING, unitsTarget: 15, sortOrder: 4 },
            { label: "Fall Year 3", yearIndex: 3, season: TermSeason.FALL, unitsTarget: 15, sortOrder: 5 },
            { label: "Spring Year 3", yearIndex: 3, season: TermSeason.SPRING, unitsTarget: 15, sortOrder: 6 },
            { label: "Fall Year 4", yearIndex: 4, season: TermSeason.FALL, unitsTarget: 15, sortOrder: 7 },
            { label: "Spring Year 4", yearIndex: 4, season: TermSeason.SPRING, unitsTarget: 15, sortOrder: 8 }
          ]
        }
      },
      include: {
        semesters: true
      }
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const plans = getFallbackPlansState();
    const created: PlanDetailView = {
      id: `fallback-plan-${Date.now()}`,
      title: input.title,
      catalogYear: input.catalogYear,
      notes: "Client-created fallback plan",
      semesters: [
        { id: `sem-${Date.now()}-1`, label: "Fall Year 1", season: "FALL", yearIndex: 1, unitsTarget: 15, totalUnits: 0, courses: [] },
        { id: `sem-${Date.now()}-2`, label: "Spring Year 1", season: "SPRING", yearIndex: 1, unitsTarget: 15, totalUnits: 0, courses: [] },
        { id: `sem-${Date.now()}-3`, label: "Fall Year 2", season: "FALL", yearIndex: 2, unitsTarget: 15, totalUnits: 0, courses: [] },
        { id: `sem-${Date.now()}-4`, label: "Spring Year 2", season: "SPRING", yearIndex: 2, unitsTarget: 15, totalUnits: 0, courses: [] },
        { id: `sem-${Date.now()}-5`, label: "Fall Year 3", season: "FALL", yearIndex: 3, unitsTarget: 15, totalUnits: 0, courses: [] },
        { id: `sem-${Date.now()}-6`, label: "Spring Year 3", season: "SPRING", yearIndex: 3, unitsTarget: 15, totalUnits: 0, courses: [] },
        { id: `sem-${Date.now()}-7`, label: "Fall Year 4", season: "FALL", yearIndex: 4, unitsTarget: 15, totalUnits: 0, courses: [] },
        { id: `sem-${Date.now()}-8`, label: "Spring Year 4", season: "SPRING", yearIndex: 4, unitsTarget: 15, totalUnits: 0, courses: [] }
      ],
      totalPlannedUnits: 0,
      warnings: []
    };
    fallbackPlansState = [...plans, created];
    return created;
  }
}

export async function addPlannedCourse(input: {
  semesterId: string;
  courseId: string;
  plannedTermId?: string;
  notes?: string;
}) {
  try {
    return await prisma.plannedCourse.create({
      data: {
        semesterId: input.semesterId,
        courseId: input.courseId,
        plannedTermId: input.plannedTermId,
        notes: input.notes,
        status: PlanCourseStatus.PLANNED
      }
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const plans = getFallbackPlansState();
    const course = mockCourses.find((item) => item.id === input.courseId);
    if (!course) {
      throw new Error("Course not found in fallback catalog");
    }

    fallbackPlansState = plans.map((plan) =>
      recomputeFallbackPlan({
        ...plan,
        semesters: plan.semesters.map((semester) =>
          semester.id === input.semesterId
            ? {
                ...semester,
                courses: [
                  ...semester.courses,
                  {
                    id: `planned-${Date.now()}`,
                    courseId: course.id,
                    courseCode: course.code,
                    courseTitle: course.title,
                    units: Number.parseFloat(course.units) || 4,
                    status: "PLANNED",
                    plannedTermName: input.plannedTermId,
                    warnings: course.fillRisk.toLowerCase().includes("quick") ? ["Historically hard to enroll in"] : []
                  }
                ]
              }
            : semester
        )
      })
    );

    return fallbackPlansState.flatMap((plan) => plan.semesters.flatMap((semester) => semester.courses)).at(-1);
  }
}

export async function removePlannedCourse(plannedCourseId: string) {
  try {
    return await prisma.plannedCourse.delete({
      where: { id: plannedCourseId }
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const plans = getFallbackPlansState();
    fallbackPlansState = plans.map((plan) =>
      recomputeFallbackPlan({
        ...plan,
        semesters: plan.semesters.map((semester) => ({
          ...semester,
          courses: semester.courses.filter((course) => course.id !== plannedCourseId)
        }))
      })
    );
    return { id: plannedCourseId };
  }
}

export async function movePlannedCourse(input: {
  plannedCourseId: string;
  destinationSemesterId: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const plannedCourse = await tx.plannedCourse.findUnique({
        where: { id: input.plannedCourseId }
      });

      if (!plannedCourse) {
        throw new Error("Planned course not found");
      }

      return tx.plannedCourse.update({
        where: { id: input.plannedCourseId },
        data: { semesterId: input.destinationSemesterId }
      });
    });
  } catch (error) {
    if (!allowMockFallback()) throw error;
    const plans = getFallbackPlansState();
    let movedCourse: PlanDetailView["semesters"][number]["courses"][number] | undefined;

    fallbackPlansState = plans.map((plan) => {
      const semestersWithoutCourse = plan.semesters.map((semester) => {
        const existing = semester.courses.find((course) => course.id === input.plannedCourseId);
        if (existing) {
          movedCourse = existing;
        }

        return {
          ...semester,
          courses: semester.courses.filter((course) => course.id !== input.plannedCourseId)
        };
      });

      const nextSemesters = semestersWithoutCourse.map((semester) =>
        semester.id === input.destinationSemesterId && movedCourse
          ? { ...semester, courses: [...semester.courses, movedCourse] }
          : semester
      );

      return recomputeFallbackPlan({
        ...plan,
        semesters: nextSemesters
      });
    });

    return { id: input.plannedCourseId, semesterId: input.destinationSemesterId };
  }
}

export async function toggleFavoriteCourse(input: { userId: string; courseId: string }) {
  const existing = await prisma.userFavoriteCourse.findUnique({
    where: {
      userId_courseId: {
        userId: input.userId,
        courseId: input.courseId
      }
    }
  });

  if (existing) {
    await prisma.userFavoriteCourse.delete({ where: { id: existing.id } });
    return { favorited: false };
  }

  await prisma.userFavoriteCourse.create({
    data: {
      userId: input.userId,
      courseId: input.courseId
    }
  });

  return { favorited: true };
}

export async function upsertCompletedCourse(input: {
  userId: string;
  courseId: string;
  termId?: string;
  grade?: string;
}) {
  const existing = await prisma.userCourseHistory.findFirst({
    where: {
      userId: input.userId,
      courseId: input.courseId,
      status: CourseHistoryStatus.COMPLETED
    }
  });

  if (existing) {
    return prisma.userCourseHistory.update({
      where: { id: existing.id },
      data: {
        termId: input.termId,
        grade: input.grade,
        status: CourseHistoryStatus.COMPLETED
      }
    });
  }

  return prisma.userCourseHistory.create({
    data: {
      userId: input.userId,
      courseId: input.courseId,
      termId: input.termId,
      grade: input.grade,
      status: CourseHistoryStatus.COMPLETED
    }
  });
}

export async function replaceProgramSelections(input: {
  userId: string;
  selections: Array<{
    programId: string;
    selectionType: ProgramSelectionType;
    isPrimary?: boolean;
  }>;
}) {
  await prisma.userProgramSelection.deleteMany({
    where: { userId: input.userId }
  });

  if (input.selections.length === 0) {
    return [];
  }

  return prisma.$transaction(
    input.selections.map((selection) =>
      prisma.userProgramSelection.create({
        data: {
          userId: input.userId,
          programId: selection.programId,
          selectionType: selection.selectionType,
          isPrimary: selection.isPrimary ?? false
        }
      })
    )
  );
}
