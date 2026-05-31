"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function CommunityModerationReportActions({
  reportId,
  status
}: {
  reportId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function updateStatus(nextStatus: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      await fetch("/api/admin/moderation/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: nextStatus })
      });
      router.refresh();
    });
  }

  if (status === "RESOLVED" || status === "DISMISSED") {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {status === "OPEN" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => updateStatus("UNDER_REVIEW")}
          className="rounded-full border border-[rgba(39,50,71,0.12)] px-3 py-1 text-xs font-medium text-[#314056] hover:bg-[rgba(36,48,71,0.05)] disabled:opacity-60"
        >
          Mark under review
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => updateStatus("RESOLVED")}
        className="rounded-full bg-[rgba(47,111,106,0.12)] px-3 py-1 text-xs font-medium text-[#2f6f6a] hover:bg-[rgba(47,111,106,0.2)] disabled:opacity-60"
      >
        Resolve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => updateStatus("DISMISSED")}
        className="rounded-full bg-[rgba(36,48,71,0.06)] px-3 py-1 text-xs font-medium text-[#6a7383] hover:bg-[rgba(36,48,71,0.1)] disabled:opacity-60"
      >
        Dismiss
      </button>
    </div>
  );
}
