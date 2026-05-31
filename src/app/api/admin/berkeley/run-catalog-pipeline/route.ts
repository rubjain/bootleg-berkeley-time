import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runBerkeleyOfficialCatalogPipeline } from "@/lib/berkeley-catalog-discovery";

const pipelineSchema = z.object({
  schoolSlug: z.string().optional(),
  programUrls: z.array(z.string().url()).optional(),
  html: z.string().optional(),
  includeDepartmentCoursePages: z.boolean().optional(),
  scanProgramPagesForCourses: z.boolean().optional(),
  syncPrograms: z.boolean().optional(),
  importCourses: z.boolean().optional(),
  maxDepartments: z.number().int().positive().max(250).optional(),
  maxProgramPages: z.number().int().positive().max(2000).optional(),
  maxCoursePages: z.number().int().positive().max(10000).optional(),
  full: z.boolean().optional(),
  resumeRunId: z.string().optional(),
  syncRmp: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  const payload = pipelineSchema.parse(await request.json().catch(() => ({})));

  try {
    const result = await runBerkeleyOfficialCatalogPipeline({
      ...payload,
      includeDepartmentCoursePages: payload.includeDepartmentCoursePages ?? true,
      scanProgramPagesForCourses: payload.scanProgramPagesForCourses ?? true,
      syncPrograms: payload.syncPrograms ?? true,
      importCourses: payload.importCourses ?? true,
      syncRmp: payload.syncRmp ?? false
    });
    return NextResponse.json({
      discovery: result.discovery,
      programSync: result.programSync,
      courseImport: result.courseImport,
      syncRunId: result.syncRunId
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to run Berkeley catalog pipeline"
      },
      { status: 500 }
    );
  }
}
