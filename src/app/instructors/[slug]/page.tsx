import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { ProfessorRatingCard } from "@/components/professor-rating-card";
import { getInstructorBySlug } from "@/lib/repositories";

export default async function InstructorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const instructor = await getInstructorBySlug(slug);
  if (!instructor) notFound();

  return (
    <PageShell
      eyebrow="Instructor"
      title={instructor.name}
      description={
        instructor.bio ??
        `${instructor.departmentName ?? instructor.departmentCode ?? "Berkeley"} faculty with live Rate My Professors ratings when available.`
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ProfessorRatingCard instructor={instructor} />

        <section className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#8a3f20]">Courses taught</p>
          {instructor.coursesTaught.length ? (
            <ul className="mt-4 space-y-3">
              {instructor.coursesTaught.map((course) => (
                <li
                  key={`${course.courseSlug}-${course.termName}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[rgba(36,48,71,0.05)] px-4 py-3"
                >
                  <div>
                    <Link
                      href={`/courses/${course.courseSlug}`}
                      className="font-medium text-[#19212f] underline-offset-2 hover:underline"
                    >
                      {course.courseCode} · {course.courseTitle}
                    </Link>
                    <p className="mt-1 text-sm text-[#6a7383]">
                      {course.termName}
                      {course.role ? ` · ${course.role}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[#6a7383]">No linked course offerings yet.</p>
          )}
        </section>
      </div>
    </PageShell>
  );
}
