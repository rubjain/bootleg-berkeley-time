import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendSocialMessage } from "@/lib/social-service";

const messageSchema = z.object({
  threadId: z.string(),
  body: z.string().min(1),
  sharedCourseCode: z.string().optional(),
  sharedPlanTitle: z.string().optional()
});

export async function POST(request: NextRequest) {
  const payload = messageSchema.parse(await request.json());
  const message = await sendSocialMessage(payload);
  return NextResponse.json({ message }, { status: 201 });
}
