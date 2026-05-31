import { redirect } from "next/navigation";
import { Badge } from "@/components/badge";
import { BerkeleyDataImportForm } from "@/components/berkeley-data-import-form";
import { BerkeleyParseForm } from "@/components/berkeley-parse-form";
import { CommunityEvidenceImportForm } from "@/components/community-evidence-import-form";
import { CommunityModerationReports } from "@/components/community-moderation-reports";
import { ImportPreviewForm } from "@/components/import-preview-form";
import { RmpSyncForm } from "@/components/rmp-sync-form";
import { PageShell } from "@/components/page-shell";
import { previewBerkeleyFullCourseImport } from "@/lib/berkeley-importer";
import { getPrograms } from "@/lib/repositories";
import { requireAdminPage } from "@/lib/auth/admin";

const adminNoticeClass =
  "mb-6 rounded-[1.75rem] border p-5 text-sm leading-6 shadow-sm";

export default async function AdminImportsPage() {
  const gate = await requireAdminPage();
  if ("redirect" in gate && gate.redirect) {
    redirect(gate.redirect);
  }

  const programs = await getPrograms();
  const berkeleyImport = previewBerkeleyFullCourseImport();

  return (
    <PageShell
      eyebrow="Admin"
      title="Requirement import review"
      description="Internal tooling entry point for syncing official requirement pages, reviewing parser output, tracking confidence, and correcting normalization mistakes."
    >
      <div className={`${adminNoticeClass} border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] text-[#2f4f4c]`}>
        API preview endpoint available at <code className="text-[#1d6b6d]">/api/admin/imports/preview</code>. Send a POST body with{" "}
        <code className="text-[#1d6b6d]">{`{ "sourceUrl": "...", "html": "<html>..." }`}</code> to test importer resolution before publishing requirement data.
      </div>
      <div className={`${adminNoticeClass} border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] text-[#2f4f4c]`}>
        Berkeley official course import preview available at <code className="text-[#1d6b6d]">/api/admin/berkeley/import-preview</code>. This uses official Berkeley sources only: the current UC Berkeley Undergraduate Catalog for course definitions and{" "}
        <code className="text-[#1d6b6d]">classes.berkeley.edu</code> for term-level offerings.
      </div>
      <div className={`${adminNoticeClass} border-[rgba(201,111,74,0.25)] bg-[rgba(201,111,74,0.08)] text-[#6f4038]`}>
        Full Berkeley coverage plan: crawl the official catalog index to normalize the complete Berkeley course inventory, then join it with official schedule snapshots from{" "}
        <code className="text-[#8a3f20]">classes.berkeley.edu</code> so every section, term, and enrollment state stays traceable to an official source. Any future-term prediction remains labeled as projected until the official schedule confirms it.
      </div>
      <div className={`${adminNoticeClass} border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] text-[#4b5668]`}>
        The Berkeley parser sandbox shows draft normalized import candidates inferred from official catalog HTML. Review bulk course imports before they become seeded or live records.
      </div>
      <div className={`${adminNoticeClass} border-[rgba(201,111,74,0.2)] bg-[rgba(201,111,74,0.06)] text-[#6f4038]`}>
        Live Berkeley detail pages are syncable directly from the public catalog. Coverage reporting is surfaced here explicitly when catalog enumeration endpoints are unavailable from this environment.
      </div>

      <div className="mb-6">
        <ImportPreviewForm />
      </div>
      <div className="mb-6">
        <BerkeleyParseForm />
      </div>
      <div className="mb-6">
        <BerkeleyDataImportForm />
      </div>
      <div className="mb-6">
        <CommunityEvidenceImportForm />
      </div>
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <RmpSyncForm />
        <CommunityModerationReports />
      </div>

      <div className="mb-6 rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#19212f]">Berkeley official import plan</h2>
        <p className="mt-2 text-sm leading-6 text-[#4b5668]">{berkeleyImport.nextStep}</p>
        <div className="mt-4 grid gap-4">
          {berkeleyImport.officialSources.map((job) => (
            <div key={job.sourceUrl} className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-[#19212f]">{job.sourceType.toUpperCase()}</p>
                <Badge tone="official">{job.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-[#4b5668]">{job.notes}</p>
              <p className="mt-2 text-xs text-[#6a7383]">{job.sourceUrl}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5">
        {programs.map((program) => (
          <div key={program.id} className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#19212f]">{program.name}</h2>
                <p className="text-sm text-[#6a7383]">{program.type}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {program.parserStatus ? <Badge>{program.parserStatus}</Badge> : null}
                {program.sourceConfidence ? <Badge tone="official">{program.sourceConfidence}</Badge> : null}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#4b5668]">{program.overview}</p>
            {program.sourceUrl ? (
              <p className="mt-4 text-sm text-[#6a7383]">
                Source:{" "}
                <a href={program.sourceUrl} className="font-medium text-[#1d6b6d] underline" target="_blank" rel="noreferrer">
                  {program.sourceUrl}
                </a>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
