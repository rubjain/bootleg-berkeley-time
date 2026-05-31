"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { AuthProviderConfig } from "@/lib/auth/providers";
import { DEMO_ACCOUNTS } from "@/lib/auth/session-constants";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  providers: AuthProviderConfig[];
  googleOAuthConfigured: boolean;
  calnetEnabled: boolean;
  calnetPreviewMode: boolean;
};

const PREVIEW_PROVIDER_EMAIL = "student@berkeley.edu";

const errorMessages: Record<string, string> = {
  google_not_configured: "Google OAuth is not configured yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.",
  calnet_not_configured: "CalNet is not enabled. Set AUTH_CALNET_ENABLED=true in .env.",
  calnet_auth_failed: "CalNet sign-in failed. Try again or use a demo account.",
  calnet_missing_ticket: "CalNet did not return a service ticket.",
  unknown_account: "No CourseMap account exists for that email. Use a seeded demo account.",
  google_auth_failed: "Google sign-in failed. Try again or use a demo account.",
  invalid_oauth_state: "Sign-in session expired. Please try again."
};

export function LoginForm({ providers, googleOAuthConfigured, calnetEnabled, calnetPreviewMode }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const showGoogle = providers.some((provider) => provider.key === "google");
  const showBerkeleyMock = providers.some((provider) => provider.key === "berkeley-mock");
  const showCalNet = calnetEnabled;
  const showOAuthSection = showGoogle || showBerkeleyMock || showCalNet;

  const urlErrorCode = searchParams.get("error");
  const urlError = urlErrorCode ? (errorMessages[urlErrorCode] ?? "Sign in failed") : null;
  const displayError = error ?? urlError;

  function signIn(email: string, provider?: AuthProviderConfig["key"]) {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, provider })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Sign in failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {showOAuthSection ? (
        <div className="space-y-3">
          {showCalNet ? (
            calnetPreviewMode ? (
              <Link
                href="/api/auth/calnet"
                className="flex w-full items-center justify-between rounded-2xl border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] px-4 py-4 text-left transition hover:border-[rgba(47,111,106,0.4)]"
              >
                <span>
                  <span className="block font-semibold text-[#19212f]">CalNet</span>
                  <span className="mt-1 block text-sm text-[#6a7383]">Preview Berkeley SSO with mock tickets</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f6a]">Preview</span>
              </Link>
            ) : (
              <Link
                href="/api/auth/calnet"
                className="flex w-full items-center justify-between rounded-2xl border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] px-4 py-4 text-left transition hover:border-[rgba(47,111,106,0.4)]"
              >
                <span>
                  <span className="block font-semibold text-[#19212f]">CalNet</span>
                  <span className="mt-1 block text-sm text-[#6a7383]">Sign in with Berkeley Central Authentication Service</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f6a]">CAS</span>
              </Link>
            )
          ) : null}

          {showGoogle && googleOAuthConfigured ? (
            <Link
              href="/api/auth/google"
              className="flex w-full items-center justify-between rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white px-4 py-4 text-left transition hover:border-[rgba(39,50,71,0.22)]"
            >
              <span>
                <span className="block font-semibold text-[#19212f]">Google</span>
                <span className="mt-1 block text-sm text-[#6a7383]">Sign in with your Google account</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f6a]">OAuth</span>
            </Link>
          ) : showGoogle ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => signIn(PREVIEW_PROVIDER_EMAIL, "google")}
              className="flex w-full items-center justify-between rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white px-4 py-4 text-left transition hover:border-[rgba(39,50,71,0.22)] disabled:opacity-60"
            >
              <span>
                <span className="block font-semibold text-[#19212f]">Google</span>
                <span className="mt-1 block text-sm text-[#6a7383]">Preview until OAuth credentials are configured</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f6a]">Preview</span>
            </button>
          ) : null}

          {showBerkeleyMock ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => signIn(PREVIEW_PROVIDER_EMAIL, "berkeley-mock")}
              className="flex w-full items-center justify-between rounded-2xl border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] px-4 py-4 text-left transition hover:border-[rgba(47,111,106,0.4)] disabled:opacity-60"
            >
              <span>
                <span className="block font-semibold text-[#19212f]">Sign in with Berkeley</span>
                <span className="mt-1 block text-sm text-[#6a7383]">Branded demo entry (maps to CalNet later)</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f6a]">Preview</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {showOAuthSection ? (
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9aa3b2]">
          <span className="h-px flex-1 bg-[rgba(39,50,71,0.12)]" />
          or pick a demo account
          <span className="h-px flex-1 bg-[rgba(39,50,71,0.12)]" />
        </div>
      ) : null}

      <div className="space-y-3">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            disabled={pending}
            onClick={() => signIn(account.email, "email")}
            className={cn(
              "flex w-full flex-col rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-4 text-left transition",
              "hover:border-[rgba(39,50,71,0.22)] hover:bg-white disabled:opacity-60"
            )}
          >
            <span className="font-semibold text-[#19212f]">{account.name}</span>
            <span className="mt-1 text-sm text-[#6a7383]">{account.email}</span>
            <span className="mt-2 text-xs text-[#8a3f20]">{account.hint}</span>
          </button>
        ))}
      </div>
      {displayError ? <p className="text-sm text-red-700">{displayError}</p> : null}
    </div>
  );
}
