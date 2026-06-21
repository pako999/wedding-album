import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    code?: string;
    percentOff?: number;
    maxUses?: number | null;
    expiresAt?: string | null;
  };

  const code = (body.code ?? "").toUpperCase().trim();
  if (!code) return NextResponse.json({ error: "Koda je obvezna." }, { status: 400 });
  if (!body.percentOff || body.percentOff < 1 || body.percentOff > 100) {
    return NextResponse.json({ error: "Popust mora biti med 1 in 100 %." }, { status: 400 });
  }

  const [row] = await db.insert(discountCodes).values({
    code,
    percentOff: Math.round(body.percentOff),
    maxUses: body.maxUses ?? null,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    isActive: true,
  }).returning();

  return NextResponse.json(row, { status: 201 });
}
