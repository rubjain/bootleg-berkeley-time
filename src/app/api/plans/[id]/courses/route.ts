import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addPlannedCourse, movePlannedCourse, removePlannedCourse } from "@/lib/user-data";

const addCourseSchema = z.object({
  semesterId: z.string().min(1),
  courseId: z.string().min(1),
  plannedTermId: z.string().optional(),
  notes: z.string().max(500).optional()
});

const deleteCourseSchema = z.object({
  plannedCourseId: z.string().min(1)
});

const moveCourseSchema = z.object({
  plannedCourseId: z.string().min(1),
  destinationSemesterId: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const payload = addCourseSchema.parse(await request.json());
  const plannedCourse = await addPlannedCourse(payload);
  return NextResponse.json({ plannedCourse }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const payload = deleteCourseSchema.parse(await request.json());
  await removePlannedCourse(payload.plannedCourseId);
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const payload = moveCourseSchema.parse(await request.json());
  const plannedCourse = await movePlannedCourse(payload);
  return NextResponse.json({ plannedCourse });
}
