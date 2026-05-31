import { NextResponse } from "next/server";
import { previewBerkeleyFullCourseImport } from "@/lib/berkeley-importer";

export async function GET() {
  return NextResponse.json({ preview: previewBerkeleyFullCourseImport() });
}
