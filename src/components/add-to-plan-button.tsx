"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AddToPlanButtonProps = {
  courseId: string;
  termId?: string;
};

export function AddToPlanButton({ courseId, termId }: AddToPlanButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setMessage(null);
            const plansResponse = await fetch("/api/plans");
            if (!plansResponse.ok) {
              setMessage("Sign in and seed the database to use the planner.");
              return;
            }

            const { plans } = (await plansResponse.json()) as {
              plans: Array<{ id: string; semesters: Array<{ id: string }> }>;
            };
            const plan = plans[0];
            const semester = plan?.semesters[0];

            if (!plan || !semester) {
              setMessage("Create a plan first from the planner page.");
              return;
            }

            const response = await fetch(`/api/plans/${plan.id}/courses`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                semesterId: semester.id,
                courseId,
                plannedTermId: termId
              })
            });

            if (!response.ok) {
              setMessage("Could not add course to plan.");
              return;
            }

            setMessage("Added to your plan.");
            router.refresh();
          })
        }
        className="rounded-full bg-[#243047] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#19212f] disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add to plan"}
      </button>
      <Link href="/planner" className="text-sm font-medium text-[#1d6b6d] underline-offset-2 hover:underline">
        Open planner
      </Link>
      {message ? <span className="text-sm text-[#6a7383]">{message}</span> : null}
    </div>
  );
}
