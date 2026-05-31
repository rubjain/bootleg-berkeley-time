import { PageShell } from "@/components/page-shell";
import { SchoolSwitcher } from "@/components/school-switcher";
import { getActiveSchoolSlug } from "@/lib/school-context";
import { getSchools } from "@/lib/repositories";

export default async function SchoolsPage() {
  const [schools, activeSlug] = await Promise.all([getSchools(), getActiveSchoolSlug()]);

  return (
    <PageShell
      eyebrow="Schools"
      title="Choose a campus"
      description="Your campus selection is saved in a cookie and shown in the header. UC Berkeley is the fully seeded MVP; additional schools reuse the same data model."
    >
      <SchoolSwitcher schools={schools} activeSlug={activeSlug} />
    </PageShell>
  );
}
