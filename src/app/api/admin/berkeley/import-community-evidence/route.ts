import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importCommunityEvidenceSnapshot } from "@/lib/community-evidence-import";

const importSchema = z.object({
  raw: z.string().min(1),
  sourceName: z.string().optional(),
  schoolSlug: z.string().optional()
});

export async function POST(request: NextRequest) {
  const payload = importSchema.parse(await request.json());

  try {
    const imported = await importCommunityEvidenceSnapshot(payload);
    return NextResponse.json({ imported });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to import community evidence snapshot"
      },
      { status: 500 }
    );
  }
}
