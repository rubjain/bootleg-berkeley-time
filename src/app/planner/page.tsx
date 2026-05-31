import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { PlanCreator } from "@/components/plan-creator";
import { PlannerBoard } from "@/components/planner-board";
import { PlanSwitcher } from "@/components/plan-switcher";
import { ProgressMeter } from "@/components/progress-meter";
import { RecommendationList } from "@/components/recommendation-list";
import { PlannerSemesterSwitcher } from "@/components/planner-semester-switcher";
import { WeeklyScheduleBoard } from "@/components/weekly-schedule-board";
import { getPlannerWeeklySchedule } from "@/lib/planner-schedule";
import { getCourses, getRecommendationPreview } from "@/lib/repositories";
import { getDashboardView } from "@/lib/user-data";

type PlannerPageProps = {
  searchParams?: Promise<{ planId?: string; semesterId?: string }>;
};

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const params = await searchParams;
  const recommendations = await getRecommendationPreview();
  const courses = await getCourses();
  const dashboard = await getDashboardView();
  const activePlan = dashboard?.plans.find((plan) => plan.id === params?.planId) ?? dashboard?.plans[0];
  const weeklySchedule = await getPlannerWeeklySchedule(activePlan, params?.semesterId);

  return (
    <PageShell
      eyebrow="Planner"
      title="Build your semester-by-semester graduation path"
      description="Switch between saved plans, drag courses between semesters, and track requirement progress alongside enrollment warnings."
    >
      <div className="mb-6 space-y-4">
        {dashboard?.plans.length ? (
          <Suspense fallback={<p className="text-sm text-[#6a7383]">Loading plans...</p>}>
            <PlanSwitcher plans={dashboard.plans} />
          </Suspense>
        ) : null}
        <PlanCreator />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          {activePlan ? (
            <PlannerBoard plan={activePlan} courseOptions={courses.slice(0, 20)} />
          ) : (
            <div className="rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 text-sm text-[#6a7383]">
              No plan available yet. Create one above or sign in with a seeded demo account.
            </div>
          )}
        </div>

        <div className="space-y-6">
          {dashboard?.requirementProgress.map((progress) => (
            <ProgressMeter
              key={progress.programId}
              label={`${progress.programName} progress`}
              value={progress.completionPercent}
              subtitle="Counts completed and planned requirement rule matches"
            />
          ))}
          <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#19212f]">Planner warnings</h2>
            <div className="mt-4 space-y-3 text-sm text-[#4b5668]">
              {activePlan?.warnings.length
                ? activePlan.warnings.map((warning) => <p key={warning}>{warning}</p>)
                : <p>No warnings for this plan.</p>}
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#19212f]">Recommended next classes</h2>
            <div className="mt-4">
              <RecommendationList items={recommendations} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {weeklySchedule.semesterOptions.length ? (
          <Suspense fallback={null}>
            <PlannerSemesterSwitcher semesters={weeklySchedule.semesterOptions} />
          </Suspense>
        ) : null}
        <WeeklyScheduleBoard
          items={weeklySchedule.items}
          conflicts={weeklySchedule.conflicts}
          focusTermLabel={weeklySchedule.focusTermLabel}
        />
      </div>
    </PageShell>
  );
}