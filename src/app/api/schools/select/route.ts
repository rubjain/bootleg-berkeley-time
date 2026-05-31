import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SCHOOL_COOKIE } from "@/lib/school-context";
import { getSchools } from "@/lib/repositories";

const selectSchema = z.object({
  slug: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const payload = selectSchema.parse(await request.json());
  const schools = await getSchools();
  const school = schools.find((item) => item.slug === payload.slug);

  if (!school) {
    return NextResponse.json({ error: "Unknown campus" }, { status: 404 });
  }

  if (!school.isActive) {
    return NextResponse.json({ error: "Campus is not available yet" }, { status: 400 });
  }

  const response = NextResponse.json({
    slug: school.slug,
    shortName: school.shortName
  });

  response.cookies.set(SCHOOL_COOKIE, school.slug, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
