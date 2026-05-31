import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";
import { isCalNetEnabled, isCalNetPreviewMode } from "@/lib/auth/calnet";
import { isGoogleOAuthConfigured } from "@/lib/auth/google";
import { getEnabledAuthProviders } from "@/lib/auth/providers";

export default function LoginPage() {
  const providers = getEnabledAuthProviders();
  const googleOAuthConfigured = isGoogleOAuthConfigured();
  const calnetEnabled = isCalNetEnabled();
  const calnetPreviewMode = isCalNetPreviewMode();

  return (
    <PageShell
      eyebrow="Sign in"
      title="Sign in to CourseMap"
      description="Use Google or Berkeley preview buttons when enabled, or pick a seeded demo student. Sessions are cookie-based until production CalNet CAS is wired."
    >
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_20px_60px_rgba(60,55,48,0.08)]">
          <h2 className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">
            Demo accounts
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6a7383]">
            Each account has its own plans, friends, and course history in the seeded database.
          </p>
          <div className="mt-5">
            <Suspense fallback={<p className="text-sm text-[#6a7383]">Loading sign-in options…</p>}>
              <LoginForm
                providers={providers}
                googleOAuthConfigured={googleOAuthConfigured}
                calnetEnabled={calnetEnabled}
                calnetPreviewMode={calnetPreviewMode}
              />
            </Suspense>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-[0_20px_60px_rgba(60,55,48,0.08)]">
          <h2 className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl tracking-[-0.03em] text-[#19212f]">
            What you unlock
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[#4b5668]">
            <li>Personal dashboard with requirement progress</li>
            <li>4-year planner with drag-and-drop semesters</li>
            <li>Bookmarks, friends, and direct messages</li>
            <li>Profile editing for majors and completed courses</li>
          </ul>
          <p className="mt-6 text-sm text-[#6a7383]">
            Prefer browsing first?{" "}
            <Link href="/courses" className="font-medium text-[#1d6b6d] underline-offset-2 hover:underline">
              Explore courses without signing in
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}