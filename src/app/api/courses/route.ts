import { NextRequest, NextResponse } from "next/server";
import { getCourses } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const courses = await getCourses({
    q: params.get("q") ?? undefined,
    department: params.get("department") ?? undefined,
    level: params.get("level") ?? undefined,
    tone: params.get("tone") ?? undefined
  });
  return NextResponse.json({ courses });
}
