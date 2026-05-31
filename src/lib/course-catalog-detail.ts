import { CourseCatalogDetail } from "@/lib/types";

type CourseCatalogInput = {
  code: string;
  title: string;
  description: string;
  level: string;
  departmentCode: string;
  requirementTags: string[];
  prerequisitesText?: string | null;
};

export function getCourseCatalogDetail(course: CourseCatalogInput): CourseCatalogDetail {
  const isUpper = course.level.toLowerCase().includes("upper");
  const isLower = course.level.toLowerCase().includes("lower");
  const isData = course.departmentCode === "DATA" || course.requirementTags.some((tag) => tag.includes("data"));
  const isCS = course.departmentCode === "COMPSCI" || course.requirementTags.some((tag) => tag.includes("cs"));

  const learningOutcomes: string[] = [];

  if (isCS || course.code.includes("COMPSCI")) {
    learningOutcomes.push(
      "Design and analyze programs using abstraction, recursion, and data representations.",
      "Reason about runtime, correctness, and tradeoffs when choosing algorithms and structures.",
      "Collaborate on larger software-style assignments with testing and debugging discipline."
    );
  } else if (isData) {
    learningOutcomes.push(
      "Frame real-world questions as data problems with reproducible analysis pipelines.",
      "Communicate findings with visualizations, models, and uncertainty-aware conclusions.",
      "Evaluate ethical, privacy, and bias implications of data-driven decisions."
    );
  } else if (course.departmentCode === "UGBA") {
    learningOutcomes.push(
      "Apply business frameworks to case studies, memos, and team-based deliverables.",
      "Practice professional communication across diverse stakeholder contexts.",
      "Connect course concepts to internship, recruiting, and cross-functional teamwork."
    );
  } else if (course.departmentCode === "MATH" || course.departmentCode === "STAT") {
    learningOutcomes.push(
      "Build formal reasoning skills through proofs, problem sets, and structured problem banks.",
      "Translate mathematical tools into applications used by science and engineering majors.",
      "Prepare for downstream major requirements that depend on this course's techniques."
    );
  } else {
    learningOutcomes.push(
      `Understand the core ideas behind ${course.title} at a ${isUpper ? "upper-division" : isLower ? "introductory" : "intermediate"} level.`,
      "Connect lecture concepts to discussion, lab, or project work throughout the term.",
      "Develop study habits that match the department's typical exam and assignment cadence."
    );
  }

  const workloadNotes = isUpper
    ? "Expect weekly problem sets or projects, a midterm cycle, and a final exam or capstone deliverable. Upper-division pacing is less hand-holding than lower-division foundations."
    : isLower
      ? "Foundational pacing with discussion sections, weekly assignments, and high office-hour traffic near exams. Start problem sets early if enrollment is large."
      : "Workload varies by instructor section, but plan for consistent weekly assignments and at least one high-stakes exam block.";

  const assessmentStyle = isCS || isData
    ? "Mix of autograded coding assignments, written questions, and exams that test both implementation and concepts."
    : course.departmentCode === "UGBA"
      ? "Case memos, participation, group projects, and exams weighted toward applied communication."
      : "Problem sets, quizzes or midterms, and a cumulative final aligned with the department's historical curve.";

  return {
    learningOutcomes,
    workloadNotes,
    assessmentStyle,
    prerequisitesNote: course.prerequisitesText ?? "See the Berkeley catalog for the latest official prerequisite language."
  };
}

export function truncateDescription(description: string, maxLength = 160) {
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength).trimEnd()}…`;
}
