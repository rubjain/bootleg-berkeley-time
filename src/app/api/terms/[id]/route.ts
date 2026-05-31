import { NextResponse } from "next/server";
import { getTermByIdOrSlug } from "@/lib/repositories";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const term = await getTermByIdOrSlug(id);

  if (!term) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ term });
}
