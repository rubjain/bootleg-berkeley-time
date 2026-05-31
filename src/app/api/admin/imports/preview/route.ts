import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { previewRequirementImport } from "@/lib/importers/requirements/pipeline";

const previewSchema = z.object({
  sourceUrl: z.string().url(),
  html: z.string().optional()
});

export async function POST(request: NextRequest) {
  const payload = previewSchema.parse(await request.json());
  const preview = previewRequirementImport(payload);
  return NextResponse.json({ preview });
}
