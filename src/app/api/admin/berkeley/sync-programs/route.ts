import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { syncBerkeleyOfficialPrograms } from "@/lib/berkeley-official-sync";

const syncSchema = z.object({
  programUrls: z.array(z.string().url()).optional(),
  schoolSlug: z.string().optional(),
  maxCoursePages: z.number().int().positive().optional()
});

export async function POST(request: NextRequest) {
  const payload = syncSchema.parse(await request.json().catch(() => ({})));

  try {
    const synced = await syncBerkeleyOfficialPrograms(payload);
    return NextResponse.json({ synced });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to sync Berkeley programs"
      },
      { status: 500 }
    );
  }
}
