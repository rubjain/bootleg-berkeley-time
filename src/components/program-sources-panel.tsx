import { Badge } from "@/components/badge";
import type { ProgramRequirementSource } from "@/lib/types";

type ProgramSourcesPanelProps = {
  sources: ProgramRequirementSource[];
};

export function ProgramSourcesPanel({ sources }: ProgramSourcesPanelProps) {
  if (!sources.length) {
    return (
      <p className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 text-sm text-[#6a7383]">
        No requirement sources are linked yet. Run a Berkeley catalog sync to import official program pages.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <div
          key={source.id}
          className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="official">{source.sourceType.replace(/_/g, " ")}</Badge>
            <Badge>{source.parserStatus}</Badge>
            <Badge>Confidence {source.confidence}</Badge>
            {source.parserKey ? <Badge>{source.parserKey}</Badge> : null}
          </div>
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-sm font-semibold text-[#1d6b6d] underline"
          >
            {source.sourceUrl}
          </a>
          {source.notes ? <p className="mt-2 text-sm leading-6 text-[#4b5668]">{source.notes}</p> : null}
          {source.lastSyncedAt ? (
            <p className="mt-2 text-xs text-[#6a7383]">Last synced {new Date(source.lastSyncedAt).toLocaleString()}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
