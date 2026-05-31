import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { CompareCourseForm } from "@/components/compare-course-form";
import { GradeDistribution } from "@/components/grade-distribution";
import { PageShell } from "@/components/page-shell";
import { getCourseComparison, getCoursePickerOptions } from "@/lib/repositories";
import { getDashboardView } from "@/lib/user-data";
import { CourseDetail } from "@/lib/types";

type ComparePageProps = {
  searchParams?: Promise<{
    left?: string;
    right?: string;
  }>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const dashboard = await getDashboardView();
  const favoriteSlugs = dashboard?.favoriteCourses.map((course) => course.slug) ?? [];
  const defaultLeft = favoriteSlugs[0] ?? "ucb-compsci-61a";
  const defaultRight = favoriteSlugs[1] ?? (defaultLeft === "ucb-compsci-61a" ? "ucb-compsci-61b" : "ucb-data-c100");
  const left = params?.left ?? defaultLeft;
  const right = params?.right ?? defaultRight;
  const [comparison, courseOptions] = await Promise.all([getCourseComparison(left, right), getCoursePickerOptions()]);

  if (!comparison) {
    notFound();
  }

  const featuredPairs = [
    {
      label: "Intro coding paths",
      left: "ucb-compsci-61a",
      right: "ucb-engin-7"
    },
    {
      label: "Data core choices",
      left: "ucb-data-c100",
      right: "ucb-stat-133"
    },
    {
      label: "Theory vs AI",
      left: "ucb-compsci-170",
      right: "ucb-compsci-188"
    }
  ].filter((pair) => courseOptions.some((option) => option.slug === pair.left) && courseOptions.some((option) => option.slug === pair.right));

  return (
    <PageShell
      eyebrow="Compare"
      title="Compare courses side by side"
      description="Evaluate grading, demand, term fit, and planning value before you lock classes into a semester plan."
    >
      <CompareCourseForm leftDefault={left} rightDefault={right} options={courseOptions} featuredPairs={featuredPairs} />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ComparisonSignalCard
          label="Enrollment pressure"
          leftCourse={comparison.left.code}
          rightCourse={comparison.right.code}
          summary={comparison.summary.workloadSignal}
        />
        <ComparisonSignalCard
          label="Grade shape"
          leftCourse={comparison.left.code}
          rightCourse={comparison.right.code}
          summary={comparison.summary.gradingSignal}
        />
        <ComparisonSignalCard
          label="Planning confidence"
          leftCourse={comparison.left.code}
          rightCourse={comparison.right.code}
          summary={comparison.summary.enrollmentSignal}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[comparison.left, comparison.right].map((course) => (
          <div key={course.id} className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{course.code}</Badge>
              <Badge>{course.units}</Badge>
              <Badge tone={course.dataTone === "projected" ? "projected" : "official"}>{course.fillRisk}</Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[#19212f]">{course.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#4b5668]">{course.description}</p>
            <p className="mt-4 text-sm text-[#6a7383]">Average GPA {course.averageGpa ? course.averageGpa.toFixed(2) : "N/A"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {course.requirementsSatisfied.slice(0, 4).map((item) => (
                <Badge key={`${course.id}-${item.program}-${item.bucket}`} tone="official">
                  {item.program}
                </Badge>
              ))}
            </div>
            <div className="mt-5">
              <GradeDistribution data={course.gradeDistribution} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#19212f]">Comparison summary</h2>
          <div className="mt-4 space-y-3 text-sm text-[#4b5668]">
            <p>{comparison.summary.workloadSignal}</p>
            <p>{comparison.summary.gradingSignal}</p>
            <p>{comparison.summary.enrollmentSignal}</p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#19212f]">Requirement footprint</h2>
          <div className="mt-4 space-y-4 text-sm text-[#4b5668]">
            <CourseRequirementSummary course={comparison.left} />
            <CourseRequirementSummary course={comparison.right} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ComparisonSignalCard({
  label,
  leftCourse,
  rightCourse,
  summary
}: {
  label: string;
  leftCourse: string;
  rightCourse: string;
  summary: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-[rgba(33,51,79,0.12)] bg-[rgba(255,252,246,0.8)] p-5 shadow-[0_18px_55px_rgba(60,55,48,0.07)]">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#8a3f20]">{label}</p>
      <p className="mt-3 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">
        {leftCourse} vs {rightCourse}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#546071]">{summary}</p>
    </div>
  );
}

function CourseRequirementSummary({ course }: { course: CourseDetail }) {
  const buckets = course.requirementsSatisfied.slice(0, 3);

  return (
    <div className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
      <p className="font-semibold text-[#19212f]">{course.code}</p>
      <p className="mt-1 text-sm text-[#6a7383]">{buckets.length} mapped planning bucket{buckets.length === 1 ? "" : "s"}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {buckets.map((item) => (
          <Badge key={`${course.id}-${item.program}-${item.bucket}`}>{item.bucket}</Badge>
        ))}
      </div>
    </div>
  );
}
