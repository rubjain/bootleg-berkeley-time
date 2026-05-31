import { NextRequest, NextResponse } from "next/server";
import { getInstructors } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const department = request.nextUrl.searchParams.get("department") ?? undefined;
  const instructors = await getInstructors({ q, department });
  return NextResponse.json({ instructors });
}
