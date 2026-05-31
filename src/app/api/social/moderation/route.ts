import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { blockCommunityAuthor, recordCommunityReport } from "@/lib/community-moderation";

const moderationSchema = z.object({
  action: z.enum(["report", "block"]),
  targetType: z.enum(["review", "discussion", "comment"]),
  targetId: z.string().min(1),
  authorName: z.string().min(1),
  courseSlug: z.string().optional(),
  reason: z.string().min(3).max(500)
});

export async function POST(request: NextRequest) {
  const payload = moderationSchema.parse(await request.json());

  if (payload.action === "report") {
    const report = await recordCommunityReport({
      targetType: payload.targetType,
      targetId: payload.targetId,
      authorName: payload.authorName,
      courseSlug: payload.courseSlug,
      reason: payload.reason
    });

    return NextResponse.json({ success: true, reportId: report.id, persisted: !report.id.startsWith("report-") });
  }

  await blockCommunityAuthor({
    authorName: payload.authorName,
    reason: payload.reason
  });

  return NextResponse.json({
    success: true,
    blockedAuthor: payload.authorName
  });
}
