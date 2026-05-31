"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PlanDetailView } from "@/lib/types";
import { cn } from "@/lib/utils";

type PlanSwitcherProps = {
  plans: PlanDetailView[];
};

export function PlanSwitcher({ plans }: PlanSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activePlanId = searchParams.get("planId") ?? plans[0]?.id;

  if (plans.length <= 1) {
    return (
      <p className="text-sm text-[#6a7383]">
        {plans[0]?.title ?? "No plan yet"} · {plans[0]?.semesters.length ?? 0} semesters
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {plans.map((plan) => {
        const active = plan.id === activePlanId;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("planId", plan.id);
              router.push(`/planner?${params.toString()}`);
            }}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[#243047] text-white"
                : "border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] text-[#314056] hover:border-[rgba(39,50,71,0.2)]"
            )}
          >
            {plan.title}
          </button>
        );
      })}
      <Link href="/dashboard" className="self-center text-sm font-medium text-[#1d6b6d] underline-offset-2 hover:underline">
        View dashboard
      </Link>
    </div>
  );
}
