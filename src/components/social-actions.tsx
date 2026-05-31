"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/badge";
import { SocialFriendProfile } from "@/lib/types";

export function FriendRequestComposer({ suggestions }: { suggestions: SocialFriendProfile[] }) {
  const [selectedFriendId, setSelectedFriendId] = useState(suggestions[0]?.id ?? "");
  const [message, setMessage] = useState("Want to compare schedules and course plans.");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_20px_60px_rgba(60,55,48,0.08)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8a3f20]">Outreach</p>
      <h2 className="mt-2 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">Send friend request</h2>
      <p className="mt-3 text-sm leading-6 text-[#586275]">Keep the opener specific enough that it sounds like a real classmate, not an app-generated poke.</p>
      <div className="mt-4 grid gap-3">
        <select
          value={selectedFriendId}
          onChange={(event) => setSelectedFriendId(event.target.value)}
          className="rounded-[1.3rem] border border-[rgba(39,50,71,0.12)] bg-white/80 px-4 py-3 text-sm text-[#243047] outline-none transition focus:border-[#c96f4a]"
        >
          {suggestions.map((friend) => (
            <option key={friend.id} value={friend.id}>
              {friend.name} - {friend.school}
            </option>
          ))}
        </select>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-[96px] rounded-[1.3rem] border border-[rgba(39,50,71,0.12)] bg-white/80 px-4 py-3 text-sm text-[#243047] outline-none transition focus:border-[#c96f4a]"
        />
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              const friend = suggestions.find((item) => item.id === selectedFriendId);
              if (!friend) return;

              await fetch("/api/social/friend-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toUser: friend, message })
              });
              router.refresh();
            })
          }
          className="rounded-[1.3rem] bg-[#243047] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(36,48,71,0.18)] transition hover:bg-[#19212f]"
          disabled={pending}
        >
          {pending ? "Sending..." : "Send request"}
        </button>
      </div>
    </div>
  );
}

export function FriendRequestButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            await fetch("/api/social/friend-requests", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ requestId, action: "accept" })
            });
            router.refresh();
          })
        }
        disabled={pending}
        className="rounded-full"
      >
        <Badge tone="official">{pending ? "Working..." : "Accept"}</Badge>
      </button>
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            await fetch("/api/social/friend-requests", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ requestId, action: "decline" })
            });
            router.refresh();
          })
        }
        disabled={pending}
        className="rounded-full"
      >
        <Badge tone="warning">Decline</Badge>
      </button>
    </div>
  );
}

export function MessageComposer({ threadId }: { threadId: string }) {
  const [body, setBody] = useState("You should check out DATA C100.");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="rounded-[1.8rem] border border-[rgba(39,50,71,0.1)] bg-white/82 p-5 shadow-[0_16px_40px_rgba(60,55,48,0.08)]">
      <h2 className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-xl tracking-[-0.03em] text-[#19212f]">Send a message</h2>
      <div className="mt-4 grid gap-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-[96px] rounded-[1.2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#243047] outline-none transition focus:border-[#c96f4a]"
        />
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await fetch("/api/social/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ threadId, body })
              });
              router.refresh();
            })
          }
          className="rounded-[1.2rem] bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f]"
          disabled={pending}
        >
          {pending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export function ReviewComposer({ courseSlug }: { courseSlug: string }) {
  const [body, setBody] = useState("Helpful course with a fair but real workload.");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#19212f]">Add a review</h2>
      <div className="mt-4 grid gap-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-[110px] rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#19212f] outline-none focus:border-[#2f6f6a] focus:ring-2 focus:ring-[rgba(47,111,106,0.15)]"
        />
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await fetch("/api/social/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  courseSlug,
                  body,
                  difficultyRating: 3,
                  workloadRating: 3,
                  usefulnessRating: 4,
                  recommendationRating: 4,
                  tags: ["MANAGEABLE_WORKLOAD"],
                  reasonTag: "INTERESTING_CLASS",
                  advice: "Start the work early."
                })
              });
              router.refresh();
            })
          }
          className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f]"
          disabled={pending}
        >
          {pending ? "Posting..." : "Post review"}
        </button>
      </div>
    </div>
  );
}

export function DiscussionComposer({ courseSlug }: { courseSlug: string }) {
  const [title, setTitle] = useState("How should I prep for this class?");
  const [body, setBody] = useState("Curious what students would recommend doing before week one.");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#19212f]">Start a discussion</h2>
      <div className="mt-4 grid gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#19212f] outline-none focus:border-[#2f6f6a] focus:ring-2 focus:ring-[rgba(47,111,106,0.15)]"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-[110px] rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#19212f] outline-none focus:border-[#2f6f6a] focus:ring-2 focus:ring-[rgba(47,111,106,0.15)]"
        />
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await fetch("/api/social/discussion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseSlug, title, body })
              });
              router.refresh();
            })
          }
          className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f]"
          disabled={pending}
        >
          {pending ? "Posting..." : "Post discussion"}
        </button>
      </div>
    </div>
  );
}
