import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { PageShell } from "@/components/page-shell";
import { TermOfferingsExplorer } from "@/components/term-offerings-explorer";
import { getTermByIdOrSlug } from "@/lib/repositories";

export default async function TermDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const term = await getTermByIdOrSlug(id);

  if (!term) notFound();

  const withSchedule = term.offerings.filter((offering) => offering.meetingDays && offering.timeStart).length;

  return (
    <PageShell
      eyebrow="Semester offerings"
      title={term.name}
      description="Browse this term's classes with meeting times and enrollment signals, open full course pages, and add courses directly to your graduation plan."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Badge tone={term.isProjected ? "projected" : "official"}>{term.isProjected ? "Projected term" : "Official term"}</Badge>
          <Badge>{term.season}</Badge>
          <Badge>{String(term.year)}</Badge>
          <Badge>{term.offerings.length} offerings</Badge>
          {withSchedule ? <Badge tone="official">{withSchedule} with schedule data</Badge> : null}
        </div>
        <Link href="/terms" className="text-sm font-medium text-[#1d6b6d] underline-offset-2 hover:underline">
          All terms
        </Link>
      </div>

      <TermOfferingsExplorer termId={term.id} offerings={term.offerings} />
    </PageShell>
  );
}
