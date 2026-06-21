import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const rows = status
    ? await db.select().from(affiliates).where(eq(affiliates.status, status as "pending" | "active" | "suspended" | "rejected")).orderBy(desc(affiliates.createdAt))
    : await db.select().from(affiliates).orderBy(desc(affiliates.createdAt));

  return NextResponse.json(rows);
}
