import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importBerkeleyOfficialDepartments } from "@/lib/berkeley-official-sync";

const importSchema = z.object({
  html: z.string().optional(),
  schoolSlug: z.string().optional()
});

export async function POST(request: NextRequest) {
  const payload = importSchema.parse(await request.json().catch(() => ({})));

  try {
    const imported = await importBerkeleyOfficialDepartments(payload);
    return NextResponse.json({ imported });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to import Berkeley departments"
      },
      { status: 500 }
    );
  }
}
