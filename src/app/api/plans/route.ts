import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDemoUser, createUserPlan, getUserPlanDetails } from "@/lib/user-data";

const createPlanSchema = z.object({
  title: z.string().min(1).max(120),
  catalogYear: z.string().max(20).optional()
});

export async function GET() {
  const user = await getDemoUser();
  if (!user) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  const plans = await getUserPlanDetails(user.id);
  return NextResponse.json({ plans });
}

export async function POST(request: NextRequest) {
  const user = await getDemoUser();
  if (!user?.schoolId) {
    return NextResponse.json({ error: "Demo user or school not found" }, { status: 404 });
  }

  const payload = createPlanSchema.parse(await request.json());
  const plan = await createUserPlan({
    userId: user.id,
    schoolId: user.schoolId,
    title: payload.title,
    catalogYear: payload.catalogYear
  });

  return NextResponse.json({ plan }, { status: 201 });
}
