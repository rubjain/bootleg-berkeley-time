import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { syncBerkeleySupplementaryForSchool } from "@/lib/berkeley-supplementary-sync";

const bodySchema = z.object({
  schoolSlug: z.string().optional(),
  limit: z.number().int().positive().max(200).optional(),
  autoApproveHighConfidence: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const result = await syncBerkeleySupplementaryForSchool({
      schoolSlug: body.schoolSlug,
      limit: body.limit,
      autoApproveHighConfidence: body.autoApproveHighConfidence
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Supplementary sync failed" },
      { status: 500 }
    );
  }
}
