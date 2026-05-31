import { NextResponse } from "next/server";
import { syncInstructorRmpRatings } from "@/lib/rmp/sync-to-db";

export async function POST() {
  try {
    const result = await syncInstructorRmpRatings({ limit: 30 });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "RMP sync failed" },
      { status: 500 }
    );
  }
}
