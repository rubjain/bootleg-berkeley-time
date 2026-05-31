import { Badge } from "@/components/badge";
import { FriendRequestButtons, MessageComposer } from "@/components/social-actions";
import { SocialDashboardView } from "@/lib/types";

export function SocialDashboard({
  social,
  mode = "all"
}: {
  social: SocialDashboardView;
  mode?: "all" | "friends" | "messages";
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      {mode !== "messages" ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_20px_60px_rgba(60,55,48,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a3f20]">Friends</p>
                <h2 className="mt-2 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">Who you can actually plan with</h2>
              </div>
              <Badge>{social.friends.length} active</Badge>
            </div>
            <div className="mt-4 grid gap-3">
              {social.friends.map((friend) => (
                <div key={friend.id} className="rounded-[1.6rem] border border-[rgba(39,50,71,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,236,0.9))] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.02em] text-[#19212f]">{friend.name}</p>
                      <p className="text-sm text-[#586275]">{friend.school}</p>
                    </div>
                    <span className="rounded-full bg-[#243047] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white">
                      classmate
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {friend.majors.map((major) => (
                      <Badge key={major}>{major}</Badge>
                    ))}
                    {friend.minors.map((minor) => (
                      <Badge key={minor}>{minor} minor</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#5f6673]">
                    {friend.visiblePlanTitles.map((plan) => (
                      <span key={plan} className="rounded-full border border-[rgba(39,50,71,0.08)] bg-white/80 px-3 py-1">
                        Plan: {plan}
                      </span>
                    ))}
                    {friend.visibleScheduleLabels.map((schedule) => (
                      <span key={schedule} className="rounded-full border border-[rgba(39,50,71,0.08)] bg-white/80 px-3 py-1">
                        Schedule: {schedule}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_20px_60px_rgba(60,55,48,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a3f20]">Requests</p>
                <h2 className="mt-2 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">Pending intros and replies</h2>
              </div>
              <Badge tone="projected">{social.incomingRequests.length + social.outgoingRequests.length} open</Badge>
            </div>
            <div className="mt-4 space-y-4">
              {social.incomingRequests.map((request) => (
                <div key={request.id} className="rounded-[1.6rem] border border-[rgba(39,50,71,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,244,236,0.9))] p-4">
                  <p className="text-lg font-semibold tracking-[-0.02em] text-[#19212f]">{request.fromUser.name}</p>
                  <p className="mt-1 text-sm leading-6 text-[#586275]">{request.message ?? "No message"}</p>
                  <div className="mt-3">
                    <FriendRequestButtons requestId={request.id} />
                  </div>
                </div>
              ))}
              {social.outgoingRequests.map((request) => (
                <div key={request.id} className="rounded-[1.6rem] border border-[rgba(39,50,71,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,244,236,0.9))] p-4">
                  <p className="text-lg font-semibold tracking-[-0.02em] text-[#19212f]">Pending: {request.toUser.name}</p>
                  <p className="mt-1 text-sm leading-6 text-[#586275]">{request.message ?? "No message"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_20px_60px_rgba(60,55,48,0.08)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a3f20]">Network</p>
          <h2 className="mt-2 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">People in your network</h2>
          <div className="mt-4 grid gap-3">
            {social.friends.map((friend) => (
              <div key={friend.id} className="rounded-[1.6rem] border border-[rgba(39,50,71,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,236,0.9))] p-4">
                <p className="text-lg font-semibold tracking-[-0.02em] text-[#19212f]">{friend.name}</p>
                <p className="text-sm text-[#586275]">{friend.school}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {friend.majors.map((major) => (
                    <Badge key={major}>{major}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_20px_60px_rgba(60,55,48,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a3f20]">Messages</p>
            <h2 className="mt-2 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">Planning conversations</h2>
          </div>
          <Badge tone="success">{social.threads.length} threads</Badge>
        </div>
        <div className="mt-4 space-y-4">
          {social.threads.map((thread) => (
            <div key={thread.id} className="rounded-[1.8rem] border border-[rgba(39,50,71,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,235,0.92))] p-4">
              <p className="text-lg font-semibold tracking-[-0.02em] text-[#19212f]">{thread.title}</p>
              <p className="mt-1 text-sm text-[#6a6f79]">{thread.participantNames.join(", ")}</p>
              <div className="mt-4 space-y-3">
                {thread.messages.map((message) => (
                  <div key={message.id} className="rounded-[1.4rem] border border-[rgba(39,50,71,0.08)] bg-white/90 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#19212f]">{message.senderName}</p>
                    <p className="mt-2 text-sm leading-6 text-[#4e586b]">{message.body}</p>
                    {message.sharedCourseCode ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1d6b6d]">Shared course: {message.sharedCourseCode}</p> : null}
                    {message.sharedPlanTitle ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1d6b6d]">Shared plan: {message.sharedPlanTitle}</p> : null}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <MessageComposer threadId={thread.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
