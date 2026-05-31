import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDemoUser, upsertCompletedCourse } from "@/lib/user-data";

const courseHistorySchema = z.object({
  courseId: z.string().min(1),
  termId: z.string().optional(),
  grade: z.string().max(8).optional()
});

export async function POST(request: NextRequest) {
  const user = await getDemoUser();
  if (!user) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  const payload = courseHistorySchema.parse(await request.json());
  const history = await upsertCompletedCourse({
    userId: user.id,
    courseId: payload.courseId,
    termId: payload.termId,
    grade: payload.grade
  });

  return NextResponse.json({ history });
}
