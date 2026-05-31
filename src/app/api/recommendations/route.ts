import { NextResponse } from "next/server";
import { getRecommendationPreview } from "@/lib/repositories";

export async function GET() {
  const recommendations = await getRecommendationPreview();
  return NextResponse.json({ recommendations });
}
