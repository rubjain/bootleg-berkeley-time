import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { respondToFriendRequest, sendSocialFriendRequest } from "@/lib/social-service";

const sendSchema = z.object({
  toUser: z.object({
    id: z.string(),
    name: z.string(),
    school: z.string(),
    majors: z.array(z.string()),
    minors: z.array(z.string()),
    visiblePlanTitles: z.array(z.string()),
    visibleScheduleLabels: z.array(z.string())
  }),
  message: z.string().optional()
});

const updateSchema = z.object({
  requestId: z.string(),
  action: z.enum(["accept", "decline"])
});

export async function POST(request: NextRequest) {
  const payload = sendSchema.parse(await request.json());
  const friendRequest = await sendSocialFriendRequest(payload);
  return NextResponse.json({ friendRequest }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const payload = updateSchema.parse(await request.json());
  const result = await respondToFriendRequest(payload.requestId, payload.action);
  return NextResponse.json({ result });
}
