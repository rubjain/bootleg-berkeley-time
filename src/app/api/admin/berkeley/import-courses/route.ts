import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractBerkeleyCatalogCoursePageUrls } from "@/lib/berkeley-importer";
import { importBerkeleyOfficialCatalogCoursePages } from "@/lib/berkeley-official-sync";

const importSchema = z
  .object({
    coursePageUrls: z.array(z.string().url()).optional(),
    /** Paste HTML from catalog search or program pages; collects `.../courses/{numericId}` links. */
    html: z.string().optional(),
    schoolSlug: z.string().optional(),
    maxCoursePages: z.number().int().positive().max(5000).optional()
  })
  .refine(
    (data) =>
      (data.coursePageUrls && data.coursePageUrls.length > 0) || Boolean(data.html && data.html.trim().length > 0),
    { message: "Provide coursePageUrls (non-empty) and/or html containing catalog course links." }
  );

export async function POST(request: NextRequest) {
  const payload = importSchema.parse(await request.json().catch(() => ({})));

  try {
    const fromHtml = payload.html?.trim() ? extractBerkeleyCatalogCoursePageUrls(payload.html) : [];
    const explicit = payload.coursePageUrls ?? [];
    const coursePageUrls = [...new Set([...explicit, ...fromHtml])];

    if (coursePageUrls.length === 0) {
      return NextResponse.json(
        { error: "No catalog course URLs found. Paste HTML that includes links like /courses/12345." },
        { status: 400 }
      );
    }

    const imported = await importBerkeleyOfficialCatalogCoursePages({
      coursePageUrls,
      schoolSlug: payload.schoolSlug,
      maxCoursePages: payload.maxCoursePages,
      onProgress: undefined
    });

    return NextResponse.json({
      imported: {
        ...imported,
        requestedUrlCount: coursePageUrls.length,
        fromHtmlCount: fromHtml.length,
        explicitUrlCount: explicit.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to import Berkeley catalog course pages"
      },
      { status: 500 }
    );
  }
}
