import Link from "next/link";
import { Map, Search } from "lucide-react";
import { CampusBadge } from "@/components/campus-badge";
import { MainNav } from "@/components/main-nav";
import { UserMenu } from "@/components/user-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(39,50,71,0.1)] bg-[rgba(247,240,230,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <BrandBlock />
        </Link>

        <MainNav />

        <HeaderActions />
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.15rem] bg-[#243047] text-white shadow-[0_18px_36px_rgba(36,48,71,0.18)] sm:h-11 sm:w-11">
      <Map className="h-5 w-5" />
    </div>
  );
}

function BrandBlock() {
  return (
    <div className="min-w-0">
      <div className="truncate font-['Iowan_Old_Style','Palatino_Linotype',serif] text-lg tracking-[-0.03em] text-[#19212f] sm:text-xl">
        CourseMap
      </div>
      <div className="hidden text-[0.68rem] uppercase tracking-[0.22em] text-[#7a6d61] sm:block">
        Smarter academic planning
      </div>
    </div>
  );
}

function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <CampusBadge />
      <Link
        href="/courses"
        className="hidden items-center gap-2 rounded-full border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] px-4 py-2 text-sm font-medium text-[#314056] transition hover:border-[rgba(39,50,71,0.2)] hover:text-[#19212f] sm:flex"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search courses</span>
      </Link>
      <UserMenu />
    </div>
  );
}