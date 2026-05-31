import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importBerkeleyCatalogCourses } from "@/lib/berkeley-importer";

const importSchema = z.object({
  sourceUrl: z.string().url(),
  html: z.string().optional(),
  schoolSlug: z.string().optional()
});

export async function POST(request: NextRequest) {
  const payload = importSchema.parse(await request.json());

  try {
    const imported = await importBerkeleyCatalogCourses(payload);
    return NextResponse.json({ imported });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to import Berkeley catalog courses"
      },
      { status: 500 }
    );
  }
}
