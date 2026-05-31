import Link from "next/link";
import { Badge } from "@/components/badge";
import { ProgramSummary } from "@/lib/types";

export function ProgramCard({ program }: { program: ProgramSummary }) {
  return (
    <Link
      href={`/programs/${program.slug}`}
      className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(39,50,71,0.2)] hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="official">{program.type}</Badge>
        {program.degreeLabel ? <Badge>{program.degreeLabel}</Badge> : null}
        {program.parserStatus ? <Badge>{program.parserStatus}</Badge> : null}
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#19212f]">{program.name}</h3>
      <p className="mt-3 text-sm leading-6 text-[#4b5668]">{program.overview}</p>
      {program.sourceUrl ? (
        <p className="mt-4 text-xs text-[#6a7383]">Official source linked and versioned for requirement traceability.</p>
      ) : null}
    </Link>
  );
}
