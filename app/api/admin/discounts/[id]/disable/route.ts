import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { active } = await req.json() as { active?: boolean };

  const [row] = await db
    .update(discountCodes)
    .set({ isActive: active ?? false })
    .where(eq(discountCodes.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
