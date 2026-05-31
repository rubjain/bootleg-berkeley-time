import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseBerkeleyOfficialSource } from "@/lib/berkeley-importer";

const parseSchema = z.object({
  sourceType: z.enum(["catalog", "schedule"]),
  sourceUrl: z.string().url(),
  html: z.string().optional(),
  /** Default true: truncate arrays in the JSON response for the admin UI. */
  preview: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  const payload = parseSchema.parse(await request.json());

  try {
    const parsed = await parseBerkeleyOfficialSource({
      sourceType: payload.sourceType,
      sourceUrl: payload.sourceUrl,
      html: payload.html,
      preview: payload.preview ?? true
    });
    return NextResponse.json({ parsed });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to parse Berkeley source"
      },
      { status: 500 }
    );
  }
}
