import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  CalendarClock,
  GitCompare,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Map,
  Sparkles,
  Users
} from "lucide-react";
import { Badge } from "@/components/badge";
import { StatCard } from "@/components/stat-card";
import { navGroups } from "@/lib/navigation";
import { getPrograms, getRecommendationPreview } from "@/lib/repositories";

const quickPaths: Array<{
  href: Route;
  label: string;
  description: string;
  icon: typeof LibraryBig;
  tone: string;
}> = [
  {
    href: "/courses",
    label: "Find a course",
    description: "Search classes with enrollment and requirement context.",
    icon: LibraryBig,
    tone: "from-[rgba(36,48,71,0.95)] to-[rgba(29,107,109,0.88)]"
  },
  {
    href: "/planner",
    label: "Build your plan",
    description: "Map semesters, units, and graduation progress.",
    icon: Map,
    tone: "from-[rgba(29,107,109,0.92)] to-[rgba(36,48,71,0.9)]"
  },
  {
    href: "/dashboard",
    label: "Open dashboard",
    description: "See recommendations, favorites, and program progress.",
    icon: LayoutDashboard,
    tone: "from-[rgba(201,111,74,0.92)] to-[rgba(138,63,32,0.9)]"
  }
];

export default async function HomePage() {
  const programs = await getPrograms();
  const recommendations = await getRecommendationPreview();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="max-w-3xl">
          <Badge tone="official">UC Berkeley first, multi-campus ready</Badge>
          <h1 className="mt-6 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight tracking-[-0.03em] text-[#19212f] md:text-6xl">
            Explore classes, plan your degree, and stay on track to graduate.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#4b5668]">
            CourseMap combines course discovery, official major requirements, enrollment signals, and
            semester planning in one place built for students.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f]"
            >
              Explore courses
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(39,50,71,0.16)] bg-[rgba(255,252,246,0.9)] px-5 py-3 text-sm font-semibold text-[#243047] transition hover:border-[rgba(39,50,71,0.28)]"
            >
              Open planner
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.84)] p-6 shadow-[0_28px_90px_rgba(60,55,48,0.1)]">
          <div className="grid gap-4">
            <div className="rounded-3xl bg-[#243047] p-6 text-white">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                <p className="font-semibold">Suggested for you</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Based on requirements, prerequisites, term fit, and enrollment risk.
              </p>
              <div className="mt-5 space-y-3">
                {recommendations.slice(0, 2).map((item) => (
                  <div key={item.courseCode} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">{item.courseCode}</p>
                    <p className="mt-1 text-sm text-white/80">{item.title}</p>
                    <p className="mt-2 text-xs text-white/60">Score {item.score}</p>
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className="mt-5 inline-flex text-sm font-medium text-white/90 underline-offset-4 hover:underline">
                View full dashboard
              </Link>
            </div>
            <HomeStats programsCount={programs.length} />
          </div>
        </div>
      </section>

      <section className="mt-14">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8a3f20]">Start here</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {quickPaths.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.href}
                href={path.href}
                className={`group rounded-[1.75rem] bg-gradient-to-br ${path.tone} p-6 text-white shadow-[0_20px_60px_rgba(36,48,71,0.16)] transition hover:-translate-y-0.5`}
              >
                <Icon className="h-6 w-6 opacity-90" />
                <h2 className="mt-4 text-xl font-semibold">{path.label}</h2>
                <p className="mt-2 text-sm leading-6 text-white/80">{path.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white/90">
                  Go
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8a3f20]">Everything in one app</p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {navGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_18px_55px_rgba(60,55,48,0.07)]"
            >
              <h2 className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">
                {group.label}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="group flex items-start gap-3 rounded-xl p-2 transition hover:bg-[rgba(36,48,71,0.05)]">
                      <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8a3f20]" />
                      <span>
                        <span className="block text-sm font-semibold text-[#243047] group-hover:text-[#19212f]">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-[#6a7383]">{item.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <FeatureCard
          icon={LibraryBig}
          title="Course discovery"
          description="Browse past, current, and projected offerings with clearer filters."
          href="/courses"
        />
        <FeatureCard
          icon={GraduationCap}
          title="Requirement planning"
          description="Official major and minor rules with source links and review status."
          href="/programs"
        />
        <FeatureCard
          icon={CalendarClock}
          title="Enrollment intelligence"
          description="See fill risk, phase pressure, and reserved-seat context."
          href="/terms"
        />
        <FeatureCard
          icon={GitCompare}
          title="Compare and collaborate"
          description="Evaluate classes side by side and share plans with friends."
          href="/compare"
        />
      </section>
    </div>
  );
}

function HomeStats({ programsCount }: { programsCount: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Programs seeded"
        value={String(programsCount)}
        detail="Majors and minors with source-backed requirement metadata."
      />
      <StatCard label="Planning modes" value="4-year + term" detail="Semester columns, prerequisite warnings, and requirement fit." />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  href
}: {
  icon: typeof Users;
  title: string;
  description: string;
  href: Route;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(39,50,71,0.2)]"
    >
      <Icon className="h-6 w-6 text-[#1d6b6d]" />
      <h2 className="mt-4 text-xl font-semibold text-[#19212f]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#4b5668]">{description}</p>
    </Link>
  );
}
