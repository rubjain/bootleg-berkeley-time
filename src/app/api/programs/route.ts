import { NextRequest, NextResponse } from "next/server";
import { ProgramType } from "@prisma/client";
import { getPrograms } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const programs = await getPrograms({
    type: type ? (type as ProgramType) : undefined,
    q
  });
  return NextResponse.json({ programs });
}
