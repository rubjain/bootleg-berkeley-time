import { NextResponse } from "next/server";
import { getTerms } from "@/lib/repositories";

export async function GET() {
  const terms = await getTerms();
  return NextResponse.json({ terms });
}
