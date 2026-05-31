import { NextResponse } from "next/server";
import { getCourseByIdOrSlug } from "@/lib/repositories";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const course = await getCourseByIdOrSlug(id);

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ course });
}
