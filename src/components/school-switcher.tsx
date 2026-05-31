"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/badge";
import type { SchoolSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type SchoolSwitcherProps = {
  schools: SchoolSummary[];
  activeSlug: string;
};

export function SchoolSwitcher({ schools, activeSlug }: SchoolSwitcherProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function selectSchool(slug: string, isActive: boolean) {
    if (!isActive) {
      setMessage("That campus is coming soon. Berkeley is fully seeded today.");
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/schools/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setMessage(payload?.error ?? "Could not switch campus");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2">
        {schools.map((school) => {
          const active = school.slug === activeSlug;
          return (
            <button
              key={school.id}
              type="button"
              disabled={pending}
              onClick={() => selectSchool(school.slug, school.isActive)}
              className={cn(
                "rounded-[1.75rem] border p-6 text-left shadow-sm transition disabled:opacity-70",
                active
                  ? "border-[rgba(47,111,106,0.35)] bg-[rgba(47,111,106,0.08)]"
                  : "border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] hover:border-[rgba(39,50,71,0.22)]"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[#19212f]">{school.shortName}</h2>
                  <p className="mt-2 text-sm text-[#6a7383]">{school.name}</p>
                </div>
                <Badge tone={school.isActive ? "official" : "projected"}>
                  {school.isActive ? (active ? "Selected" : "Active") : "Coming soon"}
                </Badge>
              </div>
              <p className="mt-4 text-sm text-[#6a7383]">
                {[school.city, school.state].filter(Boolean).join(", ") || "Location TBA"}
              </p>
            </button>
          );
        })}
      </div>
      {message ? <p className="text-sm text-[#8b3d32]">{message}</p> : null}
    </div>
  );
}
