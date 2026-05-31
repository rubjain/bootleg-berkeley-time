import type { Metadata } from "next";
import "@/app/globals.css";
import { DbStatusBanner } from "@/components/db-status-banner";
import { ExploreSubnav } from "@/components/explore-subnav";
import { PlanSubnav } from "@/components/plan-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "CourseMap",
  description: "Smarter course planning, official requirement mapping, and 4-year graduation planning."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <DbStatusBanner />
        <SiteHeader />
        <ExploreSubnav />
        <PlanSubnav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
