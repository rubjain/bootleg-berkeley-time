"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function PlanCreator() {
  const router = useRouter();
  const [title, setTitle] = useState("New Academic Plan");
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#19212f]">Create another plan version</h2>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#19212f] outline-none focus:border-[#2f6f6a] focus:ring-2 focus:ring-[rgba(47,111,106,0.15)]"
        />
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await fetch("/api/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
              });
              router.refresh();
            })
          }
          className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f]"
          disabled={pending}
        >
          {pending ? "Creating..." : "Create plan"}
        </button>
      </div>
    </div>
  );
}
