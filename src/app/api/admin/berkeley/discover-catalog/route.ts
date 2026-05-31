import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { discoverBerkeleyOfficialCatalogLinks } from "@/lib/berkeley-catalog-discovery";

const discoverSchema = z.object({
  schoolSlug: z.string().optional(),
  programUrls: z.array(z.string().url()).optional(),
  html: z.string().optional(),
  includeDepartmentCoursePages: z.boolean().optional(),
  scanProgramPagesForCourses: z.boolean().optional(),
  maxDepartments: z.number().int().positive().max(250).optional(),
  maxProgramPages: z.number().int().positive().max(2000).optional(),
  full: z.boolean().optional(),
  programBfsDepth: z.number().int().positive().max(5).optional(),
  departmentCodes: z.array(z.string().min(1)).optional()
});

export async function POST(request: NextRequest) {
  const payload = discoverSchema.parse(await request.json().catch(() => ({})));

  try {
    const discovery = await discoverBerkeleyOfficialCatalogLinks(payload);
    return NextResponse.json({ discovery });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to discover Berkeley catalog links"
      },
      { status: 500 }
    );
  }
}
