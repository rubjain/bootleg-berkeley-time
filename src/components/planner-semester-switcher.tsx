"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PlannerSemesterOption } from "@/lib/planner-schedule";
import { cn } from "@/lib/utils";

type PlannerSemesterSwitcherProps = {
  semesters: PlannerSemesterOption[];
};

export function PlannerSemesterSwitcher({ semesters }: PlannerSemesterSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSemesterId = searchParams.get("semesterId") ?? semesters[0]?.id;

  if (semesters.length <= 1) {
    const only = semesters[0];
    if (!only) return null;
    return (
      <p className="text-sm text-[#6a7383]">
        {only.label}
        {only.termLabel ? ` · ${only.termLabel}` : ""} · {only.courseCount} course{only.courseCount === 1 ? "" : "s"}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {semesters.map((semester) => {
        const active = semester.id === activeSemesterId;
        return (
          <button
            key={semester.id}
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("semesterId", semester.id);
              router.push(`/planner?${params.toString()}`);
            }}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[#2f6f6a] text-white"
                : "border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] text-[#314056] hover:border-[rgba(39,50,71,0.2)]"
            )}
          >
            {semester.label}
            <span className={cn("ml-1.5", active ? "text-white/80" : "text-[#6a7383]")}>
              ({semester.courseCount})
            </span>
          </button>
        );
      })}
    </div>
  );
}
