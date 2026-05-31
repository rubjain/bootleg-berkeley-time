import Link from "next/link";
import { navGroups } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[rgba(39,50,71,0.1)] bg-[rgba(255,252,246,0.62)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-xl tracking-[-0.03em] text-[#19212f]">
              CourseMap
            </p>
            <p className="mt-3 text-sm leading-6 text-[#6a6f79]">
              Smarter course planning with official requirements, enrollment context, and semester-by-semester paths.
            </p>
          </div>

          {navGroups.map((group) => (
            <div key={group.id}>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#8a3f20]">{group.label}</p>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#4b5668] transition hover:text-[#19212f]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[rgba(39,50,71,0.08)] pt-6 text-sm text-[#6a6f79] md:flex-row md:items-center md:justify-between">
          <p>UC Berkeley MVP · Multi-campus ready</p>
          <p>Official sources preferred. Projections are always labeled.</p>
        </div>
      </div>
    </footer>
  );
}
