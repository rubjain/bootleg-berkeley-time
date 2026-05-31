import { Suspense } from "react";
import { ProgramCard } from "@/components/program-card";
import { ProgramFilters } from "@/components/program-filters";
import { PageShell } from "@/components/page-shell";
import { DataCoverageBanner } from "@/components/data-coverage-banner";
import { getPrograms } from "@/lib/repositories";
import { getBerkeleyOfficialCoverage } from "@/lib/berkeley-official-sync";

type ProgramsPageProps = {
  searchParams?: Promise<{ q?: string; type?: string }>;
};

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const params = await searchParams;
  const filters = {
    q: params?.q,
    type: params?.type as "MAJOR" | "MINOR" | "CERTIFICATE" | undefined
  };
  const [programs, coverage] = await Promise.all([
    getPrograms(filters),
    getBerkeleyOfficialCoverage().catch(() => null)
  ]);
  const majors = programs.filter((program) => program.type === "MAJOR");
  const minors = programs.filter((program) => program.type === "MINOR");
  const certificates = programs.filter((program) => program.type === "CERTIFICATE");
  const showMajors = !filters.type || filters.type === "MAJOR";
  const showMinors = !filters.type || filters.type === "MINOR";
  const showCertificates = !filters.type || filters.type === "CERTIFICATE";

  return (
    <PageShell
      eyebrow="Programs"
      title="Major and minor requirement planning"
      description="Normalized official requirement data is stored in the database, versioned over time, and linked back to source pages so students can verify what is official versus inferred."
    >
      {coverage ? (
        <DataCoverageBanner
          courseCount={coverage.localCourseCount}
          programCount={coverage.localProgramCount}
        />
      ) : null}

      <div className="mb-8 rounded-3xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
        <Suspense fallback={<p className="text-sm text-[#6a7383]">Loading filters...</p>}>
          <ProgramFilters />
        </Suspense>
        <p className="mt-4 text-sm text-[#6a7383]">
          {programs.length} program{programs.length === 1 ? "" : "s"} match your filters.
        </p>
      </div>

      <div className="space-y-10">
        {showMajors && majors.length ? (
          <section>
            <ProgramSection title="Majors" count={majors.length} programs={majors} />
          </section>
        ) : null}

        {showMinors && minors.length ? (
          <section>
            <ProgramSection title="Minors" count={minors.length} programs={minors} />
          </section>
        ) : null}

        {showCertificates && certificates.length ? (
          <section>
            <ProgramSection title="Certificates" count={certificates.length} programs={certificates} />
          </section>
        ) : null}

        {!programs.length ? (
          <p className="rounded-3xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 text-sm text-[#6a7383]">
            No programs match your search. Try clearing filters or searching by a shorter keyword.
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}

function ProgramSection({
  title,
  count,
  programs
}: {
  title: string;
  count: number;
  programs: Awaited<ReturnType<typeof getPrograms>>;
}) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-[#19212f]">{title}</h2>
        <p className="text-sm text-[#6a7383]">{count} listed</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </>
  );
}
