import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDiscussionPost } from "@/lib/social-service";

const discussionSchema = z.object({
  courseSlug: z.string(),
  title: z.string().min(1),
  body: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const payload = discussionSchema.parse(await request.json());
  const community = await createDiscussionPost(payload);
  return NextResponse.json({ community }, { status: 201 });
}
