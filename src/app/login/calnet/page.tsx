import Link from "next/link";
import { CalNetMockSignIn } from "@/components/calnet-mock-sign-in";
import { PageShell } from "@/components/page-shell";

export default function CalNetMockLoginPage() {
  return (
    <PageShell
      eyebrow="CalNet preview"
      title="Berkeley CalNet sign-in (preview)"
      description="This mock screen simulates the CalNet CAS redirect flow until production credentials are configured. Tickets are issued locally and validated by the CourseMap callback route."
    >
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-[1.75rem] border border-[rgba(47,111,106,0.25)] bg-[rgba(47,111,106,0.08)] p-5 text-sm text-[#2f4f4c]">
          <p className="font-semibold text-[#19212f]">Preview mode</p>
          <p className="mt-2 leading-6">
            Production mode redirects to{" "}
            <code className="text-[#1d6b6d]">auth.berkeley.edu/cas</code> and validates service tickets server-side.
          </p>
        </div>
        <CalNetMockSignIn />
        <p className="text-center text-sm text-[#6a7383]">
          <Link href="/login" className="font-medium text-[#1d6b6d] underline-offset-2 hover:underline">
            Back to standard login
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
