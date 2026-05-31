import { NextRequest, NextResponse } from "next/server";
import { getCourseCommunity } from "@/lib/social-service";

export async function GET(request: NextRequest) {
  const courseSlug = request.nextUrl.searchParams.get("course");

  if (!courseSlug) {
    return NextResponse.json({ error: "course is required" }, { status: 400 });
  }

  return NextResponse.json({ community: await getCourseCommunity(courseSlug) });
}
