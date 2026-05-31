"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavLinkActive, planPaths } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const planTabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planner", label: "Planner" },
  { href: "/compare", label: "Compare" },
  { href: "/profile", label: "Profile" }
] as const;

export function PlanSubnav() {
  const pathname = usePathname();
  const isPlanSection = planPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isPlanSection) {
    return null;
  }

  return (
    <nav aria-label="My plan sections" className="border-b border-[rgba(39,50,71,0.08)] bg-[rgba(255,252,246,0.55)]">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {planTabs.map((tab) => {
          const active = isNavLinkActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-[#243047] text-white"
                  : "text-[#5a6273] hover:bg-[rgba(36,48,71,0.06)] hover:text-[#19212f]"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
