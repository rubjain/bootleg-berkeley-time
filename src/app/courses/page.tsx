import Link from "next/link";
import { Suspense } from "react";
import { CourseCard } from "@/components/course-card";
import { CourseFilters } from "@/components/course-filters";
import { CoursePagination } from "@/components/course-pagination";
import { PageShell } from "@/components/page-shell";
import { DataCoverageBanner } from "@/components/data-coverage-banner";
import { getBerkeleyOfficialCoverage } from "@/lib/berkeley-official-sync";
import { COURSE_LIST_PAGE_SIZE, getCourseFilterOptions, getCoursesPage } from "@/lib/repositories";

type CoursesPageProps = {
  searchParams?: Promise<{ q?: string; department?: string; level?: string; tone?: string; page?: string }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const filters = {
    q: params?.q,
    department: params?.department,
    level: params?.level,
    tone: params?.tone
  };
  const requestedPage = Number(params?.page ?? "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

  const [coursePage, filterOptions, coverage] = await Promise.all([
    getCoursesPage(filters, page, COURSE_LIST_PAGE_SIZE),
    getCourseFilterOptions(),
    getBerkeleyOfficialCoverage().catch(() => null)
  ]);

  const paginationParams = {
    q: params?.q,
    department: params?.department,
    level: params?.level,
    tone: params?.tone
  };

  return (
    <PageShell
      eyebrow="Course Explorer"
      title="Browse Berkeley courses with planning context"
      description="Search and filter by department, level, and data type. Every course links to grades, enrollment signals, and requirement mapping."
    >
      {coverage ? (
        <DataCoverageBanner
          courseCount={coverage.localCourseCount}
          programCount={coverage.localProgramCount}
        />
      ) : null}

      <div className="mb-8 rounded-3xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
        <Suspense fallback={<p className="text-sm text-[#6a7383]">Loading filters...</p>}>
          <CourseFilters departments={filterOptions.departments} levels={filterOptions.levels} />
        </Suspense>
        <p className="mt-4 text-sm text-[#6a7383]">
          Showing {coursePage.courses.length} of {coursePage.total} course{coursePage.total === 1 ? "" : "s"} matching your filters.{" "}
          <Link href="/compare" className="font-medium text-[#1d6b6d] underline-offset-2 hover:underline">
            Compare two courses
          </Link>
        </p>
      </div>

      {coursePage.courses.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {coursePage.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-8 text-center text-sm text-[#6a7383]">
          No courses match these filters. Try clearing a department or search term.
        </div>
      )}

      <div className="mt-8">
        <CoursePagination
          page={coursePage.page}
          totalPages={coursePage.totalPages}
          total={coursePage.total}
          searchParams={paginationParams}
        />
      </div>
    </PageShell>
  );
}
