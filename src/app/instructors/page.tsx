import { Suspense } from "react";
import { InstructorCard } from "@/components/instructor-card";
import { InstructorFilters } from "@/components/instructor-filters";
import { PageShell } from "@/components/page-shell";
import { getInstructorFilterOptions, getInstructors } from "@/lib/repositories";

type InstructorsPageProps = {
  searchParams?: Promise<{ q?: string; department?: string }>;
};

export default async function InstructorsPage({ searchParams }: InstructorsPageProps) {
  const params = await searchParams;
  const filters = { q: params?.q, department: params?.department };
  const [instructors, filterOptions] = await Promise.all([
    getInstructors(filters),
    getInstructorFilterOptions()
  ]);

  return (
    <PageShell
      eyebrow="Instructors"
      title="Browse Berkeley faculty with live Rate My Professors ratings"
      description="Search instructors by name or department. Ratings are fetched live from Rate My Professors for UC Berkeley and cached for 24 hours."
    >
      <div className="mb-8 rounded-3xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
        <Suspense fallback={<p className="text-sm text-[#6a7383]">Loading filters...</p>}>
          <InstructorFilters departments={filterOptions.departments} />
        </Suspense>
        <p className="mt-4 text-sm text-[#6a7383]">
          {instructors.length} instructor{instructors.length === 1 ? "" : "s"} match your filters.
        </p>
      </div>

      {instructors.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-8 text-center text-sm text-[#6a7383]">
          No instructors match these filters.
        </div>
      )}
    </PageShell>
  );
}
