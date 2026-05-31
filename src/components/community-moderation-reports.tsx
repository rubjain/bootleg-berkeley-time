import { CommunityModerationReportActions } from "@/components/community-moderation-report-actions";
import { listCommunityReports } from "@/lib/community-moderation";

export async function CommunityModerationReports() {
  const reports = await listCommunityReports();

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#19212f]">Community moderation queue</h2>
      <p className="mt-2 text-sm leading-6 text-[#6a7383]">
        Reports are stored in PostgreSQL when a signed-in user submits them. Resolve or dismiss items from this admin queue.
      </p>

      {reports.length ? (
        <ul className="mt-5 space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="rounded-2xl border border-[rgba(39,50,71,0.08)] bg-white p-4 text-sm text-[#4b5668]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#19212f]">
                    {report.targetType} · {report.authorName}
                  </p>
                  <p className="mt-1 text-xs text-[#6a7383]">
                    {report.courseSlug ? `Course ${report.courseSlug}` : "No course"} · {report.targetId}
                    {report.reporterEmail ? ` · filed by ${report.reporterEmail}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(36,48,71,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#314056]">
                  {report.status}
                </span>
              </div>
              <p className="mt-2 leading-6">{report.reason}</p>
              <p className="mt-2 text-xs text-[#9aa3b2]">{new Date(report.createdAt).toLocaleString()}</p>
              <CommunityModerationReportActions reportId={report.id} status={report.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-[#6a7383]">
          No reports yet. Sign in and use the ··· menu on a course review or discussion post to submit one.
        </p>
      )}
    </div>
  );
}
