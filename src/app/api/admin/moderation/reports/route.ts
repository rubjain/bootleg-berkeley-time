import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReportStatus } from "@prisma/client";
import { updateCommunityReportStatus } from "@/lib/community-moderation";

const updateSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"])
});

export async function PATCH(request: NextRequest) {
  const payload = updateSchema.parse(await request.json());

  try {
    const updated = await updateCommunityReportStatus(payload.reportId, payload.status as ReportStatus);
    return NextResponse.json({ success: true, reportId: updated.id, status: updated.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update report" },
      { status: 500 }
    );
  }
}
