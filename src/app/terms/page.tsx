import Link from "next/link";
import { Badge } from "@/components/badge";
import { PageShell } from "@/components/page-shell";
import { getTerms } from "@/lib/repositories";

export default async function TermsPage() {
  const terms = await getTerms();

  return (
    <PageShell
      eyebrow="Terms"
      title="Browse semester offerings"
      description="See past and future terms, then drill into a semester-level catalog view. Projected terms are clearly marked so students can separate likely patterns from official schedules."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {terms.map((term) => (
          <Link
            key={term.id}
            href={`/terms/${term.slug}`}
            className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(39,50,71,0.2)] hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-[#19212f]">{term.name}</h2>
                <p className="mt-2 text-sm text-[#6a7383]">{term.offeringCount} sampled offerings</p>
              </div>
              <Badge tone={term.isProjected ? "projected" : "official"}>
                {term.isProjected ? "Projected" : "Official"}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
