import { NextResponse } from "next/server";
import { getSchools } from "@/lib/repositories";

export async function GET() {
  const schools = await getSchools();
  return NextResponse.json({ schools });
}
