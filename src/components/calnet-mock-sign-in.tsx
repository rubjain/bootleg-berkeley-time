"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DEMO_ACCOUNTS } from "@/lib/auth/session-constants";
import { cn } from "@/lib/utils";

export function CalNetMockSignIn() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function signIn(email: string) {
    startTransition(() => {
      const ticket = `mock:${email}`;
      router.push(`/api/auth/calnet/callback?ticket=${encodeURIComponent(ticket)}`);
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2f6f6a]">Mock CalNet</p>
      <h2 className="mt-2 text-xl font-semibold text-[#19212f]">Select a Berkeley identity</h2>
      <p className="mt-2 text-sm text-[#6a7383]">CourseMap will issue a preview CAS ticket and complete the callback handshake.</p>
      <div className="mt-5 space-y-3">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            disabled={pending}
            onClick={() => signIn(account.email)}
            className={cn(
              "flex w-full flex-col rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white px-4 py-4 text-left transition",
              "hover:border-[rgba(47,111,106,0.35)] disabled:opacity-60"
            )}
          >
            <span className="font-semibold text-[#19212f]">{account.name}</span>
            <span className="mt-1 text-sm text-[#6a7383]">{account.email}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
