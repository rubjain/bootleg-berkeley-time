import { NextResponse } from "next/server";
import { getSocialDashboard } from "@/lib/social-service";

export async function GET() {
  return NextResponse.json({ social: await getSocialDashboard() });
}
