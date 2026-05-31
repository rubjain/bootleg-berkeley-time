import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToPlanButton } from "@/components/add-to-plan-button";
import { Badge } from "@/components/badge";
import { CourseOverviewPanel } from "@/components/course-overview-panel";
import { CourseTabs } from "@/components/course/course-tabs";
import { EnrollmentChart } from "@/components/enrollment-chart";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { GradeDistribution } from "@/components/grade-distribution";
import { InstructorList } from "@/components/instructor-list";
import { PageShell } from "@/components/page-shell";
import { filterCommunityByBlockedAuthors, getBlockedAuthors } from "@/lib/community-moderation";
import { getCourseByIdOrSlug } from "@/lib/repositories";
import { getCourseCommunity } from "@/lib/social-service";
import { getDashboardView } from "@/lib/user-data";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourseByIdOrSlug(id);
  if (!course) notFound();

  const [communityRaw, dashboard, blockedAuthors] = await Promise.all([
    getCourseCommunity(course.slug),
    getDashboardView(),
    getBlockedAuthors()
  ]);
  const community = filterCommunityByBlockedAuthors(communityRaw, blockedAuthors);
  const initialFavorited = dashboard?.favoriteCourses.some((favorite) => favorite.id === course.id) ?? false;
  const compareTargetSlug = course.relatedCourseLinks[0]?.slug ?? "ucb-data-c100";

  return (
    <PageShell
      eyebrow={course.code}
      title={course.title}
      description={course.descriptionPreview ?? course.description}
    >
      <CourseTabs
        courseSlug={course.slug}
        community={community}
        overview={
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{course.units}</Badge>
                <Badge>{course.level}</Badge>
                <Badge tone={course.dataTone === "projected" ? "projected" : "official"}>{course.fillRisk}</Badge>
                <FavoriteToggle courseId={course.id} initialFavorited={initialFavorited} />
              </div>
              {(course.unmetPrerequisiteCodes?.length ?? 0) > 0 ? (
                <p className="mt-4 rounded-2xl bg-[rgba(201,111,74,0.12)] px-4 py-3 text-sm text-[#8a3f20]">
                  Still need: {course.unmetPrerequisiteCodes?.join(", ")}
                </p>
              ) : (course.completedPrerequisiteCodes?.length ?? 0) > 0 ? (
                <p className="mt-4 rounded-2xl bg-[rgba(29,107,109,0.1)] px-4 py-3 text-sm text-[#1d6b6d]">
                  Prerequisites met: {course.completedPrerequisiteCodes?.join(", ")}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <AddToPlanButton courseId={course.id} />
                <Link
                  href={`/compare?left=${encodeURIComponent(course.slug)}&right=${encodeURIComponent(compareTargetSlug)}`}
                  className="text-sm font-medium text-[#1d6b6d] underline-offset-2 hover:underline"
                >
                  Compare this course
                </Link>
              </div>
            </div>

            <CourseOverviewPanel course={course} />

            <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#8a3f20]">Planning notes</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#4b5668]">
                <p>
                  <strong className="text-[#19212f]">Prerequisites:</strong> {course.catalogDetail.prerequisitesNote}
                </p>
                <p>
                  <strong className="text-[#19212f]">Historically offered:</strong> {course.termsOffered.join(", ") || "Limited data"}
                </p>
                <p>
                  <strong className="text-[#19212f]">Professor snapshot:</strong> {course.professorSummary}
                </p>
                {course.bestSemesterNote ? (
                  <p>
                    <strong className="text-[#19212f]">Best semester:</strong> {course.bestSemesterNote}
                  </p>
                ) : null}
                {course.futureOfferingNote ? (
                  <p>
                    <strong className="text-[#19212f]">Future offerings:</strong> {course.futureOfferingNote}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        }
        gradeData={
          <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#19212f]">Historical grade distribution</h2>
            <p className="mt-2 text-sm text-[#6a7383]">Average GPA {course.averageGpa ? course.averageGpa.toFixed(2) : "N/A"}</p>
            <div className="mt-6">
              <GradeDistribution data={course.gradeDistribution} />
            </div>
          </div>
        }
        enrollment={
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#19212f]">Enrollment trends</h2>
              <p className="mt-2 text-sm text-[#6a7383]">{course.fillRisk}</p>
              <div className="mt-4">
                <EnrollmentChart data={course.enrollmentTrend ?? []} />
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#19212f]">Weekly schedule preview</h2>
              <div className="mt-4 space-y-3">
                {course.weeklyScheduleSummary.length ? (
                  course.weeklyScheduleSummary.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
                      <p className="font-semibold text-[#19212f]">{item.label}</p>
                      <p className="mt-1 text-sm text-[#4b5668]">
                        {item.days ?? "Days TBA"} · {item.time ?? "Time TBA"}
                      </p>
                      <p className="mt-1 text-sm text-[#6a7383]">
                        {item.location ?? "Location TBA"} · {item.status}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#6a7383]">No meeting pattern data available yet.</p>
                )}
              </div>
            </div>
          </div>
        }
        professors={<InstructorList instructors={course.instructors} summary={course.professorSummary} />}
        requirements={
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#19212f]">Requirements satisfied</h2>
              <div className="mt-4 flex flex-col gap-3">
                {course.requirementsSatisfied.map((item) => (
                  <div key={`${item.program}-${item.bucket}`} className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
                    <p className="text-sm font-semibold text-[#19212f]">{item.program}</p>
                    <p className="text-sm text-[#6a7383]">{item.bucket}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#19212f]">Related courses</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {course.relatedCourseLinks.length ? (
                  course.relatedCourseLinks.map((related) => (
                    <Link
                      key={related.code}
                      href={`/courses/${related.slug}`}
                      className="inline-flex rounded-full bg-[rgba(36,48,71,0.08)] px-3 py-1.5 text-sm font-medium text-[#314056] transition hover:bg-[rgba(36,48,71,0.12)]"
                    >
                      {related.code}
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-[#6a7383]">No mapped related courses yet.</p>
                )}
              </div>
            </div>
          </div>
        }
      />
    </PageShell>
  );
}
