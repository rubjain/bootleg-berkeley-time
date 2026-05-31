import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { PageShell } from "@/components/page-shell";
import { ProgramDetailTabs } from "@/components/program-detail-tabs";
import { getOfficialRequirementAudit } from "@/lib/program-advising";
import { getCoursesByCodes, getProgramByIdOrSlug } from "@/lib/repositories";

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = await getProgramByIdOrSlug(id);

  if (!program) notFound();

  const audit = getOfficialRequirementAudit(program.slug);
  const showAuditBanner = program.categories.length >= 3 ? null : audit;
  const mappedCourseCodes = [
    ...new Set(program.categories.flatMap((category) => category.rules.flatMap((rule) => rule.courseCodes)))
  ];
  const mappedCourses = await getCoursesByCodes(mappedCourseCodes);

  return (
    <PageShell eyebrow={program.type} title={program.name} description={program.overview}>
      <div className="mb-6 flex flex-wrap gap-3">
        {program.degreeLabel ? <Badge>{program.degreeLabel}</Badge> : null}
        {program.departmentName ? <Badge tone="official">{program.departmentName}</Badge> : null}
        {program.sourceConfidence ? <Badge tone="official">Confidence {program.sourceConfidence}</Badge> : null}
        {program.parserStatus ? <Badge>{program.parserStatus}</Badge> : null}
        {program.unitMinimum ? <Badge>{program.unitMinimum} units minimum</Badge> : null}
      </div>

      {program.sourceUrl ? (
        <div className="mb-8 rounded-[1.75rem] border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] p-5 text-sm text-[#2f4f4c]">
          Official catalog:{" "}
          <a href={program.sourceUrl} className="font-semibold text-[#1d6b6d] underline" target="_blank" rel="noreferrer">
            {program.sourceUrl}
          </a>
        </div>
      ) : null}

      {showAuditBanner ? (
        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-[#19212f]">Official advising snapshot</h2>
              <Badge tone="official">Fallback</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#4b5668]">{showAuditBanner.sourceBackedSummary}</p>
          </div>
          <div className="rounded-[1.75rem] border border-[rgba(201,111,74,0.25)] bg-[rgba(201,111,74,0.08)] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#6f4038]">Advising guardrails</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[#6f4038]">
              {showAuditBanner.unitAndOverlapRules.map((rule) => (
                <p key={rule}>{rule}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ProgramDetailTabs program={program} mappedCourses={mappedCourses} audit={audit} />
    </PageShell>
  );
}
