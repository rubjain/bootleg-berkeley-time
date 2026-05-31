import { NextResponse } from "next/server";
import { runBerkeleyCoursedogFullImport } from "@/lib/berkeley-coursedog-import";

export async function POST() {
  try {
    const result = await runBerkeleyCoursedogFullImport({
      onProgress: (message) => console.error(`[coursedog-import] ${message}`)
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Coursedog import failed" },
      { status: 500 }
    );
  }
}
