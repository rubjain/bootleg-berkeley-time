"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CommunityModerationMenuProps = {
  targetType: "review" | "discussion" | "comment";
  targetId: string;
  authorName: string;
  courseSlug?: string;
};

export function CommunityModerationMenu({
  targetType,
  targetId,
  authorName,
  courseSlug
}: CommunityModerationMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(action: "report" | "block") {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/social/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          targetType,
          targetId,
          authorName,
          courseSlug,
          reason: reason.trim() || (action === "block" ? `Block ${authorName}` : "Community policy concern")
        })
      });

      if (!response.ok) {
        setMessage("Action failed. Try again.");
        return;
      }

      setMessage(action === "block" ? `Blocked ${authorName} on this device.` : "Report submitted for admin review.");
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full px-3 py-1 text-xs font-medium text-[#6a7383] transition hover:bg-[rgba(36,48,71,0.06)] hover:text-[#19212f]"
        aria-expanded={open}
      >
        ···
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-64 rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white p-3 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7383]">Safety</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional reason (harassment, spam, etc.)"
            className="mt-2 min-h-[72px] w-full rounded-xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.6)] px-3 py-2 text-xs text-[#19212f] outline-none focus:border-[#2f6f6a]"
          />
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("report")}
              className="rounded-xl bg-[rgba(36,48,71,0.06)] px-3 py-2 text-xs font-semibold text-[#314056] hover:bg-[rgba(36,48,71,0.1)] disabled:opacity-60"
            >
              Report content
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("block")}
              className="rounded-xl bg-[rgba(180,74,58,0.1)] px-3 py-2 text-xs font-semibold text-[#8b3d32] hover:bg-[rgba(180,74,58,0.16)] disabled:opacity-60"
            >
              Block {authorName}
            </button>
          </div>
        </div>
      ) : null}
      {message ? <p className="mt-1 text-xs text-[#2f6f6a]">{message}</p> : null}
    </div>
  );
}
