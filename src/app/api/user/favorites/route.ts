import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDemoUser } from "@/lib/user-data";
import { toggleFavoriteCourse } from "@/lib/user-data";

const favoriteSchema = z.object({
  courseId: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const user = await getDemoUser();
  if (!user) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  const payload = favoriteSchema.parse(await request.json());
  const result = await toggleFavoriteCourse({ userId: user.id, courseId: payload.courseId });
  return NextResponse.json(result);
}
