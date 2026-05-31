import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importBerkeleyScheduleOfferings } from "@/lib/berkeley-importer";

const importSchema = z.object({
  sourceUrl: z.string().url(),
  html: z.string().optional(),
  /** e.g. 2025-FALL — must align with existing Term rows when possible; otherwise a projected term is created. */
  termCode: z.string().min(2).max(64),
  schoolSlug: z.string().optional(),
  maxRows: z.number().int().positive().max(10000).optional()
});

export async function POST(request: NextRequest) {
  const payload = importSchema.parse(await request.json().catch(() => ({})));

  try {
    const imported = await importBerkeleyScheduleOfferings(payload);
    return NextResponse.json({ imported });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to import Berkeley schedule offerings"
      },
      { status: 500 }
    );
  }
}
