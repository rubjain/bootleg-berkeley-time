import { NextRequest, NextResponse } from "next/server";
import { ProgramSelectionType } from "@prisma/client";
import { z } from "zod";
import { getDemoUser, replaceProgramSelections } from "@/lib/user-data";

const selectionSchema = z.object({
  programId: z.string().min(1),
  selectionType: z.nativeEnum(ProgramSelectionType),
  isPrimary: z.boolean().optional()
});

const payloadSchema = z.object({
  selections: z.array(selectionSchema)
});

export async function PUT(request: NextRequest) {
  const user = await getDemoUser();
  if (!user) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  const payload = payloadSchema.parse(await request.json());
  const selections = await replaceProgramSelections({
    userId: user.id,
    selections: payload.selections
  });

  return NextResponse.json({ selections });
}
