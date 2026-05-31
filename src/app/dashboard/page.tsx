import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { ProgressMeter } from "@/components/progress-meter";
import { RecommendationList } from "@/components/recommendation-list";
import { RequirementGaps } from "@/components/requirement-gaps";
import { StatCard } from "@/components/stat-card";
import { getActiveUserEmail } from "@/lib/auth/session";
import { getRecommendationPreview } from "@/lib/repositories";
import { getDashboardView } from "@/lib/user-data";

export default async function DashboardPage() {
  const [dashboard, recommendations, email] = await Promise.all([
    getDashboardView(),
    getRecommendationPreview(),
    getActiveUserEmail()
  ]);

  if (!dashboard) {
    return (
      <PageShell
        eyebrow="Dashboard"
        title="Dashboard unavailable"
        description="Sign in with a demo account and run npm run prisma:seed to load student data."
      />
    );
  }

  return (
    <PageShell
      eyebrow="Dashboard"
      title={dashboard.userName ? `Welcome back, ${dashboard.userName}` : "Your planning home"}
      description="Track programs, favorites, completed courses, requirement gaps, and personalized course recommendations."
    >
      <p className="mb-6 text-sm text-[#6a7383]">
        Viewing as <span className="font-medium text-[#19212f]">{email}</span>
      </p>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Saved plans" value={String(dashboard.plans.length)} detail="Switch between plan versions in the planner." />
        <StatCard label="Selected programs" value={String(dashboard.selectedPrograms.length)} detail="Edit majors and minors on your profile." />
        <StatCard label="Completed courses" value={String(dashboard.completedCourses.length)} detail="Powers requirement and recommendation scoring." />
      </div>

      <section className="mt-8 rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#19212f]">What to take next</h2>
        <p className="mt-2 text-sm text-[#6a7383]">Based on your programs, transcript, and enrollment signals.</p>
        <div className="mt-4">
          <RecommendationList items={recommendations} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-[#19212f]">Requirement gaps</h2>
        <p className="mt-2 text-sm text-[#6a7383]">Open rules that your completed and planned courses have not satisfied yet.</p>
        <div className="mt-4">
          <RequirementGaps progress={dashboard.requirementProgress} />
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#19212f]">Selected programs</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {dashboard.selectedPrograms.map((program) => (
              <Link
                key={`${program.id}-${program.selectionType}`}
                href={`/programs/${program.id}`}
                className="rounded-full bg-[rgba(36,48,71,0.08)] px-3 py-1.5 text-sm font-medium text-[#314056] transition hover:bg-[rgba(36,48,71,0.12)]"
              >
                {program.name}
              </Link>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-semibold text-[#19212f]">Favorite courses</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.favoriteCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="block rounded-2xl bg-[rgba(36,48,71,0.05)] p-4 transition hover:bg-[rgba(36,48,71,0.08)]"
              >
                <p className="font-semibold text-[#19212f]">{course.code}</p>
                <p className="text-sm text-[#6a7383]">{course.title}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {dashboard.requirementProgress.map((progress) => (
            <ProgressMeter
              key={progress.programId}
              label={progress.programName}
              value={progress.completionPercent}
              subtitle="Completed or planned requirement coverage"
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
