import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCourseReview } from "@/lib/social-service";

const reviewSchema = z.object({
  courseSlug: z.string(),
  title: z.string().optional(),
  body: z.string().min(1),
  difficultyRating: z.number().int().min(1).max(5),
  workloadRating: z.number().int().min(1).max(5),
  usefulnessRating: z.number().int().min(1).max(5),
  recommendationRating: z.number().int().min(1).max(5),
  tags: z.array(z.string()),
  advice: z.string().optional(),
  reasonTag: z.string().optional()
});

export async function POST(request: NextRequest) {
  const payload = reviewSchema.parse(await request.json());
  const community = await createCourseReview(payload);
  return NextResponse.json({ community }, { status: 201 });
}
