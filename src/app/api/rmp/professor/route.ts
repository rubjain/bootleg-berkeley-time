import { NextRequest, NextResponse } from "next/server";
import { getInstructorRmpAlias } from "@/lib/instructor-rmp-aliases";
import { lookupLiveRmpRating, lookupLiveRmpRatingByName } from "@/lib/rmp/service";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  const slug = request.nextUrl.searchParams.get("slug");
  const department = request.nextUrl.searchParams.get("department") ?? undefined;

  if (!name && !slug) {
    return NextResponse.json({ error: "Provide name or slug query parameter." }, { status: 400 });
  }

  const rating = slug
    ? await lookupLiveRmpRating({
        slug,
        name: name ?? slug.replace(/-/g, " "),
        departmentCode: department
      })
    : await lookupLiveRmpRatingByName(name!, department);

  if (!rating) {
    return NextResponse.json(
      { error: "No Rate My Professors listing found at UC Berkeley for this instructor." },
      { status: 404 }
    );
  }

  const alias = slug ? getInstructorRmpAlias(slug) : undefined;

  return NextResponse.json({
    rating,
    aliasApplied: Boolean(alias?.searchName || alias?.rmpProfessorId)
  });
}
