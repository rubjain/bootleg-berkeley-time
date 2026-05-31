import { PageShell } from "@/components/page-shell";
import { FriendRequestComposer } from "@/components/social-actions";
import { SocialDashboard } from "@/components/social-dashboard";
import { getSocialDashboard, getSuggestedFriendProfiles } from "@/lib/social-service";

export default async function FriendsPage() {
  const social = await getSocialDashboard();
  const suggestions = await getSuggestedFriendProfiles();
  const visibleConnections = social.friends.length;
  const activeThreads = social.threads.length;
  const pendingRequests = social.incomingRequests.length + social.outgoingRequests.length;

  return (
    <PageShell
      eyebrow="Friends"
      title="Find friends and share planning context"
      description="The social layer is modular: friends, visibility-aware profile sharing, and class recommendation workflows sit on top of the planning product without changing the core requirement engine."
    >
      <div className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[linear-gradient(135deg,rgba(36,48,71,0.97),rgba(23,85,89,0.95)_58%,rgba(201,111,74,0.86))] p-7 text-white shadow-[0_28px_90px_rgba(36,48,71,0.22)]">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-white/70">Network snapshot</p>
          <div className="mt-4 max-w-2xl">
            <h2 className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-3xl tracking-[-0.03em] md:text-4xl">
              Built for real classmates, not placeholder communities.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/78 md:text-base">
              Compare course plans, trade survival notes, and keep visibility controls obvious enough that sharing still feels intentional.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { label: "Visible friends", value: visibleConnections, tone: "text-[#19212f]" },
            { label: "Open threads", value: activeThreads, tone: "text-[#1d6b6d]" },
            { label: "Pending requests", value: pendingRequests, tone: "text-[#8a3f20]" }
          ].map((item) => (
            <div key={item.label} className="rounded-[1.7rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-[0_18px_48px_rgba(60,55,48,0.08)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7a6d61]">{item.label}</p>
              <p className={`mt-3 text-4xl font-semibold tracking-[-0.04em] ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SocialDashboard social={social} mode="friends" />
        <div className="space-y-6">
          <FriendRequestComposer suggestions={suggestions} />
          <div className="rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_20px_60px_rgba(60,55,48,0.08)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a3f20]">Privacy controls</p>
            <h2 className="mt-3 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">
              Sharing should feel chosen, not ambient.
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#556071]">
              <p>Plans, weekly schedules, and program details should remain private by default and become friend-visible only when a user opts in.</p>
              <p>Messaging permissions, visible majors/minors, and shared plan versions are all modeled separately so social features stay secondary to the planning core.</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
