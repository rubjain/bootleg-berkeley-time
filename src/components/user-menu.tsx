"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type SessionState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; email: string; name: string; provider?: string; role?: string };

export function UserMenu() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.signedIn) {
          setSession({
            status: "signed-in",
            email: payload.email,
            name: payload.name,
            provider: payload.provider,
            role: payload.role
          });
        } else {
          setSession({ status: "signed-out" });
        }
      })
      .catch(() => setSession({ status: "signed-out" }));
  }, []);

  if (session.status === "loading") {
    return <div className="hidden h-10 w-24 animate-pulse rounded-full bg-[rgba(36,48,71,0.08)] sm:block" />;
  }

  if (session.status === "signed-out") {
    return (
      <Link
        href="/login"
        className="hidden items-center gap-2 rounded-full bg-[#243047] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#19212f] sm:flex"
      >
        <GraduationCap className="h-4 w-4" />
        Sign in
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-full border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] px-3 py-2 text-sm font-medium text-[#314056] transition hover:border-[rgba(39,50,71,0.2)]"
      >
        <UserRound className="h-4 w-4" />
        <span className="max-w-[8rem] truncate">
          {session.name}
          {session.provider && session.provider !== "email" ? (
            <span className="ml-1 text-[0.65rem] uppercase text-[#6a7383]">{session.provider}</span>
          ) : null}
        </span>
      </Link>
      {session.role === "ADMIN" ? (
        <Link
          href="/admin/imports"
          className="rounded-full border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] px-3 py-2 text-sm font-medium text-[#2f6f6a] transition hover:bg-[rgba(47,111,106,0.14)]"
        >
          Admin
        </Link>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
            router.refresh();
          })
        }
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(39,50,71,0.12)] text-[#5a6273] transition hover:bg-[rgba(36,48,71,0.06)]"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}