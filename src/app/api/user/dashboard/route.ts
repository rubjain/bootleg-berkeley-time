import { NextResponse } from "next/server";
import { getDashboardView } from "@/lib/user-data";

export async function GET() {
  const dashboard = await getDashboardView();

  if (!dashboard) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  return NextResponse.json({ dashboard });
}
