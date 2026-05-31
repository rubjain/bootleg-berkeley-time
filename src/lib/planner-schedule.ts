import { mockCourses } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { PlanDetailView } from "@/lib/types";

export type PlannerWeeklyScheduleItem = {
  id: string;
  title: string;
  courseCode: string;
  sectionLabel?: string;
  days?: string;
  time?: string;
  location?: string;
  termLabel?: string;
  status: string;
  isProjected?: boolean;
  conflictWith?: string[];
};

export type PlannerSemesterOption = {
  id: string;
  label: string;
  termLabel?: string;
  courseCount: number;
};

export type PlannerWeeklyScheduleResult = {
  items: PlannerWeeklyScheduleItem[];
  conflicts: Array<{ courses: string[]; days: string[]; time: string }>;
  focusTermLabel?: string;
  focusSemesterId?: string;
  semesterOptions: PlannerSemesterOption[];
};

const FALLBACK_BY_CODE: Record<
  string,
  { days: string; time: string; location: string; status: string; sectionLabel?: string }
> = {
  "COMPSCI 61B": {
    sectionLabel: "Lecture 001",
    days: "MWF",
    time: "13:00-13:59",
    location: "Dwinelle 155",
    status: "WAITLIST"
  },
  "MATH 54": {
    sectionLabel: "Lecture 001",
    days: "MW",
    time: "13:00-14:29",
    location: "Evans 60",
    status: "OPEN"
  },
  "DATA C100": {
    sectionLabel: "Lecture 001",
    days: "TuTh",
    time: "14:00-15:29",
    location: "Soda 306",
    status: "WAITLIST"
  },
  "COMPSCI 61A": {
    sectionLabel: "Lecture 001",
    days: "MWF",
    time: "10:00-10:59",
    location: "Wheeler 150",
    status: "CLOSED"
  },
  "UGBA 100": {
    sectionLabel: "Lecture 001",
    days: "MW",
    time: "11:00-12:29",
    location: "Cheit Hall",
    status: "PROJECTED"
  },
  "UGBA 10": {
    sectionLabel: "Lecture 001",
    days: "MW",
    time: "10:00-11:29",
    location: "Haas Courtyard",
    status: "OPEN"
  },
  "DATA C104": {
    sectionLabel: "Lecture 001",
    days: "MW",
    time: "11:00-12:29",
    location: "Wheeler 102",
    status: "OPEN"
  },
  "COMPSCI 188": {
    sectionLabel: "Lecture 001",
    days: "TuTh",
    time: "15:30-16:59",
    location: "Soda 306",
    status: "PROJECTED"
  },
  "MATH 55": {
    sectionLabel: "Lecture 001",
    days: "MWF",
    time: "11:00-11:59",
    location: "Evans 10",
    status: "OPEN"
  },
  "IB 131": {
    sectionLabel: "Lecture 001",
    days: "TuTh",
    time: "11:00-12:29",
    location: "VLSB 2050",
    status: "OPEN"
  },
  "IB C77": {
    sectionLabel: "Lecture 001",
    days: "MWF",
    time: "09:00-09:59",
    location: "VLSB 2060",
    status: "PROJECTED"
  },
  "COMPSCI 70": {
    sectionLabel: "Lecture 001",
    days: "TuTh",
    time: "12:30-13:59",
    location: "Wheeler 150",
    status: "OPEN"
  },
  "DATA C8": {
    sectionLabel: "Lecture 001",
    days: "MWF",
    time: "09:00-09:59",
    location: "Wheeler 150",
    status: "OPEN"
  },
  "DATA 144": {
    sectionLabel: "Lecture 001",
    days: "TuTh",
    time: "14:00-15:29",
    location: "Soda 320",
    status: "PROJECTED"
  },
  "UGBA 102A": {
    sectionLabel: "Lecture 001",
    days: "MW",
    time: "14:00-15:29",
    location: "Chou Hall",
    status: "OPEN"
  },
  "STAT 134": {
    sectionLabel: "Lecture 001",
    days: "MWF",
    time: "10:00-10:59",
    location: "Evans 10",
    status: "PROJECTED"
  },
  "STAT 135": {
    sectionLabel: "Lecture 001",
    days: "TuTh",
    time: "11:00-12:29",
    location: "Evans 10",
    status: "OPEN"
  }
};

function normalizeTermLabel(label?: string) {
  return label?.trim().toLowerCase() ?? "";
}

function termLabelsMatch(planned?: string, offeringTerm?: string) {
  if (!planned || !offeringTerm) return false;
  const a = normalizeTermLabel(planned);
  const b = normalizeTermLabel(offeringTerm);
  return a === b || a.includes(b) || b.includes(a);
}

export function expandMeetingDays(days?: string): string[] {
  if (!days?.trim()) return [];
  const value = days.trim();
  const expanded: string[] = [];
  if (value.includes("Tu")) expanded.push("Tue");
  if (value.includes("Th")) expanded.push("Thu");
  if (value.includes("M")) expanded.push("Mon");
  if (value.includes("W")) expanded.push("Wed");
  if (value.includes("F")) expanded.push("Fri");
  return expanded;
}

function parseMinutes(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + (minutes || 0);
}

export function parseTimeRange(time?: string) {
  if (!time?.includes("-")) return null;
  const [startRaw, endRaw] = time.split("-").map((part) => part.trim());
  if (!startRaw || !endRaw) return null;
  return { start: parseMinutes(startRaw), end: parseMinutes(endRaw) };
}

function rangesOverlap(
  left: { start: number; end: number },
  right: { start: number; end: number }
) {
  return left.start < right.end && right.start < left.end;
}

export function detectScheduleConflicts(items: PlannerWeeklyScheduleItem[]) {
  const conflicts: PlannerWeeklyScheduleResult["conflicts"] = [];
  const seen = new Set<string>();

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i];
      const b = items[j];
      const rangeA = parseTimeRange(a.time);
      const rangeB = parseTimeRange(b.time);
      if (!rangeA || !rangeB || !a.days || !b.days) continue;

      const sharedDays = expandMeetingDays(a.days).filter((day) => expandMeetingDays(b.days).includes(day));
      if (!sharedDays.length || !rangesOverlap(rangeA, rangeB)) continue;

      const key = [a.courseCode, b.courseCode].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);

      conflicts.push({
        courses: [a.courseCode, b.courseCode],
        days: sharedDays,
        time: `${a.time} overlaps ${b.time}`
      });

      a.conflictWith = [...new Set([...(a.conflictWith ?? []), b.courseCode])];
      b.conflictWith = [...new Set([...(b.conflictWith ?? []), a.courseCode])];
    }
  }

  return conflicts;
}

export function listPlannerSemesters(plan: PlanDetailView): PlannerSemesterOption[] {
  return plan.semesters
    .filter((semester) => semester.courses.length > 0)
    .map((semester) => ({
      id: semester.id,
      label: semester.label,
      termLabel: semester.courses.find((course) => course.plannedTermName)?.plannedTermName,
      courseCount: semester.courses.length
    }));
}

function pickFocusSemester(plan: PlanDetailView, semesterId?: string) {
  const withCourses = plan.semesters.filter((semester) => semester.courses.length > 0);
  if (semesterId) {
    return withCourses.find((semester) => semester.id === semesterId) ?? withCourses[0] ?? plan.semesters[0];
  }
  return withCourses[0] ?? plan.semesters[0];
}

function offeringToItem(input: {
  courseCode: string;
  plannedTermName?: string;
  offering: {
    id: string;
    sectionCode: string;
    component: string;
    meetingDays: string | null;
    timeStart: string | null;
    timeEnd: string | null;
    location: string | null;
    status: string;
    isProjected: boolean;
    term: { name: string };
  };
}): PlannerWeeklyScheduleItem {
  const time =
    input.offering.timeStart && input.offering.timeEnd
      ? `${input.offering.timeStart}-${input.offering.timeEnd}`
      : undefined;

  return {
    id: `${input.courseCode}-${input.offering.id}`,
    title: input.courseCode,
    courseCode: input.courseCode,
    sectionLabel: `${input.offering.component} ${input.offering.sectionCode}`,
    days: input.offering.meetingDays ?? undefined,
    time,
    location: input.offering.location ?? undefined,
    termLabel: input.offering.term.name,
    status: input.offering.status,
    isProjected: input.offering.isProjected
  };
}

function fallbackItem(courseCode: string, plannedTermName?: string): PlannerWeeklyScheduleItem | null {
  const mock = mockCourses.find((course) => course.code === courseCode);
  const mockSlot = mock?.weeklyScheduleSummary[0];
  const hardcoded = FALLBACK_BY_CODE[courseCode];

  if (mockSlot) {
    return {
      id: `fallback-${courseCode}`,
      title: courseCode,
      courseCode,
      sectionLabel: mockSlot.label,
      days: mockSlot.days,
      time: mockSlot.time,
      location: mockSlot.location,
      termLabel: plannedTermName,
      status: mockSlot.status,
      isProjected: mockSlot.status === "PROJECTED"
    };
  }

  if (hardcoded) {
    return {
      id: `fallback-${courseCode}`,
      title: courseCode,
      courseCode,
      sectionLabel: hardcoded.sectionLabel,
      days: hardcoded.days,
      time: hardcoded.time,
      location: hardcoded.location,
      termLabel: plannedTermName,
      status: hardcoded.status,
      isProjected: hardcoded.status === "PROJECTED"
    };
  }

  return null;
}

export async function getPlannerWeeklySchedule(
  plan?: PlanDetailView | null,
  semesterId?: string
): Promise<PlannerWeeklyScheduleResult> {
  const semesterOptions = plan ? listPlannerSemesters(plan) : [];

  if (!plan) {
    return { items: [], conflicts: [], semesterOptions };
  }

  const focusSemester = pickFocusSemester(plan, semesterId);
  if (!focusSemester) {
    return { items: [], conflicts: [], semesterOptions };
  }

  const plannedCourses = focusSemester.courses;
  const courseIds = [...new Set(plannedCourses.map((course) => course.courseId))];
  const focusTermLabel = plannedCourses.find((course) => course.plannedTermName)?.plannedTermName;

  try {
    const offerings = await prisma.courseOffering.findMany({
      where: { courseId: { in: courseIds } },
      include: { term: true },
      orderBy: [{ term: { year: "desc" } }, { sectionCode: "asc" }]
    });

    const offeringsByCourse = new Map<string, typeof offerings>();
    for (const offering of offerings) {
      const list = offeringsByCourse.get(offering.courseId) ?? [];
      list.push(offering);
      offeringsByCourse.set(offering.courseId, list);
    }

    const items = plannedCourses
      .map((planned) => {
        const courseOfferings = offeringsByCourse.get(planned.courseId) ?? [];
        const matched =
          courseOfferings.find((offering) => termLabelsMatch(planned.plannedTermName, offering.term.name)) ??
          courseOfferings.find((offering) => !offering.isProjected) ??
          courseOfferings[0];

        if (matched) {
          return offeringToItem({
            courseCode: planned.courseCode,
            plannedTermName: planned.plannedTermName,
            offering: matched
          });
        }

        return fallbackItem(planned.courseCode, planned.plannedTermName);
      })
      .filter((item): item is PlannerWeeklyScheduleItem => Boolean(item));

    const conflicts = detectScheduleConflicts(items);
    return {
      items,
      conflicts,
      focusTermLabel: focusTermLabel ?? focusSemester.label,
      focusSemesterId: focusSemester.id,
      semesterOptions
    };
  } catch {
    const items = plannedCourses
      .map((planned) => fallbackItem(planned.courseCode, planned.plannedTermName))
      .filter((item): item is PlannerWeeklyScheduleItem => Boolean(item));

    const conflicts = detectScheduleConflicts(items);
    return {
      items,
      conflicts,
      focusTermLabel: focusTermLabel ?? focusSemester.label,
      focusSemesterId: focusSemester.id,
      semesterOptions
    };
  }
}
