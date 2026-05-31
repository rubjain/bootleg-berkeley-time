import { NextResponse } from "next/server";
import { getProgramByIdOrSlug } from "@/lib/repositories";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const program = await getProgramByIdOrSlug(id);

  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ program });
}
