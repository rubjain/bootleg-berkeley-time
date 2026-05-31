"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveGroupId, isNavLinkActive, navGroups, type NavGroup, type NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();
  return <MainNavBody pathname={pathname} key={pathname} />;
}

function MainNavBody({ pathname }: { pathname: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
        {navGroups.map((group) => (
          <DesktopNavGroup
            key={group.id}
            group={group}
            pathname={pathname}
            isActive={getActiveGroupId(pathname) === group.id}
          />
        ))}
      </nav>

      <MobileControls mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {mobileOpen ? <MobileNavPanel pathname={pathname} onClose={() => setMobileOpen(false)} /> : null}
    </>
  );
}

function MobileControls({
  mobileOpen,
  setMobileOpen
}: {
  mobileOpen: boolean;
  setMobileOpen: (value: boolean | ((open: boolean) => boolean)) => void;
}) {
  return (
    <div className="flex items-center gap-2 lg:hidden">
      <Link
        href="/courses"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] text-[#314056]"
        aria-label="Search courses"
      >
        <Search className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] text-[#314056]"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>
  );
}

function DesktopNavGroup({
  group,
  pathname,
  isActive
}: {
  group: NavGroup;
  pathname: string;
  isActive: boolean;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition",
          isActive
            ? "bg-[rgba(36,48,71,0.1)] text-[#19212f]"
            : "text-[#5a6273] hover:bg-[rgba(36,48,71,0.06)] hover:text-[#19212f]"
        )}
      >
        {group.label}
        <ChevronDown className="h-3.5 w-3.5 opacity-60 transition group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>

      <div className="pointer-events-none invisible absolute left-0 top-[calc(100%+0.5rem)] z-30 w-72 translate-y-1 opacity-0 transition group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-[1.35rem] border border-[rgba(39,50,71,0.12)] bg-[#fffdf8] p-2 shadow-[0_24px_70px_rgba(36,48,71,0.14)]">
          {group.items.map((item) => (
            <NavMenuLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavMenuLink({
  item,
  pathname,
  onClick
}: {
  item: NavLink;
  pathname: string;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const active = isNavLinkActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-[1rem] px-3 py-3 transition",
        active ? "bg-[rgba(201,111,74,0.12)] text-[#19212f]" : "text-[#4b5668] hover:bg-[rgba(36,48,71,0.05)]"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8a3f20]" />
      <span>
        <span className="block text-sm font-semibold">{item.label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-[#6a7383]">{item.description}</span>
      </span>
    </Link>
  );
}

function MobileNavPanel({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(
    getActiveGroupId(pathname) ?? navGroups[0]?.id ?? null
  );

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(25,33,47,0.42)] backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-[min(100%,22rem)] flex-col border-l border-[rgba(39,50,71,0.12)] bg-[#fffdf8] shadow-[-24px_0_80px_rgba(36,48,71,0.16)]">
        <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7a6d61]">Menu</p>

          {navGroups.map((group) => {
            const expanded = expandedGroup === group.id;
            const isActive = getActiveGroupId(pathname) === group.id;

            return (
              <div key={group.id} className="mb-2">
                <button
                  type="button"
                  onClick={() => setExpandedGroup(expanded ? null : group.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold",
                    isActive ? "bg-[rgba(36,48,71,0.08)] text-[#19212f]" : "text-[#314056]"
                  )}
                >
                  {group.label}
                  <ChevronDown className={cn("h-4 w-4 transition", expanded && "rotate-180")} />
                </button>
                {expanded ? (
                  <div className="mt-1 space-y-1 pl-2">
                    {group.items.map((item) => (
                      <NavMenuLink key={item.href} item={item} pathname={pathname} onClick={onClose} />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="mt-auto space-y-3 border-t border-[rgba(39,50,71,0.1)] pt-5">
            <Link
              href="/login"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-full bg-[#243047] px-4 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
