import { NextRequest, NextResponse } from "next/server";
import { getCourseComparison } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  const left = request.nextUrl.searchParams.get("left");
  const right = request.nextUrl.searchParams.get("right");

  if (!left || !right) {
    return NextResponse.json({ error: "left and right are required" }, { status: 400 });
  }

  const comparison = await getCourseComparison(left, right);

  if (!comparison) {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  return NextResponse.json({ comparison });
}
