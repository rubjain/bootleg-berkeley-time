import { PageShell } from "@/components/page-shell";
import { SocialDashboard } from "@/components/social-dashboard";
import { getSocialDashboard } from "@/lib/social-service";

export default async function MessagesPage() {
  const social = await getSocialDashboard();

  return (
    <PageShell
      eyebrow="Messages"
      title="Direct messages and shared course ideas"
      description="First-version messaging stays lightweight and safe: text-only, friend-centric, and designed for future reporting/blocking support."
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-900">
          Share course links, professor suggestions, and plan snapshots with friends. Reporting, blocking, and moderation hooks stay isolated from the academic planning models so safety features can scale later.
        </div>
        <SocialDashboard social={social} mode="messages" />
      </div>
    </PageShell>
  );
}
