import Link from "next/link";
import { getActiveSchool } from "@/lib/school-context";

export async function CampusBadge() {
  const school = await getActiveSchool();
  if (!school) return null;

  return (
    <Link
      href="/schools"
      className="hidden items-center gap-2 rounded-full border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] px-3 py-1.5 text-xs font-medium text-[#314056] transition hover:border-[rgba(47,111,106,0.35)] hover:text-[#2f6f6a] md:flex"
      title={`Campus: ${school.name}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#2f6f6a]" />
      {school.shortName}
    </Link>
  );
}
