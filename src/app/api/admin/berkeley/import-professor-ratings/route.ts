import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importProfessorRatingsSnapshot } from "@/lib/berkeley-data-import";

const importSchema = z.object({
  raw: z.string().min(1),
  sourceName: z.string().optional(),
  schoolSlug: z.string().optional()
});

export async function POST(request: NextRequest) {
  const payload = importSchema.parse(await request.json());

  try {
    const imported = await importProfessorRatingsSnapshot(payload);
    return NextResponse.json({ imported });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to import professor ratings snapshot"
      },
      { status: 500 }
    );
  }
}
